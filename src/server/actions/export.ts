"use server";

/**
 * User data export (GDPR-style).
 * Returns all user-owned data as JSON.
 */

import { db } from "@/lib/db";
import { webhooks, templates, messageLogs, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function exportUserDataAction() {
  const user = await requireAuth();

  const [userRow] = await db
    .select({
      id: users.id,
      discordId: users.discordId,
      username: users.username,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const userWebhooks = await db
    .select({
      id: webhooks.id,
      name: webhooks.name,
      lastStatus: webhooks.lastStatus,
      channelName: webhooks.channelName,
      guildName: webhooks.guildName,
      createdAt: webhooks.createdAt,
      lastUsedAt: webhooks.lastUsedAt,
    })
    .from(webhooks)
    .where(eq(webhooks.userId, user.id));

  const userTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.userId, user.id));

  const userLogs = await db
    .select({
      id: messageLogs.id,
      webhookNameSnapshot: messageLogs.webhookNameSnapshot,
      mode: messageLogs.mode,
      status: messageLogs.status,
      httpStatus: messageLogs.httpStatus,
      latencyMs: messageLogs.latencyMs,
      error: messageLogs.error,
      source: messageLogs.source,
      createdAt: messageLogs.createdAt,
    })
    .from(messageLogs)
    .where(eq(messageLogs.userId, user.id))
    .limit(1000);

  return {
    success: true,
    data: {
      exportedAt: new Date().toISOString(),
      user: userRow,
      webhooks: userWebhooks,
      templates: userTemplates,
      messageLogs: userLogs,
    },
  };
}
