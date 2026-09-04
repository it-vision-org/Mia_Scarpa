"use server";

import { db } from "@shoestore/db";
import type { ActionResult, SerializedProduct, SerializedProductColor, SeoCategory } from "@/types";
import { isPromoLive, effectivePrice, promoPercent } from "@/lib/promo";

function serializeColor(color: {
  id: string;
  name: string;
  hex: string | null;
  isActive: boolean;
  images: { id: string; url: string; alt: string | null; order: number }[];
  sizes: { id: string; size: string; stock: number; priceOverride: any }[];
}): SerializedProductColor {
  return {
    id: color.id,
    name: color.name,
    hex: color.hex,
    isActive: color.isActive,
    images: color.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
    })),
    sizes: color.sizes.map((s) => ({
      id: s.id,
      size: s.size,
      stock: s.stock,
      priceOverride: s.priceOverride != null ? Number(s.priceOverride) : null,
    })),
  };
}

function serializeProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: any;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  images: { id: string; url: string; alt: string | null; order: number }[];
  colors: any[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  promoActive?: boolean;
  promoPrice?: any;
  promoLabel?: string | null;
  promoImage?: string | null;
  promoStartsAt?: Date | null;
  promoEndsAt?: Date | null;
}): SerializedProduct {
  const primaryImage =
    product.images[0]?.url ?? product.colors[0]?.images[0]?.url ?? null;

  const basePrice = Number(product.basePrice);
  const promoPrice = product.promoPrice != null ? Number(product.promoPrice) : null;
  const promoFields = {
    basePrice,
    promoActive: product.promoActive ?? false,
    promoPrice,
    promoStartsAt: product.promoStartsAt ?? null,
    promoEndsAt: product.promoEndsAt ?? null,
  };
  const promoLive = isPromoLive(promoFields);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice,
    promoActive: product.promoActive ?? false,
    promoPrice,
    promoLabel: product.promoLabel ?? null,
    promoImage: product.promoImage ?? null,
    promoStartsAt: product.promoStartsAt ? product.promoStartsAt.toISOString() : null,
    promoEndsAt: product.promoEndsAt ? product.promoEndsAt.toISOString() : null,
    promoLive,
    effectivePrice: effectivePrice(promoFields),
    promoPercent: promoPercent(promoFields),
    primaryImage,
    images: product.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      order: i.order,
    })),
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    category: product.category ?? null,
    colors: product.colors.map(serializeColor),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    ogImage: product.ogImage,
  };
}

const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { order: "asc" as const } },
  colors: {
    where: { isActive: true },
    orderBy: { order: "asc" as const },
    include: {
      images: { orderBy: { order: "asc" as const } },
      sizes: { orderBy: { size: "asc" as const } },
    },
  },
} as const;

