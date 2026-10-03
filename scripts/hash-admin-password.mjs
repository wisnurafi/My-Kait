#!/usr/bin/env node
/**
 * Generate a scrypt hash for the single admin account.
 *
 * Usage:
 *   node scripts/hash-admin-password.mjs
 *
 * Prints ADMIN_EMAIL + ADMIN_PASSWORD_HASH lines. Paste them into your
 * Vercel project environment variables (Production). NEVER commit the
 * output to git.
 *
 * Params MUST match src/server/admin-password.ts (N=16384, r=8, p=1, 64B key).
 */

import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import readline from "node:readline";
import { readFileSync } from "node:fs";

const scryptAsync = promisify(scrypt);

// Piped (non-TTY) input: slurp stdin once up front — sequential
// readline interfaces would otherwise race over the stream buffer.
const pipedLines =
  process.stdin.isTTY
    ? null
    : readFileSync(0, "utf8").split(/\r?\n/);

function askHidden(question) {
  // No TTY (piped input): fall back to plain line reading.
  if (pipedLines) {
    process.stdout.write(question);
    return Promise.resolve((pipedLines.shift() ?? "").trim());
  }
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    const onData = (ch) => {
      const c = ch.toString();
      if (c === "\n" || c === "\r" || c === "\u0004") return;
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(question + "*".repeat(rl.line.length));
    };
    process.stdin.on("data", onData);
    rl.question(question, (answer) => {
      process.stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

function ask(question) {
  if (pipedLines) {
    process.stdout.write(question);
    return Promise.resolve((pipedLines.shift() ?? "").trim());
  }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (a) => {
      rl.close();
      resolve(a.trim());
    }),
  );
}

const email = await ask("Admin email: ");
if (!email || !email.includes("@")) {
  console.error("Invalid email.");
  process.exit(1);
}
const p1 = await askHidden("New admin password (min 12 chars): ");
const p2 = await askHidden("Confirm password: ");
if (p1 !== p2) {
  console.error("Passwords do not match.");
  process.exit(1);
}
if (p1.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scryptAsync(p1, salt, 64, { N: 16384, r: 8, p: 1 });

console.log("\n--- Paste into Vercel env vars (Production). NEVER commit. ---");
console.log(`ADMIN_EMAIL=${email}`);
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${derived.toString("hex")}`);
console.log("---------------------------------------------------------------");
