/**
 * Admin session — signed cookie, Edge-safe (Web Crypto only).
 *
 * The admin dashboard uses its own session, completely separate from the
 * Discord OAuth session (Auth.js). The cookie value is
 * `base64url(payload).base64url(hmac-sha256(payload, AUTH_SECRET))`.
 * Verified in middleware (Edge runtime) and in server components/actions.
 *
 * Secrets are NEVER exposed to the client: this module only reads
 * process.env on the server.
 */

export const ADMIN_COOKIE_NAME = "mykait_admin_session";

/** 7 days — single admin, own machine. */
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing AUTH_SECRET");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminSession(email: string): Promise<string> {
  const payload = JSON.stringify({
    email,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  });
  const payloadB64 = b64urlEncode(new TextEncoder().encode(payload));
  const sig = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(),
    new TextEncoder().encode(payloadB64),
  );
  return `${payloadB64}.${b64urlEncode(new Uint8Array(sig))}`;
}

/**
 * Verify a session cookie value. Returns the admin email, or null.
 * Also rejects when the configured ADMIN_EMAIL changed (old sessions die).
 *
 * Signature check is done by re-signing and constant-time comparing
 * (keeps this module on Web Crypto only — no node:crypto, Edge-safe).
 */
export async function verifyAdminSession(
  token: string | undefined | null,
): Promise<string | null> {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;
  try {
    const expected = b64urlEncode(
      new Uint8Array(
        await crypto.subtle.sign(
          "HMAC",
          await hmacKey(),
          new TextEncoder().encode(payloadB64),
        ),
      ),
    );
    if (!constantTimeEqual(expected, sigB64)) return null;
    const { email, exp } = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payloadB64)),
    ) as { email?: unknown; exp?: unknown };
    if (typeof email !== "string" || typeof exp !== "number") return null;
    if (exp < Math.floor(Date.now() / 1000)) return null;
    const configured = process.env.ADMIN_EMAIL;
    if (!configured || email.toLowerCase() !== configured.toLowerCase())
      return null;
    return email;
  } catch {
    return null;
  }
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
