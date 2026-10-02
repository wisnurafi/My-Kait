"use server";

/**
 * Webhook management server actions.
 * See PRD sections 3.2, 3.2.1, 5.1, 5.3, 5.4.
 */

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { webhooks, webhookChecks, webhookHealthAlerts } from "@/lib/schema";
import { eq, and, desc, ilike } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { getActionT } from "@/server/i18n";
import { encryptWebhookUrl, decryptWebhookUrl, maskWebhookUrl } from "@/lib/crypto";
import { validateWebhookUrl, pingWebhook, sendWebhookMessage } from "@/lib/discord";
import { addWebhookSchema, updateWebhookSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/ratelimit";
type WebhookStatus = "active" | "invalid" | "rate_limited" | "unchecked";

/* --- Add webhook --- */
export async function addWebhookAction(formData: FormData) {
  const user = await requireAuth();
  const t = await getActionT("errors");

  const raw = {
    url: String(formData.get("url") ?? ""),
    name: String(formData.get("name") ?? ""),
  };

  const parsed = addWebhookSchema(t).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("payloadInvalid") };
  }

  // Check rate limit
  const rl = await checkRateLimit("addWebhook", user.id);
  if (!rl.success) {
    return { error: t("rateLimited") };
  }

  const { url, name } = parsed.data;
  const validation = validateWebhookUrl(url);
  if (!validation.valid || !validation.webhookId) {
    return { error: t("webhookUrlInvalid") };
  }

  // Check for duplicate (same discord_webhook_id for this user)
  const existing = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.userId, user.id),
        eq(webhooks.discordWebhookId, validation.webhookId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { error: t("webhookAlreadySaved") };
  }

  // Ping to validate and get channel/guild info
  const pingResult = await pingWebhook(url);
  if (pingResult.status === "invalid") {
    return { error: pingResult.error ?? t("webhookInvalid") };
  }

  // Encrypt URL
  const { encrypted, keyVersion } = encryptWebhookUrl(url);

  // Insert
  await db.insert(webhooks).values({
    userId: user.id,
    name,
    discordWebhookId: validation.webhookId,
    urlEncrypted: encrypted,
    keyVersion,
    lastStatus: pingResult.status as WebhookStatus,
    lastCheckedAt: new Date(),
    channelId: pingResult.channelId,
    channelName: pingResult.channelName,
    guildId: pingResult.guildId,
    guildName: pingResult.guildName,
  });

  revalidatePath("/webhooks");
  return { success: true };
}

/* --- Get webhooks list --- */
export async function getWebhooks(search?: string) {
  const user = await requireAuth();

  const query = db
    .select({
      id: webhooks.id,
      name: webhooks.name,
      discordWebhookId: webhooks.discordWebhookId,
      lastStatus: webhooks.lastStatus,
      lastCheckedAt: webhooks.lastCheckedAt,
      lastUsedAt: webhooks.lastUsedAt,
      channelName: webhooks.channelName,
      guildName: webhooks.guildName,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .where(eq(webhooks.userId, user.id))
    .orderBy(desc(webhooks.createdAt))
    .$dynamic();

  if (search) {
    query.where(
      and(
        eq(webhooks.userId, user.id),
        ilike(webhooks.name, `%${search}%`),
      ),
    );
  }

  return query;
}

/* --- Update webhook name --- */
export async function updateWebhookAction(formData: FormData) {
  const user = await requireAuth();
  const t = await getActionT("errors");

  const parsed = updateWebhookSchema(t).safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("payloadInvalid") };
  }

  // Verify ownership
  const existing = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, parsed.data.id),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    return { error: t("webhookNotFound") };
  }

  await db
    .update(webhooks)
    .set({ name: parsed.data.name })
    .where(eq(webhooks.id, parsed.data.id));

  revalidatePath("/webhooks");
  return { success: true };
}

/* --- Delete webhook --- */
export async function deleteWebhookAction(formData: FormData) {
  const user = await requireAuth();
  const t = await getActionT("errors");
  const id = String(formData.get("id") ?? "");

  // Verify ownership before delete
  const existing = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, id),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) {
    return { error: t("webhookNotFound") };
  }

  await db.delete(webhooks).where(eq(webhooks.id, id));

  revalidatePath("/webhooks");
  return { success: true };
}

/* --- Ping webhook --- */
export async function pingWebhookAction(formData: FormData) {
  const user = await requireAuth();
  const t = await getActionT("errors");
  const webhookId = String(formData.get("webhookId") ?? "");

  const rl = await checkRateLimit("ping", user.id);
  if (!rl.success) {
    return { error: t("rateLimited") };
  }

  // Get webhook
  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) {
    return { error: t("webhookNotFound") };
  }

  // Decrypt URL
  const url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);

  // Ping
  const result = await pingWebhook(url);

  // Save check record
  await db.insert(webhookChecks).values({
    webhookId,
    status: result.status as WebhookStatus,
    httpStatus: result.httpStatus,
    latencyMs: result.latencyMs,
    error: result.error,
  });

  // Update webhook status
  await db
    .update(webhooks)
    .set({
      lastStatus: result.status as WebhookStatus,
      lastCheckedAt: new Date(),
      channelId: result.channelId,
      channelName: result.channelName,
      guildId: result.guildId,
      guildName: result.guildName,
    })
    .where(eq(webhooks.id, webhookId));

  revalidatePath("/webhooks");
  return { success: true, result };
}

