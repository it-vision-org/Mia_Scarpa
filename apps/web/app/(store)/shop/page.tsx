import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedProducts, getCategoryBySlug, getShopFacets } from "@/actions/productActions";
import { getCategoryTree } from "@/actions/categoryActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopSearchInput } from "@/components/store/ShopSearchInput";
import { ShopCatalogReveal } from "@/components/store/ShopCatalogReveal";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBaseUrl,
  getSiteIdentity,
  truncate,
  ogImages,
  breadcrumbJsonLd,
  MAX_DESCRIPTION_LENGTH,
} from "@/lib/seo";

type SearchParams = Promise<{
  category?: string;
  gender?: string;
  promo?: string;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
}>;

const SHOP_DEFAULT_TITLE = "Toute la collection";
const SHOP_DEFAULT_DESCRIPTION =
  "Parcourez toutes les chaussures Mia Scarpa pour homme et femme : cuir, sneakers, bottines et mocassins. Livraison rapide partout en Tunisie.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const [baseUrl, identity] = await Promise.all([getBaseUrl(), getSiteIdentity()]);

  // Filtered views canonicalize to their own filter URL; the bare listing to /shop.
  let title = SHOP_DEFAULT_TITLE;
  let description = SHOP_DEFAULT_DESCRIPTION;
  let image = identity.seo.ogImage;
  let keywords: string | undefined;
  let canonical = `${baseUrl}/shop`;

  if (params.gender === "men" || params.gender === "women" || params.gender === "enfant") {
    const label = params.gender === "men" ? "homme" : params.gender === "women" ? "femme" : "enfant";
    title = `Chaussures ${label}`;
    description = `Découvrez la collection Mia Scarpa pour ${label} : cuir, sneakers, bottines et mocassins. Livraison rapide partout en Tunisie.`;
    canonical = `${baseUrl}/shop?gender=${params.gender}`;
  }

  if (params.promo === "1" || params.promo === "true") {
    title = "Promotions";
    description =
      "Toutes les chaussures Mia Scarpa actuellement en promotion : profitez des réductions avant qu'elles ne s'arrêtent.";
    canonical = `${baseUrl}/shop?promo=1`;
  }

  if (params.category) {
    const categoryResult = await getCategoryBySlug(params.category);
    const category = categoryResult.success ? categoryResult.data : null;
    if (category) {
      title = category.seoTitle?.trim() || `${category.name} — Mia Scarpa`;
      description =
        category.seoDescription?.trim() ||
        (category.description
          ? truncate(category.description, MAX_DESCRIPTION_LENGTH)
          : SHOP_DEFAULT_DESCRIPTION);
      image = category.ogImage?.trim() || category.image || identity.seo.ogImage;
      keywords = category.seoKeywords?.trim() || undefined;
      canonical = `${baseUrl}/shop?category=${category.slug}`;
    }
  }

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: identity.storeName,
      images: ogImages(image),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const gender =
    params.gender === "men" || params.gender === "women" || params.gender === "enfant"
      ? params.gender
      : undefined;
  const promoOnly = params.promo === "1" || params.promo === "true";

  const parsePrice = (v?: string) => {
    const n = v != null ? Number(v) : NaN;
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const minPrice = parsePrice(params.minPrice);
  const maxPrice = parsePrice(params.maxPrice);
  const sizes = params.size ? params.size.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const [productsResult, facetsResult, menTreeResult, womenTreeResult, enfantTreeResult, settingsResult] =
    await Promise.all([
      getPublishedProducts({
        categorySlug: params.category,
        gender,
        search: params.search,
        sizes,
        color: params.color,
        minPrice,
        maxPrice,
        promoOnly,
      }),
      getShopFacets({ gender, promoOnly }),
      getCategoryTree("MEN"),
      getCategoryTree("WOMEN"),
      getCategoryTree("ENFANT"),
      getStoreSettings(),
    ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const facets =
    facetsResult.success && facetsResult.data
      ? facetsResult.data
      : { sizes: [], colors: [], priceMin: 0, priceMax: 0 };
  const menTree = menTreeResult.success ? (menTreeResult.data ?? []) : [];
  const womenTree = womenTreeResult.success ? (womenTreeResult.data ?? []) : [];
  const enfantTree = enfantTreeResult.success ? (enfantTreeResult.data ?? []) : [];
  const categoryTree =
    gender === "men"
      ? menTree
      : gender === "women"
        ? womenTree
        : gender === "enfant"
          ? enfantTree
          : [...menTree, ...womenTree, ...enfantTree];
  const settings = settingsResult.success ? settingsResult.data : null;

  // Kids doesn't get its own cover-photo slot — falls back to the general shop cover, same as the bare listing.
  const coverImage =
    gender === "men"
      ? (settings?.menCoverImage ?? settings?.heroImage ?? null)
      : gender === "women"
        ? (settings?.womenCoverImage ?? settings?.heroImage ?? null)
        : (settings?.shopCoverImage ?? settings?.heroImage ?? null);

  const title = promoOnly
    ? "Promotions"
    : gender === "men"
      ? "Men"
      : gender === "women"
        ? "Women"
        : gender === "enfant"
          ? "Kids"
          : "Shop";

  const baseUrl = await getBaseUrl();
  const breadcrumbItems = [
    { name: "Accueil", url: `${baseUrl}/` },
    { name: "Boutique", url: `${baseUrl}/shop` },
    ...(gender === "men" ? [{ name: "Homme", url: `${baseUrl}/shop?gender=men` }] : []),
    ...(gender === "women" ? [{ name: "Femme", url: `${baseUrl}/shop?gender=women` }] : []),
    ...(gender === "enfant" ? [{ name: "Enfant", url: `${baseUrl}/shop?gender=enfant` }] : []),
    ...(promoOnly ? [{ name: "Promotions", url: `${baseUrl}/shop?promo=1` }] : []),
  ];

  return (
    <main className="w-full pb-10">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {/* ── COVER ──────────────────────────────────────────────────────── */}
      <div className="relative isolate h-[40vh] min-h-[280px] w-full overflow-hidden bg-[var(--color-green-dark)]">
        {coverImage && (
          <Image src={coverImage} alt="" fill priority className="z-0 object-cover" />
        )}
        <div className="absolute inset-0 z-0 bg-black/40" />

        <div className="absolute left-6 top-6 z-20">
          <Suspense fallback={null}>
            <ShopSearchInput defaultValue={params.search} onDark />
          </Suspense>
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* separator between the cover and the catalogue — matches the homepage, no white band */}
      <SectionDivider transparent tail />

      <ShopCatalogReveal>
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-0">
          <div className="w-full shrink-0 px-6 lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:self-start lg:pr-10">
            <ShopFilters
              categories={categoryTree}
              facets={facets}
              current={{
                category: params.category,
                gender,
                promo: params.promo,
                search: params.search,
                size: params.size,
                color: params.color,
                minPrice: params.minPrice,
                maxPrice: params.maxPrice,
              }}
            />
          </div>
          <div className="mx-6 h-px bg-[var(--color-border)] lg:mx-0 lg:h-auto lg:w-px" />
          <div className="min-w-0 flex-1 lg:pl-10">
            <ProductGrid products={products} />
          </div>
        </div>
      </ShopCatalogReveal>
    </main>
  );
}
