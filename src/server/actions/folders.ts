"use server";

/**
 * Template folder management server actions.
 * Phase 4: folder/workspace organization for templates.
 */

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { templateFolders, templates } from "@/lib/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

/* --- Get folders with template counts --- */
export async function getFolders() {
  const user = await requireAuth();

  const folders = await db
    .select()
    .from(templateFolders)
    .where(eq(templateFolders.userId, user.id))
    .orderBy(desc(templateFolders.createdAt));

  // Count templates per folder
  const counts = await db
    .select({
      folderId: templates.folderId,
      count: count(),
    })
    .from(templates)
    .where(eq(templates.userId, user.id))
    .groupBy(templates.folderId);

  const countMap = new Map<string | null, number>();
  for (const c of counts) {
    countMap.set(c.folderId, Number(c.count));
  }

  return folders.map((f) => ({
    ...f,
    templateCount: countMap.get(f.id) ?? 0,
  }));
}

/* --- Create folder --- */
export async function createFolderAction(formData: FormData) {
  const user = await requireAuth();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Folder name is required" };
  if (name.length > 60) return { error: "Folder name too long (max 60)" };

  // Avoid duplicate names per user
  const existing = await db
    .select({ id: templateFolders.id })
    .from(templateFolders)
    .where(
      and(
        eq(templateFolders.userId, user.id),
        eq(templateFolders.name, name),
      ),
    )
    .limit(1);

  if (existing.length > 0) return { error: "Folder already exists" };

  const [created] = await db
    .insert(templateFolders)
    .values({ userId: user.id, name })
    .returning();

  revalidatePath("/templates");
  return { success: true, id: created.id };
}

/* --- Rename folder --- */
export async function renameFolderAction(formData: FormData) {
  const user = await requireAuth();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { error: "Folder name is required" };
  if (name.length > 60) return { error: "Folder name too long (max 60)" };

  const existing = await db
    .select({ id: templateFolders.id })
    .from(templateFolders)
    .where(
      and(
        eq(templateFolders.id, id),
        eq(templateFolders.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Folder not found" };

  await db
    .update(templateFolders)
    .set({ name })
    .where(eq(templateFolders.id, id));

  revalidatePath("/templates");
  return { success: true };
}

/* --- Delete folder (templates inside become unfiled via FK set null) --- */
export async function deleteFolderAction(formData: FormData) {
  const user = await requireAuth();
  const id = String(formData.get("id") ?? "");

  const existing = await db
    .select({ id: templateFolders.id })
    .from(templateFolders)
    .where(
      and(
        eq(templateFolders.id, id),
        eq(templateFolders.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Folder not found" };

  await db.delete(templateFolders).where(eq(templateFolders.id, id));

  revalidatePath("/templates");
  return { success: true };
}

/* --- Move template to folder (or unfiled when folderId empty) --- */
export async function moveTemplateToFolderAction(formData: FormData) {
  const user = await requireAuth();
  const templateId = String(formData.get("templateId") ?? "");
  const folderId = String(formData.get("folderId") ?? "") || null;

  // Verify template ownership
  const template = await db
    .select({ id: templates.id })
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  if (template.length === 0) return { error: "Template not found" };

  // Verify folder ownership when moving into a folder
  if (folderId) {
    const folder = await db
      .select({ id: templateFolders.id })
      .from(templateFolders)
      .where(
        and(
          eq(templateFolders.id, folderId),
          eq(templateFolders.userId, user.id),
        ),
      )
      .limit(1);

    if (folder.length === 0) return { error: "Folder not found" };
  }

  await db
    .update(templates)
    .set({ folderId, updatedAt: new Date() })
    .where(eq(templates.id, templateId));

  revalidatePath("/templates");
  return { success: true };
}
