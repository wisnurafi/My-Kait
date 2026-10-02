/**
 * Database connection — Neon Postgres (serverless driver).
 * Uses @neondatabase/serverless for edge/serverless compatibility.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import * as schema from "./schema";

/**
 * For serverless environments, create the sql connection per-request.
 * Neon's serverless driver uses HTTP, so connections don't
 * accumulate like traditional TCP pools.
 */

// Global cache to avoid re-creating in dev HMR
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof neon>;
  db?: ReturnType<typeof drizzle>;
};

const sql = globalForDb.sql ?? neon(env.DATABASE_URL);
const db = globalForDb.db ?? drizzle({ client: sql, schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
  globalForDb.db = db;
}

export { sql, db };
