"use server";

/**
 * Admin dashboard data actions.
 * Every action starts with requireAdmin() — the admin session cookie is
 * verified here too (defense in depth; middleware also guards the routes).
 */

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  users,
  templates,
  templateShares,
  templateReports,
  messageLogs,
  webhooks,
  webhookChecks,
  type ReportStatus,
} from "@/lib/schema";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-session";
import { eq, and, gte, sql, desc, ilike, or, count } from "drizzle-orm";

export type { ReportStatus } from "@/lib/schema";

export async function requireAdmin(): Promise<string> {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  const email = await verifyAdminSession(token);
  if (!email) throw new Error("UNAUTHORIZED");
  return email;
}

const VALID_STATUSES: ReportStatus[] = [
  "pending",
  "reviewed",
  "dismissed",
  "actioned",
];

/* --- Overview --- */

export type AdminOverview = {
  users: number;
  templates: number;
  activeShares: number;
  messages7d: number;
  pendingReports: number;
  webhooksDown: number;
  failedChecks24h: number;
  failedMessages24h: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const d7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const d1 = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [[u], [t], [s], [m], [r], [wd], [fc], [fm]] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(templates),
    db
      .select({ n: count() })
      .from(templateShares)
      .where(eq(templateShares.isActive, true)),
    db
      .select({ n: count() })
      .from(messageLogs)
      .where(gte(messageLogs.createdAt, d7)),
    db
      .select({ n: count() })
      .from(templateReports)
      .where(eq(templateReports.status, "pending")),
    db
      .select({ n: count() })
      .from(webhooks)
      .where(eq(webhooks.lastStatus, "invalid")),
    db
      .select({ n: count() })
      .from(webhookChecks)
      .where(
        and(
          eq(webhookChecks.status, "invalid"),
          gte(webhookChecks.createdAt, d1),
        ),
      ),
    db
      .select({ n: count() })
      .from(messageLogs)
      .where(
        and(
          sql`${messageLogs.status} in ('failed','rate_limited')`,
          gte(messageLogs.createdAt, d1),
        ),
      ),
  ]);

  return {
    users: u.n,
    templates: t.n,
    activeShares: s.n,
    messages7d: m.n,
    pendingReports: r.n,
    webhooksDown: wd.n,
    failedChecks24h: fc.n,
    failedMessages24h: fm.n,
  };
}

export async function getPendingReportsCount(): Promise<number> {
  await requireAdmin();
  const [row] = await db
    .select({ n: count() })
    .from(templateReports)
    .where(eq(templateReports.status, "pending"));
  return row.n;
}

/* --- Reports queue --- */

export type AdminReport = {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  templateId: string;
  templateName: string;
  templateSlug: string | null;
  shareActive: boolean | null;
  reporterName: string | null;
  reportCount: number;
};

export async function getReports(
  status?: ReportStatus,
): Promise<AdminReport[]> {
  await requireAdmin();
  const rows = await db
    .select({
      id: templateReports.id,
      reason: templateReports.reason,
      status: templateReports.status,
      createdAt: templateReports.createdAt,
      templateId: templateReports.templateId,
      templateName: templates.name,
      reporterName: users.username,
      shareSlug: templateShares.slug,
      shareActive: templateShares.isActive,
      reportCount: sql<number>`(
        select count(*)::int from ${templateReports} r2
        where r2.template_id = ${templateReports.templateId}
          and r2.status = 'pending'
      )`,
    })
    .from(templateReports)
    .innerJoin(templates, eq(templateReports.templateId, templates.id))
    .leftJoin(users, eq(templateReports.reporterUserId, users.id))
    .leftJoin(
      templateShares,
      and(
        eq(templateShares.templateId, templates.id),
        eq(templateShares.isActive, true),
      ),
    )
    .where(status ? eq(templateReports.status, status) : undefined)
    .orderBy(desc(templateReports.createdAt))
    .limit(200);
  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt,
    templateId: r.templateId,
    templateName: r.templateName,
    templateSlug: r.shareSlug,
    shareActive: r.shareActive,
    reporterName: r.reporterName,
    reportCount: r.reportCount,
  }));
}