/* --- Send test message --- */
export async function sendTestMessageAction(formData: FormData) {
  const user = await requireAuth();
  const t = await getActionT("errors");
  const webhookId = String(formData.get("webhookId") ?? "");

  const rl = await checkRateLimit("send", user.id);
  if (!rl.success) {
    return { error: t("rateLimited") };
  }

  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) {
    return { error: t("webhookNotFound") };
  }

  const url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
  const result = await sendWebhookMessage(url, {
    content: "🪝 **My Kait** — Pesan tes ini dikirim dari Webhook Studio.",
    username: "My Kait Test",
  });

  if (!result.success) {
    // Mark webhook as invalid if 404/401
    if (result.httpStatus === 404 || result.httpStatus === 401) {
      await db
        .update(webhooks)
        .set({ lastStatus: "invalid" as WebhookStatus })
        .where(eq(webhooks.id, webhookId));
    }
    return { error: result.error ?? t("testSendFailed") };
  }

  // Update last used
  await db
    .update(webhooks)
    .set({ lastUsedAt: new Date() })
    .where(eq(webhooks.id, webhookId));

  revalidatePath("/webhooks");
  return { success: true };
}

/* --- Get ping history --- */
export async function getPingHistory(webhookId: string) {
  const user = await requireAuth();

  // Verify ownership
  const wh = await db
    .select({ id: webhooks.id })
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) return [];

  return db
    .select()
    .from(webhookChecks)
    .where(eq(webhookChecks.webhookId, webhookId))
    .orderBy(desc(webhookChecks.createdAt))
    .limit(20);
}

/* --- Ping all webhooks --- */
export async function pingAllWebhooksAction() {
  const user = await requireAuth();

  const allWebhooks = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.userId, user.id));

  const results: { id: string; name: string; status: string }[] = [];

  for (const wh of allWebhooks) {
    const url = decryptWebhookUrl(wh.urlEncrypted, wh.keyVersion);
    const result = await pingWebhook(url);

    await db.insert(webhookChecks).values({
      webhookId: wh.id,
      status: result.status as WebhookStatus,
      httpStatus: result.httpStatus,
      latencyMs: result.latencyMs,
      error: result.error,
    });

    await db
      .update(webhooks)
      .set({
        lastStatus: result.status as WebhookStatus,
        lastCheckedAt: new Date(),
        channelId: result.channelId,
        channelName: result.channelName,
        guildId: result.guildId,
        guildName: result.guildName,
      })
      .where(eq(webhooks.id, wh.id));

    results.push({ id: wh.id, name: wh.name, status: result.status });
  }

  revalidatePath("/webhooks");
  return { success: true, results };
}

/* --- Get decrypted URL (internal use only, never returned to client) --- */
export async function getDecryptedWebhookUrl(webhookId: string, userId: string): Promise<string | null> {
  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, userId),
      ),
    )
    .limit(1);

  if (wh.length === 0) return null;
  return decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
}

/* --- Get masked URL for display --- */
export async function getMaskedWebhookUrl(webhookId: string): Promise<string> {
  const user = await requireAuth();

  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, webhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) return "••••••••";
  const url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
  return maskWebhookUrl(url);
}

/* --- Health alerts --- */

export async function getHealthAlerts() {
  const user = await requireAuth();

  const alerts = await db
    .select({
      id: webhookHealthAlerts.id,
      type: webhookHealthAlerts.type,
      message: webhookHealthAlerts.message,
      createdAt: webhookHealthAlerts.createdAt,
      acknowledgedAt: webhookHealthAlerts.acknowledgedAt,
      webhookId: webhookHealthAlerts.webhookId,
      webhookName: webhooks.name,
    })
    .from(webhookHealthAlerts)
    .innerJoin(webhooks, eq(webhookHealthAlerts.webhookId, webhooks.id))
    .where(eq(webhookHealthAlerts.userId, user.id))
    .orderBy(desc(webhookHealthAlerts.createdAt))
    .limit(50);

  const unacked = alerts.filter((a) => !a.acknowledgedAt).length;
  return { alerts, unacknowledgedCount: unacked };
}

export async function acknowledgeAlertAction(alertId: string) {
  const user = await requireAuth();

  await db
    .update(webhookHealthAlerts)
    .set({ acknowledgedAt: new Date() })
    .where(
      and(
        eq(webhookHealthAlerts.id, alertId),
        eq(webhookHealthAlerts.userId, user.id),
      ),
    );

  revalidatePath("/webhooks");
  return { success: true };
}

export async function acknowledgeAllAlertsAction() {
  const user = await requireAuth();

  await db
    .update(webhookHealthAlerts)
    .set({ acknowledgedAt: new Date() })
    .where(eq(webhookHealthAlerts.userId, user.id));

  revalidatePath("/webhooks");
  return { success: true };
}
