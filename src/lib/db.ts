/**
 * Database connection — Neon Postgres (serverless driver).
 * Uses @neondatabase/serverless for edge/serverless compatibility.
 */

import { neon } from "@neondatabase/serverless";
import type { NeonQueryInTransaction } from "@neondatabase/serverless";
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

/* --- RLS context helper --- */

/**
 * Minimal template-tag query function accepted by {@link withRlsContext}.
 * Both the raw `sql` client and the transaction-scoped query function from
 * `@neondatabase/serverless` satisfy this shape.
 */
export interface RlsQueryFn {
  (strings: TemplateStringsArray, ...params: unknown[]): NeonQueryInTransaction;
}

/**
 * Run raw SQL queries with the RLS user context set.
 *
 * Executes `SET LOCAL app.current_user_id = <userId>` followed by the given
 * queries inside a single non-interactive transaction, so the RLS policies
 * in drizzle/0004_rls.sql actually enforce ownership for that user.
 *
 * Why this shape: the app uses Neon's HTTP driver, where every drizzle
 * query is its own HTTP request — `SET LOCAL` would not survive between
 * calls, and drizzle-orm/neon-http has no interactive transactions.
 * The underlying `@neondatabase/serverless` client supports batched
 * transactions via `sql.transaction([...])`, which is what this uses.
 *
 * When `userId` is null the queries run individually without a context;
 * the RLS policies fall back to "allow" in that case, matching the rest
 * of the app (application-layer ownership checks remain the primary
 * defense).
 *
 * @example
 * const [rows] = await withRlsContext(user.id, (q) => [
 *   q`SELECT * FROM templates WHERE user_id = ${user.id}`,
 * ]);
 */
export async function withRlsContext(
  userId: string | null,
  buildQueries: (query: RlsQueryFn) => NeonQueryInTransaction[],
): Promise<Record<string, unknown>[][]> {
  if (!userId) {
    const queries = buildQueries(sql as unknown as RlsQueryFn);
    return Promise.all(
      queries.map((q) => q as unknown as Promise<Record<string, unknown>[]>),
    );
  }
  const results = await sql.transaction((txn) => [
    txn`SET LOCAL app.current_user_id = ${userId}`,
    ...buildQueries(txn),
  ]);
  // Drop the SET LOCAL result; return one result set per input query.
  return results.slice(1) as Record<string, unknown>[][];
}
