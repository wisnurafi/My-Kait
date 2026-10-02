/**
 * Discord webhook URL validation & interaction.
 * See PRD sections 3.2, 3.2.1, 3.4, 5.4.
 *
 * Anti-SSRF: only discord.com / discordapp.com hosts allowed.
 */

import { env } from "./env";

const ALLOWED_HOSTS = [
  "discord.com",
  "discordapp.com",
  "ptb.discord.com",
  "ptb.discordapp.com",
  "canary.discord.com",
  "canary.discordapp.com",
];

const WEBHOOK_PATH_REGEX = /^\/api\/webhooks\/\d+\/[\w-]+$/;

/**
 * Validate that a URL is a legitimate Discord webhook URL.
 * Throws on invalid — does not make a network request.
 */
export function validateWebhookUrl(url: string): {
  valid: boolean;
  webhookId?: string;
  token?: string;
} {
  try {
    const parsed = new URL(url);

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return { valid: false };
    }

    if (!WEBHOOK_PATH_REGEX.test(parsed.pathname)) {
      return { valid: false };
    }

    const parts = parsed.pathname.split("/");
    // /api/webhooks/{id}/{token}
    const webhookId = parts[3];
    const token = parts[4];

    return { valid: true, webhookId, token };
  } catch {
    return { valid: false };
  }
}

export type PingResult = {
  status: "active" | "invalid" | "rate_limited" | "error";
  httpStatus: number | null;
  latencyMs: number | null;
  error?: string;
  webhookName?: string;
  channelId?: string;
  channelName?: string;
  guildId?: string;
  guildName?: string;
};

/**
 * Ping a webhook — silent GET request (no message appears in channel).
 * See PRD 3.2.1.
 */
export async function pingWebhook(url: string): Promise<PingResult> {
  const start = Date.now();
  const validation = validateWebhookUrl(url);
  if (!validation.valid) {
    return {
      status: "invalid",
      httpStatus: null,
      latencyMs: null,
      error: "URL bukan webhook Discord yang valid",
    };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "MyKait/1.0 (webhook-studio)",
      },
      // No redirects to external hosts (anti-SSRF)
      redirect: "error",
    });

    const latencyMs = Date.now() - start;

    if (response.status === 200) {
      const data = await response.json();
      return {
        status: "active",
        httpStatus: 200,
        latencyMs,
        webhookName: data.name,
        channelId: data.channel_id,
        channelName: data.channel_name,
        guildId: data.guild_id,
        guildName: data.guild?.name,
      };
    }

    if (response.status === 404) {
      return {
        status: "invalid",
        httpStatus: 404,
        latencyMs,
        error: "Webhook sudah dihapus atau URL salah",
      };
    }

    if (response.status === 401) {
      return {
        status: "invalid",
        httpStatus: 401,
        latencyMs,
        error: "Token tidak valid",
      };
    }

    if (response.status === 429) {
      const body = await response.json().catch(() => null);
      const retryAfter = body?.retry_after ?? 5;
      return {
        status: "rate_limited",
        httpStatus: 429,
        latencyMs,
        error: `Terkena rate limit, coba lagi dalam ${Math.ceil(retryAfter)} detik`,
      };
    }

    return {
      status: "error",
      httpStatus: response.status,
      latencyMs,
      error: `HTTP ${response.status}`,
    };
  } catch (err) {
    const latencyMs = Date.now() - start;
    return {
      status: "error",
      httpStatus: null,
      latencyMs,
      error: err instanceof Error ? err.message : "Error jaringan",
    };
  }
}

export type SendResult = {
  success: boolean;
  messageId?: string;
  httpStatus: number;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
};

/**
 * Send a message via webhook.
 * Uses ?wait=true to get the message ID back.
 * See PRD 3.4, 6.3.
 */
export async function sendWebhookMessage(
  url: string,
  payload: Record<string, unknown>,
): Promise<SendResult> {
  const start = Date.now();

  try {
    const sendUrl = url.includes("?") ? `${url}&wait=true` : `${url}?wait=true`;

    const response = await fetch(sendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MyKait/1.0 (webhook-studio)",
      },
      body: JSON.stringify(payload),
      redirect: "error",
    });

    if (response.status === 204 || response.status === 200) {
      const data = await response.json().catch(() => null);
      return {
        success: true,
        messageId: data?.id,
        httpStatus: response.status,
      };
    }

    if (response.status === 429) {
      const body = await response.json().catch(() => null);
      const retryAfter = body?.retry_after ?? 5;
      return {
        success: false,
        httpStatus: 429,
        rateLimited: true,
        retryAfter,
        error: `Rate limited oleh Discord. Coba lagi dalam ${Math.ceil(retryAfter)} detik.`,
      };
    }

    if (response.status === 400) {
      const body = await response.json().catch(() => null);
      return {
        success: false,
        httpStatus: 400,
        error: body?.message
          ? `Discord: ${body.message}`
          : "Payload tidak valid (periksa field embed)",
      };
    }

    const latencyMs = Date.now() - start;
    void latencyMs;

    const body = await response.json().catch(() => null);
    return {
      success: false,
      httpStatus: response.status,
      error: body?.message ?? `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      error: err instanceof Error ? err.message : "Error jaringan",
    };
  }
}

/**
 * Edit a sent message (PATCH).
 * See PRD 3.5.
 */
export async function editWebhookMessage(
  url: string,
  messageId: string,
  payload: Record<string, unknown>,
): Promise<SendResult> {
  try {
    const editUrl = `${url}/messages/${messageId}`;
    const response = await fetch(editUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "MyKait/1.0 (webhook-studio)",
      },
      body: JSON.stringify(payload),
      redirect: "error",
    });

    if (response.ok) {
      return { success: true, httpStatus: response.status, messageId };
    }

    const body = await response.json().catch(() => null);
    return {
      success: false,
      httpStatus: response.status,
      error: body?.message ?? `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      error: err instanceof Error ? err.message : "Error jaringan",
    };
  }
}

/**
 * Delete a sent message (DELETE).
 * See PRD 3.5.
 */
export async function deleteWebhookMessage(
  url: string,
  messageId: string,
): Promise<SendResult> {
  try {
    const deleteUrl = `${url}/messages/${messageId}`;
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "User-Agent": "MyKait/1.0 (webhook-studio)",
      },
      redirect: "error",
    });

    if (response.ok || response.status === 204) {
      return { success: true, httpStatus: 204 };
    }

    const body = await response.json().catch(() => null);
    return {
      success: false,
      httpStatus: response.status,
      error: body?.message ?? `HTTP ${response.status}`,
    };
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      error: err instanceof Error ? err.message : "Error jaringan",
    };
  }
}