export async function setReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<{ success: boolean }> {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) throw new Error("INVALID_STATUS");
  await db
    .update(templateReports)
    .set({ status })
    .where(eq(templateReports.id, reportId));
  return { success: true };
}

/**
 * Mark a report "actioned" AND unpublish the template's share link
 * (share stays in DB with is_active=false; owner's template untouched).
 */
export async function actionReport(
  reportId: string,
): Promise<{ success: boolean }> {
  await requireAdmin();
  const [report] = await db
    .select({ templateId: templateReports.templateId })
    .from(templateReports)
    .where(eq(templateReports.id, reportId))
    .limit(1);
  if (!report) throw new Error("NOT_FOUND");
  await db
    .update(templateReports)
    .set({ status: "actioned" })
    .where(eq(templateReports.id, reportId));
  await db
    .update(templateShares)
    .set({ isActive: false })
    .where(eq(templateShares.templateId, report.templateId));
  return { success: true };
}

/* --- Shared templates --- */

export type AdminShare = {
  id: string;
  slug: string;
  isActive: boolean;
  importCount: number;
  createdAt: Date;
  templateId: string;
  templateName: string;
  ownerName: string;
  pendingReports: number;
};

export async function getShares(query?: string): Promise<AdminShare[]> {
  await requireAdmin();
  const q = query?.trim();
  const rows = await db
    .select({
      id: templateShares.id,
      slug: templateShares.slug,
      isActive: templateShares.isActive,
      importCount: templateShares.importCount,
      createdAt: templateShares.createdAt,
      templateId: templates.id,
      templateName: templates.name,
      ownerName: users.username,
      pendingReports: sql<number>`(
        select count(*)::int from ${templateReports} r
        where r.template_id = ${templates.id} and r.status = 'pending'
      )`,
    })
    .from(templateShares)
    .innerJoin(templates, eq(templateShares.templateId, templates.id))
    .innerJoin(users, eq(templates.userId, users.id))
    .where(
      q
        ? or(
            ilike(templates.name, `%${q}%`),
            ilike(templateShares.slug, `%${q}%`),
            ilike(users.username, `%${q}%`),
          )
        : undefined,
    )
    .orderBy(desc(templateShares.createdAt))
    .limit(200);
  return rows;
}

export async function setShareActive(
  shareId: string,
  active: boolean,
): Promise<{ success: boolean }> {
  await requireAdmin();
  await db
    .update(templateShares)
    .set({ isActive: active })
    .where(eq(templateShares.id, shareId));
  return { success: true };
}

/* --- Users (read-only) --- */

export type AdminUser = {
  id: string;
  username: string;
  globalName: string | null;
  discordId: string;
  createdAt: Date;
  templateCount: number;
  webhookCount: number;
  messageCount: number;
};

export async function getAdminUsers(query?: string): Promise<AdminUser[]> {
  await requireAdmin();
  const q = query?.trim();
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      globalName: users.globalName,
      discordId: users.discordId,
      createdAt: users.createdAt,
      templateCount: sql<number>`(
        select count(*)::int from ${templates} t where t.user_id = ${users.id}
      )`,
      webhookCount: sql<number>`(
        select count(*)::int from ${webhooks} w where w.user_id = ${users.id}
      )`,
      messageCount: sql<number>`(
        select count(*)::int from ${messageLogs} m where m.user_id = ${users.id}
      )`,
    })
    .from(users)
    .where(
      q
        ? or(
            ilike(users.username, `%${q}%`),
            ilike(users.discordId, `%${q}%`),
          )
        : undefined,
    )
    .orderBy(desc(users.createdAt))
    .limit(200);
  return rows;
}
