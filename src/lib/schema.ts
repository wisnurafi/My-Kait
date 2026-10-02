/**
 * Database schema for My Kait.
 * See PRD section 6.2 for data model details.
 *
 * Tables:
 * - users
 * - webhooks (encrypted URL)
 * - webhook_checks (ping history)
 * - templates
 * - template_shares
 * - message_logs
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* --- Enums --- */

export const webhookStatusEnum = pgEnum("webhook_status", [
  "active",
  "invalid",
  "rate_limited",
  "unchecked",
]);

export const messageStatusEnum = pgEnum("message_status", [
  "sent",
  "failed",
  "rate_limited",
  "edited",
  "deleted",
]);

export const messageModeEnum = pgEnum("message_mode", [
  "normal",
  "embed",
  "both",
]);

/* --- Tables --- */

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  globalName: text("global_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const webhooks = pgTable(
  "webhooks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    discordWebhookId: text("discord_webhook_id"),
    urlEncrypted: text("url_encrypted").notNull(),
    keyVersion: text("key_version").notNull(),
    lastStatus: webhookStatusEnum("last_status").notNull().default("unchecked"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    channelId: text("channel_id"),
    channelName: text("channel_name"),
    guildId: text("guild_id"),
    guildName: text("guild_name"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => ({
    userIdx: index("webhooks_user_id_idx").on(table.userId),
    discordIdIdx: index("webhooks_discord_webhook_id_idx").on(table.discordWebhookId),
    nameIdx: index("webhooks_name_idx").on(table.userId, table.name),
  }),
);

export const webhookChecks = pgTable(
  "webhook_checks",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    webhookId: text("webhook_id")
      .notNull()
      .references(() => webhooks.id, { onDelete: "cascade" }),
    status: webhookStatusEnum("status").notNull(),
    httpStatus: integer("http_status"),
    latencyMs: integer("latency_ms"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    webhookIdx: index("webhook_checks_webhook_id_idx").on(table.webhookId),
    createdIdx: index("webhook_checks_created_at_idx").on(table.createdAt),
  }),
);

export const templates = pgTable(
  "templates",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    tags: text("tags").array().default([]),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("templates_user_id_idx").on(table.userId),
    nameIdx: index("templates_name_idx").on(table.userId, table.name),
  }),
);

export const templateShares = pgTable(
  "template_shares",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    importCount: integer("import_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    slugIdx: uniqueIndex("template_shares_slug_idx").on(table.slug),
  }),
);

export const messageLogs = pgTable(
  "message_logs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    webhookId: text("webhook_id").references(() => webhooks.id, {
      onDelete: "set null",
    }),
    webhookNameSnapshot: text("webhook_name_snapshot").notNull(),
    mode: messageModeEnum("mode").notNull(),
    payload: jsonb("payload"),
    status: messageStatusEnum("status").notNull(),
    httpStatus: integer("http_status"),
    latencyMs: integer("latency_ms"),
    discordMessageId: text("discord_message_id"),
    error: text("error"),
    source: text("source").notNull().default("send"), // send | edit | delete | resend
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userCreatedIdx: index("message_logs_user_created_idx").on(table.userId, table.createdAt),
    userStatusIdx: index("message_logs_user_status_idx").on(table.userId, table.status),
    webhookIdx: index("message_logs_webhook_id_idx").on(table.webhookId),
  }),
);

/* --- Relations --- */

export const usersRelations = relations(users, ({ many }) => ({
  webhooks: many(webhooks),
  templates: many(templates),
  messageLogs: many(messageLogs),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, { fields: [webhooks.userId], references: [users.id] }),
  checks: many(webhookChecks),
  messageLogs: many(messageLogs),
}));

export const webhookChecksRelations = relations(webhookChecks, ({ one }) => ({
  webhook: one(webhooks, { fields: [webhookChecks.webhookId], references: [webhooks.id] }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  user: one(users, { fields: [templates.userId], references: [users.id] }),
  shares: many(templateShares),
}));

export const templateSharesRelations = relations(templateShares, ({ one }) => ({
  template: one(templates, { fields: [templateShares.templateId], references: [templates.id] }),
}));

export const messageLogsRelations = relations(messageLogs, ({ one }) => ({
  user: one(users, { fields: [messageLogs.userId], references: [users.id] }),
  webhook: one(webhooks, { fields: [messageLogs.webhookId], references: [webhooks.id] }),
}));

/* --- Type aliases for enums --- */

export type WebhookStatus = (typeof webhookStatusEnum.enumValues)[number];
export type MessageStatus = (typeof messageStatusEnum.enumValues)[number];
export type MessageMode = (typeof messageModeEnum.enumValues)[number];

/* --- Types --- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookCheck = typeof webhookChecks.$inferSelect;
export type NewWebhookCheck = typeof webhookChecks.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type TemplateShare = typeof templateShares.$inferSelect;
export type MessageLog = typeof messageLogs.$inferSelect;
export type NewMessageLog = typeof messageLogs.$inferInsert;
