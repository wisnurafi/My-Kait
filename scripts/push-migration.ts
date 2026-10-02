/**
 * Push migration SQL to Neon using the serverless driver.
 * Usage: npx tsx scripts/push-migration.ts
 */
import { neon } from "@neondatabase/serverless";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  // Read all migration files
  const migrationsDir = join(process.cwd(), "drizzle");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  for (const file of files) {
    console.log(`Running: ${file}`);
    const sqlText = readFileSync(join(migrationsDir, file), "utf-8");

    // Split by statement-breakpoint and run each statement
    const statements = sqlText
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        // Neon serverless requires tagged template;
        // use sql.query for raw string execution
        await sql.query(stmt);
      } catch (err) {
        // If table already exists, skip
        if (
          err instanceof Error &&
          (err.message.includes("already exists") ||
            err.message.includes("already an enum"))
        ) {
          console.log(`  ↳ Skipped (already exists): ${stmt.slice(0, 60)}...`);
          continue;
        }
        console.error(`  ✗ Error:`, err instanceof Error ? err.message : err);
        console.error(`  Statement: ${stmt.slice(0, 100)}...`);
      }
    }
    console.log(`  ✓ Done`);
  }

  // Verify tables
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
  `;
  console.log("\nTables in database:");
  for (const t of tables) {
    console.log(`  - ${t.tablename}`);
  }
}

main().catch(console.error);
