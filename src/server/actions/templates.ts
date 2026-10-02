"use server";

/**
 * Template management server actions.
 * See PRD sections 3.6, 3.7.
 */

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { templates, templateShares } from "@/lib/schema";
import { eq, and, desc, ilike, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { templateSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";

/* --- Create template --- */
export async function createTemplateAction(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    payload: JSON.parse(String(formData.get("payload") ?? "{}")),
  };

  const parsed = templateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const [created] = await db
    .insert(templates)
    .values({
      userId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      tags: parsed.data.tags ?? [],
      payload: parsed.data.payload,
    })
    .returning();

  revalidatePath("/templates");
  return { success: true, id: created.id };
}

/* --- Get templates list --- */
export async function getTemplates(search?: string, tagFilter?: string, folderId?: string) {
  const user = await requireAuth();

  const conditions = [eq(templates.userId, user.id)];

  if (search) {
    conditions.push(ilike(templates.name, `%${search}%`));
  }

  if (folderId === "unfiled") {
    conditions.push(sql`${templates.folderId} IS NULL`);
  } else if (folderId) {
    conditions.push(eq(templates.folderId, folderId));
  }

  const result = await db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(desc(templates.updatedAt));

  // Filter by tag in JS (array filter)
  if (tagFilter) {
    return result.filter((t) => t.tags?.includes(tagFilter));
  }

  return result;
}

/* --- Get single template --- */
export async function getTemplate(id: string) {
  const user = await requireAuth();

  const result = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/* --- Update template --- */
export async function updateTemplateAction(formData: FormData) {
  const user = await requireAuth();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "") || undefined;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (!name) return { error: "Nama wajib diisi" };

  // Verify ownership
  const existing = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Template tidak ditemukan" };

  await db
    .update(templates)
    .set({
      name,
      description: description ?? null,
      tags,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, id));

  revalidatePath("/templates");
  return { success: true };
}

/* --- Duplicate template --- */
export async function duplicateTemplateAction(formData: FormData) {
  const user = await requireAuth();
  const id = String(formData.get("id") ?? "");

  const existing = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Template tidak ditemukan" };

  await db.insert(templates).values({
    userId: user.id,
    name: `${existing[0].name} (salinan)`,
    description: existing[0].description,
    tags: existing[0].tags,
    payload: existing[0].payload,
  });

  revalidatePath("/templates");
  return { success: true };
}

/* --- Delete template --- */
export async function deleteTemplateAction(formData: FormData) {
  const user = await requireAuth();
  const id = String(formData.get("id") ?? "");

  const existing = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Template tidak ditemukan" };

  await db.delete(templates).where(eq(templates.id, id));

  revalidatePath("/templates");
  return { success: true };
}

/* --- Save current editor state as template --- */
export async function saveAsTemplateAction(prevState: unknown, formData: FormData) {
  const user = await requireAuth();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "") || undefined;
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let payload;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    return { error: "Payload tidak valid" };
  }

  if (!name) return { error: "Nama wajib diisi" };

  const parsed = templateSchema.safeParse({ name, description, tags, payload });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.insert(templates).values({
    userId: user.id,
    name: parsed.data.name,
    description: parsed.data.description,
    tags: parsed.data.tags ?? [],
    payload: parsed.data.payload,
  });

  revalidatePath("/templates");
  return { success: true, message: "Template disimpan!" };
}

/* --- Create share link --- */
export async function createShareLinkAction(formData: FormData) {
  const user = await requireAuth();
  const templateId = String(formData.get("templateId") ?? "");

  // Verify ownership
  const existing = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        eq(templates.userId, user.id),
      ),
    )
    .limit(1);

  if (existing.length === 0) return { error: "Template tidak ditemukan" };

  // Check if already has an active share
  const existingShare = await db
    .select()
    .from(templateShares)
    .where(
      and(
        eq(templateShares.templateId, templateId),
        eq(templateShares.isActive, true),
      ),
    )
    .limit(1);

  if (existingShare.length > 0) {
    return { success: true, slug: existingShare[0].slug };
  }

  const slug = generateSlug();

  await db.insert(templateShares).values({
    templateId,
    slug,
  });

  revalidatePath("/templates");
  return { success: true, slug };
}

/* --- Revoke share link --- */
export async function revokeShareLinkAction(formData: FormData) {
  const user = await requireAuth();
  const shareId = String(formData.get("shareId") ?? "");

  await db
    .update(templateShares)
    .set({ isActive: false })
    .where(eq(templateShares.id, shareId));

  revalidatePath("/templates");
  return { success: true };
}

/* --- Get share links for a template --- */
export async function getShareLinks(templateId: string) {
  const user = await requireAuth();

  // Verify ownership
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

  if (template.length === 0) return [];

  return db
    .select()
    .from(templateShares)
    .where(
      and(
        eq(templateShares.templateId, templateId),
        eq(templateShares.isActive, true),
      ),
    )
    .orderBy(desc(templateShares.createdAt));
}

/* --- Get shared template by slug (public) --- */
export async function getSharedTemplateBySlug(slug: string) {
  const result = await db
    .select({
      id: templates.id,
      name: templates.name,
      description: templates.description,
      tags: templates.tags,
      payload: templates.payload,
      shareId: templateShares.id,
      importCount: templateShares.importCount,
    })
    .from(templateShares)
    .innerJoin(templates, eq(templateShares.templateId, templates.id))
    .where(
      and(
        eq(templateShares.slug, slug),
        eq(templateShares.isActive, true),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

/* --- Import template from share --- */
export async function importTemplateAction(formData: FormData) {
  const user = await requireAuth();
  const shareId = String(formData.get("shareId") ?? "");

  // Get the shared template
  const shared = await db
    .select({
      templateId: templateShares.templateId,
      slug: templateShares.slug,
    })
    .from(templateShares)
    .where(
      and(
        eq(templateShares.id, shareId),
        eq(templateShares.isActive, true),
      ),
    )
    .limit(1);

  if (shared.length === 0) return { error: "Template tidak ditemukan" };

  // Get template data
  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.id, shared[0].templateId))
    .limit(1);

  if (template.length === 0) return { error: "Template tidak ditemukan" };

  // Create a copy for the user
  const [created] = await db
    .insert(templates)
    .values({
      userId: user.id,
      name: template[0].name,
      description: template[0].description,
      tags: template[0].tags,
      payload: template[0].payload,
    })
    .returning();

  // Increment import count
  await db
    .update(templateShares)
    .set({ importCount: sql`${templateShares.importCount} + 1` })
    .where(eq(templateShares.id, shareId));

  return { success: true, id: created.id };
}