export async function getPublishedProducts(filters?: {
  categorySlug?: string;
  gender?: "men" | "women" | "enfant";
  search?: string;
  sizes?: string[];
  color?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ActionResult<SerializedProduct[]>> {
  try {
    const search = filters?.search?.trim();
    const searchNum =
      search && /^\d+([.,]\d+)?$/.test(search) ? Number(search.replace(",", ".")) : null;

    // Map a gender keyword (any of the supported languages) to the enum so
    // "men" / "homme" / "رجال" returns the whole department.
    const s = search?.toLowerCase() ?? "";
    const MEN_WORDS = ["men", "man", "mens", "homme", "hommes", "رجال", "رجالي"];
    const WOMEN_WORDS = ["women", "woman", "womens", "femme", "femmes", "نساء", "نسائي"];
    const ENFANT_WORDS = ["enfant", "enfants", "kids", "kid", "child", "children", "أطفال", "طفل"];
    const matchesWord = (words: string[]) =>
      s.length >= 3 && words.some((w) => w === s || w.startsWith(s));
    const genderFromSearch = matchesWord(MEN_WORDS)
      ? "MEN"
      : matchesWord(WOMEN_WORDS)
        ? "WOMEN"
        : matchesWord(ENFANT_WORDS)
          ? "ENFANT"
          : null;

    // Free-text search matches across name, description, slug, category and
    // parent category, colour names and sizes; a numeric query also matches the
    // base price and any per-size price override; a gender keyword matches the
    // whole department.
    const ci = { mode: "insensitive" as const };
    const searchOR = search
      ? [
          { name: { contains: search, ...ci } },
          { description: { contains: search, ...ci } },
          { slug: { contains: search, ...ci } },
          { seoKeywords: { contains: search, ...ci } },
          { category: { name: { contains: search, ...ci } } },
          { category: { parent: { name: { contains: search, ...ci } } } },
          { colors: { some: { name: { contains: search, ...ci } } } },
          { colors: { some: { sizes: { some: { size: { equals: search, ...ci } } } } } },
          ...(searchNum !== null
            ? [
                { basePrice: { equals: searchNum } },
                { colors: { some: { sizes: { some: { priceOverride: { equals: searchNum } } } } } },
              ]
            : []),
          ...(genderFromSearch ? [{ gender: genderFromSearch as "MEN" | "WOMEN" | "ENFANT" }] : []),
        ]
      : null;

    // Size / colour both filter the same `colors` relation, so they go in an
    // AND array rather than colliding on one `colors` key.
    const facetAND: Record<string, unknown>[] = [];
    const sizes = filters?.sizes?.map((s) => s.trim()).filter(Boolean) ?? [];
    if (sizes.length > 0) {
      // any of the selected sizes
      facetAND.push({
        colors: { some: { sizes: { some: { size: { in: sizes } } } } },
      });
    }
    if (filters?.color) {
      facetAND.push({ colors: { some: { name: { equals: filters.color, ...ci } } } });
    }

    const priceWhere: { gte?: number; lte?: number } = {};
    if (filters?.minPrice != null) priceWhere.gte = filters.minPrice;
    if (filters?.maxPrice != null) priceWhere.lte = filters.maxPrice;

    const products = await db.product.findMany({
      where: {
        isPublished: true,
        ...(filters?.categorySlug ? { category: { slug: filters.categorySlug } } : {}),
        ...(filters?.gender ? { gender: filters.gender.toUpperCase() as "MEN" | "WOMEN" | "ENFANT" } : {}),
        ...(Object.keys(priceWhere).length ? { basePrice: priceWhere } : {}),
        ...(facetAND.length ? { AND: facetAND } : {}),
        ...(searchOR ? { OR: searchOR } : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      include: PRODUCT_INCLUDE,
    });
    return { success: true, data: products.map(serializeProduct) };
  } catch (error) {
    console.error("[PRODUCTS] list error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export type ShopFacets = {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  priceMin: number;
  priceMax: number;
};

// Distinct sizes / colours and the price span across the published catalogue
// (optionally scoped to a gender) — powers the shop sidebar filters.
export async function getShopFacets(opts?: {
  gender?: "men" | "women" | "enfant";
}): Promise<ActionResult<ShopFacets>> {
  try {
    const rows = await db.product.findMany({
      where: {
        isPublished: true,
        ...(opts?.gender ? { gender: opts.gender.toUpperCase() as "MEN" | "WOMEN" | "ENFANT" } : {}),
      },
      select: {
        basePrice: true,
        colors: {
          where: { isActive: true },
          select: { name: true, hex: true, sizes: { select: { size: true } } },
        },
      },
    });

    const sizeSet = new Set<string>();
    const colorMap = new Map<string, string | null>();
    let min = Infinity;
    let max = 0;

    for (const p of rows) {
      const price = Number(p.basePrice);
      if (price < min) min = price;
      if (price > max) max = price;
      for (const c of p.colors) {
        if (c.name?.trim()) colorMap.set(c.name.trim(), c.hex);
        for (const s of c.sizes) if (s.size?.trim()) sizeSet.add(s.size.trim());
      }
    }
    if (!Number.isFinite(min)) min = 0;

    const sizes = [...sizeSet].sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
    const colors = [...colorMap.entries()]
      .map(([name, hex]) => ({ name, hex }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: { sizes, colors, priceMin: Math.floor(min), priceMax: Math.ceil(max) },
    };
  } catch (error) {
    console.error("[SHOP] facets error:", error);
    return { success: false, error: "Failed to load filters" };
  }
}

export async function getFeaturedProducts(): Promise<ActionResult<SerializedProduct[]>> {
  try {
    const products = await db.product.findMany({
      where: { isPublished: true, isFeatured: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 6,
      include: PRODUCT_INCLUDE,
    });
    return { success: true, data: products.map(serializeProduct) };
  } catch (error) {
    console.error("[PRODUCTS] featured error:", error);
    return { success: false, error: "Failed to load featured products" };
  }
}

// Returns published products matching the given IDs, in the same order the
// IDs were passed in (used for the admin-curated homepage featured picks).
export async function getProductsByIds(ids: string[]): Promise<ActionResult<SerializedProduct[]>> {
  if (ids.length === 0) return { success: true, data: [] };
  try {
    const products = await db.product.findMany({
      where: { id: { in: ids }, isPublished: true },
      include: PRODUCT_INCLUDE,
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const ordered = ids.map((id) => byId.get(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
    return { success: true, data: ordered.map(serializeProduct) };
  } catch (error) {
    console.error("[PRODUCTS] byIds error:", error);
    return { success: false, error: "Failed to load products" };
  }
}

export async function getProductBySlug(slug: string): Promise<ActionResult<SerializedProduct>> {
  if (!slug) return { success: false, error: "Product not found" };
  try {
    const product = await db.product.findFirst({
      where: { slug, isPublished: true },
      include: PRODUCT_INCLUDE,
    });
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: serializeProduct(product) };
  } catch (error) {
    console.error("[PRODUCTS] detail error:", error);
    return { success: false, error: "Failed to load product" };
  }
}

export async function getProductColors(
  productId: string,
): Promise<ActionResult<SerializedProductColor[]>> {
  if (!productId) return { success: false, error: "Product not found" };
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { colors: PRODUCT_INCLUDE.colors },
    });
    if (!product) return { success: false, error: "Product not found" };
    return { success: true, data: product.colors.map(serializeColor) };
  } catch (error) {
    console.error("[PRODUCTS] colors error:", error);
    return { success: false, error: "Failed to load product options" };
  }
}

export async function getCategories(): Promise<
  ActionResult<{ id: string; name: string; slug: string }[]>
> {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("[PRODUCTS] categories error:", error);
    return { success: false, error: "Failed to load categories" };
  }
}

// Public SEO lookup for the /shop?category=<slug> metadata — returns the category's
// own SEO overrides (or nulls, in which case shop/page.tsx auto-generates from name).
export async function getCategoryBySlug(slug: string): Promise<ActionResult<SeoCategory>> {
  if (!slug) return { success: false, error: "Category not found" };
  try {
    const category = await db.category.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        gender: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        ogImage: true,
      },
    });
    if (!category) return { success: false, error: "Category not found" };
    return { success: true, data: category as SeoCategory };
  } catch (error) {
    console.error("[PRODUCTS] getCategoryBySlug error:", error);
    return { success: false, error: "Failed to load category" };
  }
}
