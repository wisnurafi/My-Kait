/**
 * Admin password hashing — scrypt via node:crypto (Node runtime only).
 * Used by the login server action and scripts/hash-admin-password.mjs.
 *
 * Format: `scrypt$<saltHex>$<hashHex>` with N=16384, r=8, p=1, dkLen=64.
 * NEVER log or expose hashes. NEVER import from client components.
 */

import { scrypt as _scrypt, timingSafeEqual, randomBytes } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SALT_LEN = 16;

/** scrypt with explicit params (@types/node's promisify lacks the options overload). */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _scrypt(
      password,
      salt,
      keylen,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, derived) => {
        if (err) reject(err);
        else resolve(derived as Buffer);
      },
    );
  });
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyAdminPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  try {
    const derived = await scryptAsync(
      password,
      Buffer.from(saltHex, "hex"),
      KEY_LEN,
    );
    const expected = Buffer.from(hashHex, "hex");
    if (derived.length !== expected.length) return false;
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Timing-safe string comparison (for the admin email). */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
