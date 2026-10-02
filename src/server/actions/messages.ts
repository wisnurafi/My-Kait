"use server";

/**
 * Message sending & logging server actions.
 * See PRD sections 3.4, 3.5, 3.8, 5.4, 6.3.
 */

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { webhooks, messageLogs } from "@/lib/schema";
import { eq, and, desc, gte, lte, ilike, sql, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { decryptWebhookUrl } from "@/lib/crypto";
import {
  sendWebhookMessage,
  editWebhookMessage,
  deleteWebhookMessage,
  validateWebhookUrl,
} from "@/lib/discord";
import { sendRequestSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/ratelimit";
import { substitutePayloadVariables } from "@/lib/template-vars";
type MessageStatus = "sent" | "failed" | "rate_limited" | "edited" | "deleted";
type MessageMode = "normal" | "embed" | "both";

/* --- Send message --- */
export async function sendMessageAction(prevState: unknown, formData: FormData) {
  const user = await requireAuth();

  const rl = await checkRateLimit("send", user.id);
  if (!rl.success) {
    return { error: "Terlalu banyak pengiriman. Coba lagi nanti." };
  }

  // Parse payload from formData
  const payloadStr = String(formData.get("payload") ?? "");
  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return { error: "Payload tidak valid" };
  }

  const mode = String(formData.get("mode") ?? "normal") as MessageMode;
  const webhookId = String(formData.get("webhookId") ?? "") || undefined;
  const manualUrl = String(formData.get("manualUrl") ?? "") || undefined;
  const savePayload = formData.get("savePayload") !== "false";
  const multiTargetRaw = String(formData.get("multiTarget") ?? "") || "";
  const multiTargetIds = multiTargetRaw ? multiTargetRaw.split(",").filter(Boolean) : [];
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "") || undefined;

  // Idempotency check: if this key was already processed, return cached result
  if (idempotencyKey) {
    const existing = await db
      .select()
      .from(messageLogs)
      .where(
        and(
          eq(messageLogs.userId, user.id),
          eq(messageLogs.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      const prev = existing[0];
      if (prev.status === "sent") {
        return {
          success: true,
          messageId: prev.discordMessageId ?? undefined,
          message: "Pesan terkirim! (duplikat dicegah)",
          deduplicated: true,
        };
      }
      return { error: prev.error ?? "Pengiriman sebelumnya gagal" };
    }
  }

  // Validate
  const parsed = sendRequestSchema.safeParse({
    webhookId,
    manualUrl,
    payload,
    mode,
    savePayload,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Payload tidak valid" };
  }

  // Determine which webhook URL(s) to use
  let url: string;
  let webhookRecord: { id: string; name: string } | null = null;
  
  // Multi-target: send to multiple webhooks
  if (multiTargetIds.length > 1) {
    const results: Array<{ id: string; name: string; success: boolean; messageId?: string; error?: string }> = [];
    
    for (const targetId of multiTargetIds) {
      const wh = await db
        .select()
        .from(webhooks)
        .where(
          and(
            eq(webhooks.id, targetId),
            eq(webhooks.userId, user.id),
          ),
        )
        .limit(1);

      if (wh.length === 0) continue;

      // Skip webhooks marked as invalid
      if (wh[0].lastStatus === "invalid") {
        results.push({ id: wh[0].id, name: wh[0].name, success: false, error: "Webhook tidak valid" });
        continue;
      }
      
      const targetUrl = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
      const processedPayload = substitutePayloadVariables(payload);
      const start = Date.now();
      const result = await sendWebhookMessage(targetUrl, processedPayload);
      const latencyMs = Date.now() - start;

      let status: MessageStatus;
      if (result.success) status = "sent";
      else if (result.rateLimited) status = "rate_limited";
      else status = "failed";

      await db.insert(messageLogs).values({
        userId: user.id,
        webhookId: wh[0].id,
        webhookNameSnapshot: wh[0].name,
        mode,
        payload: savePayload ? processedPayload : null,
        status,
        httpStatus: result.httpStatus,
        latencyMs,
        discordMessageId: result.messageId,
        error: result.error,
        source: "send",
      });

      // Update webhook
      await db.update(webhooks).set({ lastUsedAt: new Date() }).where(eq(webhooks.id, wh[0].id));
      if (result.httpStatus === 404 || result.httpStatus === 401) {
        await db.update(webhooks).set({ lastStatus: "invalid" }).where(eq(webhooks.id, wh[0].id));
      }

      results.push({ id: wh[0].id, name: wh[0].name, success: result.success, messageId: result.messageId, error: result.error });
    }

    revalidatePath("/logs");
    const successCount = results.filter((r) => r.success).length;
    if (successCount === 0) {
      return { error: "Semua pengiriman gagal", results };
    }
    return {
      success: true,
      message: `${successCount}/${results.length} pesan terkirim!`,
      results,
    };
  }

  // Single target
  if (parsed.data.webhookId) {
    const wh = await db
      .select()
      .from(webhooks)
      .where(
        and(
          eq(webhooks.id, parsed.data.webhookId),
          eq(webhooks.userId, user.id),
        ),
      )
      .limit(1);

    if (wh.length === 0) {
      return { error: "Webhook tidak ditemukan" };
    }

    url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
    webhookRecord = { id: wh[0].id, name: wh[0].name };

    // Check if webhook is valid
    if (wh[0].lastStatus === "invalid") {
      return { error: "Webhook ditandai tidak valid. Ping ulang untuk mengecek." };
    }
  } else if (parsed.data.manualUrl) {
    const validation = validateWebhookUrl(parsed.data.manualUrl);
    if (!validation.valid) {
      return { error: "URL webhook tidak valid" };
    }
    url = parsed.data.manualUrl;
  } else {
    return { error: "Pilih webhook atau tempel URL manual" };
  }

  // Substitute template variables
  const processedPayload = substitutePayloadVariables(payload);

  // Send
  const start = Date.now();
  const result = await sendWebhookMessage(url, processedPayload);
  const latencyMs = Date.now() - start;

  // Determine status
  let status: MessageStatus;
  if (result.success) {
    status = "sent";
  } else if (result.rateLimited) {
    status = "rate_limited";
  } else {
    status = "failed";
  }

  // Log to database
  await db.insert(messageLogs).values({
    userId: user.id,
    webhookId: webhookRecord?.id ?? null,
    webhookNameSnapshot: webhookRecord?.name ?? "Manual URL",
    mode,
    payload: savePayload ? processedPayload : null,
    status,
    httpStatus: result.httpStatus,
    latencyMs,
    discordMessageId: result.messageId,
    error: result.error,
    source: "send",
    idempotencyKey: idempotencyKey ?? null,
  });

  // Update webhook lastUsedAt
  if (webhookRecord) {
    await db
      .update(webhooks)
      .set({ lastUsedAt: new Date() })
      .where(eq(webhooks.id, webhookRecord.id));

    // Mark webhook invalid if 404/401
    if (result.httpStatus === 404 || result.httpStatus === 401) {
      await db
        .update(webhooks)
        .set({ lastStatus: "invalid" })
        .where(eq(webhooks.id, webhookRecord.id));
    }
  }

  revalidatePath("/logs");
  if (!result.success) {
    return { error: result.error ?? "Gagal mengirim pesan" };
  }
  return {
    success: true,
    messageId: result.messageId,
    message: "Pesan terkirim!",
  };
}

/* --- Edit sent message --- */
export async function editMessageAction(prevState: unknown, formData: FormData) {
  const user = await requireAuth();

  const logId = String(formData.get("logId") ?? "");
  const payloadStr = String(formData.get("payload") ?? "");
  const overrideWebhookId = String(formData.get("webhookId") ?? "") || undefined;
  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return { error: "Payload tidak valid" };
  }

  // Get the log record
  const log = await db
    .select()
    .from(messageLogs)
    .where(
      and(
        eq(messageLogs.id, logId),
        eq(messageLogs.userId, user.id),
      ),
    )
    .limit(1);

  if (log.length === 0 || !log[0].discordMessageId) {
    return { error: "Pesan tidak ditemukan atau tidak bisa diedit" };
  }

  // Use log's webhookId, or override from form (for manual URL sends)
  const effectiveWebhookId = log[0].webhookId ?? overrideWebhookId;
  if (!effectiveWebhookId) {
    return { error: "Pilih webhook untuk mengedit pesan ini" };
  }

  // Get webhook URL
  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, effectiveWebhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) {
    return { error: "Webhook tidak ditemukan" };
  }

  const url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
  const result = await editWebhookMessage(url, log[0].discordMessageId, payload);

  // Log the edit
  await db.insert(messageLogs).values({
    userId: user.id,
    webhookId: effectiveWebhookId,
    webhookNameSnapshot: wh[0].name,
    mode: log[0].mode,
    payload,
    status: result.success ? "edited" : "failed",
    httpStatus: result.httpStatus,
    discordMessageId: log[0].discordMessageId,
    error: result.error,
    source: "edit",
  });

  if (!result.success) {
    return { error: result.error ?? "Gagal mengedit pesan" };
  }

  revalidatePath("/logs");
  return { success: true, message: "Pesan diedit!" };
}

/* --- Delete sent message --- */
export async function deleteMessageAction(prevState: unknown, formData: FormData) {
  const user = await requireAuth();

  const logId = String(formData.get("logId") ?? "");

  const log = await db
    .select()
    .from(messageLogs)
    .where(
      and(
        eq(messageLogs.id, logId),
        eq(messageLogs.userId, user.id),
      ),
    )
    .limit(1);

  if (log.length === 0 || !log[0].discordMessageId || !log[0].webhookId) {
    return { error: "Pesan tidak ditemukan atau tidak bisa dihapus" };
  }

  const wh = await db
    .select()
    .from(webhooks)
    .where(
      and(
        eq(webhooks.id, log[0].webhookId),
        eq(webhooks.userId, user.id),
      ),
    )
    .limit(1);

  if (wh.length === 0) {
    return { error: "Webhook tidak ditemukan" };
  }

  const url = decryptWebhookUrl(wh[0].urlEncrypted, wh[0].keyVersion);
  const result = await deleteWebhookMessage(url, log[0].discordMessageId);

  await db.insert(messageLogs).values({
    userId: user.id,
    webhookId: log[0].webhookId,
    webhookNameSnapshot: wh[0].name,
    mode: log[0].mode,
    status: result.success ? "deleted" : "failed",
    httpStatus: result.httpStatus,
    discordMessageId: log[0].discordMessageId,
    error: result.error,
    source: "delete",
  });

  if (!result.success) {
    return { error: result.error ?? "Gagal menghapus pesan" };
  }

  revalidatePath("/logs");
  return { success: true, message: "Pesan dihapus!" };
}

/* --- Get logs with filters --- */
export async function getLogs(filters: {
  status?: string;
  webhookId?: string;
  mode?: string;
  source?: string;
  search?: string;
  datePreset?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const user = await requireAuth();

  const conditions = [eq(messageLogs.userId, user.id)];

  if (filters.status) {
    conditions.push(eq(messageLogs.status, filters.status as MessageStatus));
  }
  if (filters.webhookId) {
    conditions.push(eq(messageLogs.webhookId, filters.webhookId));
  }
  if (filters.mode) {
    conditions.push(eq(messageLogs.mode, filters.mode as MessageMode));
  }
  if (filters.source) {
    conditions.push(eq(messageLogs.source, filters.source));
  }

  // Date filtering
  const now = new Date();
  if (filters.datePreset === "today") {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    conditions.push(gte(messageLogs.createdAt, startOfDay));
  } else if (filters.datePreset === "7d") {
    conditions.push(gte(messageLogs.createdAt, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)));
  } else if (filters.datePreset === "30d") {
    conditions.push(gte(messageLogs.createdAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
  } else if (filters.datePreset === "custom") {
    if (filters.dateFrom) {
      conditions.push(gte(messageLogs.createdAt, new Date(filters.dateFrom)));
    }
    if (filters.dateTo) {
      conditions.push(lte(messageLogs.createdAt, new Date(filters.dateTo)));
    }
  }

  // Search
  if (filters.search) {
    conditions.push(
      sql`(${messageLogs.webhookNameSnapshot} ILIKE ${`%${filters.search}%`} OR CAST(${messageLogs.payload} AS TEXT) ILIKE ${`%${filters.search}%`} OR ${messageLogs.discordMessageId} ILIKE ${`%${filters.search}%`})`,
    );
  }

  const sort = filters.sort ?? "newest";
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const totalResult = await db
    .select({ total: count() })
    .from(messageLogs)
    .where(and(...conditions));

  const total = totalResult[0]?.total ?? 0;

  const logs = await db
    .select()
    .from(messageLogs)
    .where(and(...conditions))
    .orderBy(sort === "oldest" ? (messageLogs.createdAt as any) : desc(messageLogs.createdAt))
    .limit(perPage)
    .offset((page - 1) * perPage);

  // Summary
  const sentCount = await db
    .select({ total: count() })
    .from(messageLogs)
    .where(
      and(
        eq(messageLogs.userId, user.id),
        eq(messageLogs.status, "sent"),
      ),
    );
  const failedCount = await db
    .select({ total: count() })
    .from(messageLogs)
    .where(
      and(
        eq(messageLogs.userId, user.id),
        eq(messageLogs.status, "failed"),
      ),
    );

  return {
    logs,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    summary: {
      sent: sentCount[0]?.total ?? 0,
      failed: failedCount[0]?.total ?? 0,
      successRate: total > 0 ? Math.round(((sentCount[0]?.total ?? 0) / total) * 100) : 0,
    },
  };
}

/* --- Get single log detail --- */
export async function getLogDetail(logId: string) {
  const user = await requireAuth();

  const log = await db
    .select()
    .from(messageLogs)
    .where(
      and(
        eq(messageLogs.id, logId),
        eq(messageLogs.userId, user.id),
      ),
    )
    .limit(1);

  return log[0] ?? null;
}

/* --- Delete all logs --- */
export async function clearLogsAction() {
  const user = await requireAuth();

  await db
    .delete(messageLogs)
    .where(eq(messageLogs.userId, user.id));

  revalidatePath("/logs");
  return { success: true };
}

/* --- Delete account --- */
export async function deleteAccountAction() {
  const user = await requireAuth();

  // CASCADE will handle all related records
  await db.delete(webhooks).where(eq(webhooks.userId, user.id));
  await db
    .delete(messageLogs)
    .where(eq(messageLogs.userId, user.id));

  // Also delete templates (cascade handles shares)
  // Users table delete handled by auth callback

  revalidatePath("/");
  return { success: true };
}
