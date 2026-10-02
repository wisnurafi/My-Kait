/**
 * Public platform stats — powers the landing page stats strip.
 * Aggregates only (no PII, no per-user data). Safe to expose publicly.
 * Response cached for 5 minutes (ISR) so the DB isn't hit per visitor.
 * GET /api/stats
 */

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { messageLogs } from "@/lib/schema";

export const revalidate = 300; // 5 minutes

export interface PublicStats {
  totalMessages: number;
  deliveryRate: number; // 0-100, one decimal
  medianLatencyMs: number | null;
  cachedAt: string;
}

const FALLBACK: PublicStats = {
  totalMessages: 0,
  deliveryRate: 100,
  medianLatencyMs: null,
  cachedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    const [row] = await db
      .select({
        total: sql<number>`count(*)::int`,
        sent: sql<number>`count(*) filter (where ${messageLogs.status} = 'sent')::int`,
        medianLatencyMs: sql<
          number | null
        >`percentile_cont(0.5) within group (order by ${messageLogs.latencyMs}) filter (where ${messageLogs.latencyMs} is not null)`,
      })
      .from(messageLogs);

    const total = row?.total ?? 0;
    const sent = row?.sent ?? 0;

    const stats: PublicStats = {
      totalMessages: total,
      deliveryRate:
        total > 0 ? Math.round((sent / total) * 1000) / 10 : 100,
      medianLatencyMs:
        row?.medianLatencyMs != null ? Math.round(row.medianLatencyMs) : null,
      cachedAt: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error("[api/stats]", err);
    // Never break the landing page — serve a graceful fallback
    return NextResponse.json(FALLBACK);
  }
}
