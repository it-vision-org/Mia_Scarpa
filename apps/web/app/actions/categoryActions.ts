"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult, CategoryNode, Gender } from "@/types";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildTree(categories: { id: string; name: string; slug: string; parentId: string | null; gender: Gender }[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>(
    categories.map((c) => [c.id, { ...c, children: [] }]),
  );
  const roots: CategoryNode[] = [];
  for (const c of byId.values()) {
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

// Pass a gender to scope the tree to just that department (used everywhere the
// storefront/admin needs "Men's categories" or "Women's categories"). Omit it
// to get every category regardless of gender.
export async function getCategoryTree(gender?: Gender): Promise<ActionResult<CategoryNode[]>> {
  try {
    const categories = await db.category.findMany({
      where: gender ? { gender } : undefined,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, parentId: true, gender: true },
    });
    return { success: true, data: buildTree(categories) };
  } catch (error) {
    console.error("[CATEGORIES] tree error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}

export async function createCategory(data: {
  name: string;
  gender: Gender;
  parentId?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const name = data.name.trim();
    if (!name) return { success: false, error: "Name is required" };

    const baseSlug = toSlug(name);
    const existing = await db.category.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const category = await db.category.create({
      data: { name, slug, gender: data.gender, parentId: data.parentId || null },
    });

    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error("[CATEGORIES] create error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  data: { name: string },
): Promise<ActionResult> {
  try {
    const name = data.name.trim();
    if (!name) return { success: false, error: "Name is required" };

    await db.category.update({ where: { id }, data: { name } });

    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[CATEGORIES] update error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    // children and products both use onDelete: SetNull — deleting a parent
    // category detaches its sub-categories/products rather than removing them.
    await db.category.delete({ where: { id } });

    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[CATEGORIES] delete error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
