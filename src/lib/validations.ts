/**
 * Zod validation schemas for all inputs.
 * See PRD section 5.4 — "Validasi semua input dengan Zod di server".
 * Discord limits from PRD 3.3 and Discord API docs.
 */

import { z } from "zod";

/* --- Webhook management --- */

export const webhookUrlSchema = z
  .string()
  .url("URL tidak valid")
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        const allowed = [
          "discord.com",
          "discordapp.com",
          "ptb.discord.com",
          "ptb.discordapp.com",
          "canary.discord.com",
          "canary.discordapp.com",
        ];
        return allowed.includes(parsed.hostname) && /^\/api\/webhooks\/\d+\/[\w-]+$/.test(
          parsed.pathname,
        );
      } catch {
        return false;
      }
    },
    "URL bukan webhook Discord yang valid",
  );

export const addWebhookSchema = z.object({
  url: webhookUrlSchema,
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
});

export const updateWebhookSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
});

/* --- Message payload --- */

// Discord embed field limits
export const embedFieldSchema = z.object({
  name: z.string().min(1).max(256),
  value: z.string().min(1).max(1024),
  inline: z.boolean().optional().default(false),
});

export const embedSchema = z.object({
  title: z.string().max(256).optional(),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().max(4096).optional(),
  color: z.number().int().min(0).max(0xffffff).optional(),
  author: z
    .object({
      name: z.string().max(256),
      url: z.string().url().optional().or(z.literal("")),
      icon_url: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  thumbnail: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  image: z
    .object({
      url: z.string().url(),
    })
    .optional(),
  fields: z.array(embedFieldSchema).max(25).optional(),
  footer: z
    .object({
      text: z.string().max(2048),
      icon_url: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  timestamp: z.string().datetime().optional().or(z.boolean()),
});

// Full embed array validation with total char limit
export const embedsSchema = z
  .array(embedSchema)
  .max(10, "Maksimal 10 embed per pesan")
  .refine(
    (embeds) => {
      const totalChars = embeds.reduce((sum, e) => {
        return (
          sum +
          (e.title?.length ?? 0) +
          (e.description?.length ?? 0) +
          (e.author?.name?.length ?? 0) +
          (e.footer?.text?.length ?? 0) +
          (e.fields?.reduce((f, field) => f + field.name.length + field.value.length, 0) ?? 0)
        );
      }, 0);
      return totalChars <= 6000;
    },
    "Total karakter semua embed maksimal 6000",
  );

export const sendPayloadSchema = z.object({
  content: z.string().max(2000).optional(),
  username: z.string().max(80).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  tts: z.boolean().optional(),
  thread_id: z.string().optional(),
  allowed_mentions: z
    .object({
      parse: z.array(z.enum(["roles", "users", "everyone"])).optional(),
      roles: z.array(z.string()).optional(),
      users: z.array(z.string()).optional(),
      replied_user: z.boolean().optional(),
    })
    .optional(),
  suppress_embeds: z.boolean().optional(),
  embeds: embedsSchema.optional(),
  applied_tags: z.array(z.string()).optional(),
});

export type SendPayload = z.infer<typeof sendPayloadSchema>;

/* --- Message mode --- */

export const messageModeSchema = z.enum(["normal", "embed", "both"]);

/* --- Send request from editor --- */

export const sendRequestSchema = z.object({
  webhookId: z.string().optional(), // saved webhook
  manualUrl: webhookUrlSchema.optional(), // manual URL
  payload: sendPayloadSchema,
  mode: messageModeSchema,
  savePayload: z.boolean().optional().default(true), // log payload or not
});

/* --- Template --- */

export const templateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  payload: sendPayloadSchema,
});

/* --- Log filter params --- */

export const logFilterSchema = z.object({
  status: z
    .enum(["sent", "failed", "rate_limited", "edited", "deleted"])
    .optional(),
  webhookId: z.string().optional(),
  mode: z.enum(["normal", "embed", "both"]).optional(),
  source: z.enum(["send", "edit", "delete", "resend"]).optional(),
  search: z.string().optional(),
  datePreset: z
    .enum(["today", "7d", "30d", "custom"])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(["newest", "oldest"]).optional().default("newest"),
  page: z.number().int().min(1).optional().default(1),
  perPage: z.number().int().min(1).max(100).optional().default(20),
});

export type LogFilter = z.infer<typeof logFilterSchema>;

/* --- Account deletion --- */

export const deleteAccountSchema = z.object({
  confirm: z.literal("DELETE"),
});

/* --- Template report (public; anonymous allowed) --- */

export const reportTemplateSchema = z.object({
  templateId: z.string().min(1, "Template tidak valid"),
  reason: z
    .string()
    .min(10, "Alasan minimal 10 karakter")
    .max(1000, "Alasan maksimal 1000 karakter"),
});

export type ReportTemplateInput = z.infer<typeof reportTemplateSchema>;
