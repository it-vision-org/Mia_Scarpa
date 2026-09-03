"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type {
  ActionResult,
  AdminProductDetail,
  ProductInput,
  ColorImage,
} from "@/types";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const ADMIN_INCLUDE = {
  category: { select: { name: true } },
  images: { orderBy: { order: "asc" as const } },
  colors: {
    orderBy: { order: "asc" as const },
    include: {
      images: { orderBy: { order: "asc" as const } },
      sizes: { orderBy: { size: "asc" as const } },
    },
  },
} as const;

function productToAdminDetail(
  p: any,
): AdminProductDetail & { brandName: string | null } {
  const images: string[] = (p.images ?? []).map((i: any) => i.url);
  const colorImages: ColorImage[] = p.colors.map((c: any) => ({
    name: c.name,
    hex: c.hex ?? "#888888",
    imageUrls: c.images.map((i: any) => i.url),
    sizes: c.sizes.map((s: any) => ({ size: s.size, stock: s.stock })),
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceCents: Math.round(Number(p.basePrice) * 100),
    images,
    colorImages,
    isPublished: p.isPublished,
    isFeatured: p.isFeatured,
    gender: p.gender,
    categoryId: p.categoryId ?? null,
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
    seoKeywords: p.seoKeywords ?? null,
    ogImage: p.ogImage ?? null,
    promoActive: p.promoActive ?? false,
    promoPriceCents: p.promoPrice != null ? Math.round(Number(p.promoPrice) * 100) : null,
    promoLabel: p.promoLabel ?? null,
    promoImage: p.promoImage ?? null,
    promoStartsAt: p.promoStartsAt ? new Date(p.promoStartsAt).toISOString() : null,
    promoEndsAt: p.promoEndsAt ? new Date(p.promoEndsAt).toISOString() : null,
    brandName: p.category?.name ?? null,
  };
}

// Shared promo columns for create/update.
function promoData(data: ProductInput) {
  return {
    promoActive: data.promoActive,
    promoPrice:
      data.promoActive && data.promoPriceCents != null ? data.promoPriceCents / 100 : null,
    promoLabel: data.promoLabel?.trim() || null,
    promoImage: data.promoImage?.trim() || null,
    promoStartsAt: data.promoStartsAt ? new Date(data.promoStartsAt) : null,
    promoEndsAt: data.promoEndsAt ? new Date(data.promoEndsAt) : null,
  };
}

export async function getAdminProducts(): Promise<
  ActionResult<(AdminProductDetail & { brandName: string | null })[]>
> {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: ADMIN_INCLUDE,
    });
    return { success: true, data: products.map(productToAdminDetail) };
  } catch (error) {
    console.error("[ADMIN] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getProductForEdit(
  slug: string,
): Promise<ActionResult<AdminProductDetail>> {
  try {
    const p = await db.product.findUnique({ where: { slug }, include: ADMIN_INCLUDE });
    if (!p) return { success: false, error: "Product not found" };
    return { success: true, data: productToAdminDetail(p) };
  } catch (error) {
    console.error("[ADMIN] getProductForEdit error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

export async function createProduct(
  data: ProductInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    if (!data.name) return { success: false, error: "Name is required" };

    const baseSlug = toSlug(data.name);
    const existing = await db.product.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const basePrice = data.priceCents / 100;

    const colorsData = data.colorImages.map((c, colorIdx) => ({
      name: c.name,
      hex: c.hex,
      order: colorIdx,
      images: {
        create: c.imageUrls.map((url, imgIdx) => ({ url, order: imgIdx })),
      },
      sizes: {
        create: c.sizes.map((s) => ({ size: s.size, stock: s.stock })),
      },
    }));

    await db.product.create({
      data: {
        name: data.name,
        slug,
        basePrice,
        isPublished: data.isPublished,
        isFeatured: data.isFeatured,
        gender: data.gender,
        categoryId: data.categoryId,
        ...promoData(data),
        seoTitle: data.seoTitle?.trim() || null,
        seoDescription: data.seoDescription?.trim() || null,
        seoKeywords: data.seoKeywords?.trim() || null,
        ogImage: data.ogImage?.trim() || null,
        images: {
          create: data.images.map((url, idx) => ({ url, order: idx })),
        },
        colors: { create: colorsData },
      },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, data: { slug } };
  } catch (error) {
    console.error("[ADMIN] createProduct error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  data: ProductInput,
): Promise<ActionResult> {
  const norm = (s: string) => s.trim().toLowerCase();

  try {
    const basePrice = data.priceCents / 100;

    const scalarData = {
      name: data.name,
      basePrice,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      gender: data.gender,
      categoryId: data.categoryId,
      ...promoData(data),
      seoTitle: data.seoTitle?.trim() || null,
      seoDescription: data.seoDescription?.trim() || null,
      seoKeywords: data.seoKeywords?.trim() || null,
      ogImage: data.ogImage?.trim() || null,
    };

    await db.$transaction(async (tx) => {
      // main product photos + scalar fields — neither is referenced by orders,
      // so a clean rebuild is always safe
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
        data: {
          ...scalarData,
          images: { create: data.images.map((url, idx) => ({ url, order: idx })) },
        },
      });

      // existing colours + sizes, and which sizes are locked by an order
      const existingColors = await tx.productColor.findMany({
        where: { productId: id },
        select: {
          id: true,
          name: true,
          sizes: {
            select: { id: true, size: true, _count: { select: { orderItems: true } } },
          },
        },
      });
      const orderedSizeIds = new Set<string>();
      for (const c of existingColors)
        for (const s of c.sizes) if (s._count.orderItems > 0) orderedSizeIds.add(s.id);

      const existingByName = new Map(existingColors.map((c) => [norm(c.name), c]));
      const incomingNames = new Set(data.colorImages.map((c) => norm(c.name)));

      // ── colours the admin removed ──
      for (const c of existingColors) {
        if (incomingNames.has(norm(c.name))) continue;
        if (c.sizes.some((s) => orderedSizeIds.has(s.id))) {
          // an order still points at this colour → keep the rows, just hide it
          await tx.productColor.update({ where: { id: c.id }, data: { isActive: false } });
          await tx.productColorSize.updateMany({ where: { colorId: c.id }, data: { stock: 0 } });
        } else {
          await tx.productColor.delete({ where: { id: c.id } }); // cascades sizes + images
        }
      }

      // ── colours the admin kept or added ──
      let order = 0;
      for (const c of data.colorImages) {
        const existing = existingByName.get(norm(c.name));

        if (!existing) {
          await tx.productColor.create({
            data: {
              productId: id,
              name: c.name,
              hex: c.hex,
              order,
              isActive: true,
              images: { create: c.imageUrls.map((url, i) => ({ url, order: i })) },
              sizes: { create: c.sizes.map((s) => ({ size: s.size, stock: s.stock })) },
            },
          });
        } else {
          await tx.productColor.update({
            where: { id: existing.id },
            data: { name: c.name, hex: c.hex, order, isActive: true },
          });
          // colour photos are never referenced by orders — safe to rebuild
          await tx.productColorImage.deleteMany({ where: { colorId: existing.id } });
          if (c.imageUrls.length > 0) {
            await tx.productColorImage.createMany({
              data: c.imageUrls.map((url, i) => ({ colorId: existing.id, url, order: i })),
            });
          }

          const existingSizes = new Map(existing.sizes.map((s) => [s.size, s]));
          const incomingSizes = new Set(c.sizes.map((s) => s.size));

          for (const s of existing.sizes) {
            if (incomingSizes.has(s.size)) continue;
            if (orderedSizeIds.has(s.id)) {
              await tx.productColorSize.update({ where: { id: s.id }, data: { stock: 0 } });
            } else {
              await tx.productColorSize.delete({ where: { id: s.id } });
            }
          }
          for (const s of c.sizes) {
            const ex = existingSizes.get(s.size);
            if (ex) {
              await tx.productColorSize.update({ where: { id: ex.id }, data: { stock: s.stock } });
            } else {
              await tx.productColorSize.create({
                data: { colorId: existing.id, size: s.size, stock: s.stock },
              });
            }
          }
        }
        order += 1;
      }
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] updateProduct error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] delete error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function toggleProductPublished(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isPublished: value } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function toggleProductFeatured(
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    await db.product.update({ where: { id }, data: { isFeatured: value } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

// ── Inline table edits ──────────────────────────────────────────────────────

export async function updateProductQuickFields(
  id: string,
  data: { name?: string; priceCents?: number },
): Promise<ActionResult> {
  try {
    const update: { name?: string; basePrice?: number } = {};
    if (data.name !== undefined) {
      const name = data.name.trim();
      if (!name) return { success: false, error: "Name cannot be empty" };
      update.name = name;
    }
    if (data.priceCents !== undefined) {
      if (isNaN(data.priceCents) || data.priceCents < 0) {
        return { success: false, error: "Enter a valid price" };
      }
      update.basePrice = data.priceCents / 100;
    }
    await db.product.update({ where: { id }, data: update });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] updateProductQuickFields error:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// ── Bulk actions ─────────────────────────────────────────────────────────────

export async function bulkDeleteProducts(ids: string[]): Promise<ActionResult> {
  try {
    await db.product.deleteMany({ where: { id: { in: ids } } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkDeleteProducts error:", error);
    return { success: false, error: "Failed to delete products" };
  }
}

export async function bulkSetPublished(ids: string[], value: boolean): Promise<ActionResult> {
  try {
    await db.product.updateMany({ where: { id: { in: ids } }, data: { isPublished: value } });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkSetPublished error:", error);
    return { success: false, error: "Failed to update products" };
  }
}

export async function bulkSetFeatured(ids: string[], value: boolean): Promise<ActionResult> {
  try {
    await db.product.updateMany({ where: { id: { in: ids } }, data: { isFeatured: value } });
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN] bulkSetFeatured error:", error);
    return { success: false, error: "Failed to update products" };
  }
}
