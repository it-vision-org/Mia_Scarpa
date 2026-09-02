import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedProducts, getCategoryBySlug } from "@/actions/productActions";
import { getCategoryTree } from "@/actions/categoryActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopSearchInput } from "@/components/store/ShopSearchInput";
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
  search?: string;
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

  if (params.gender === "men" || params.gender === "women") {
    const label = params.gender === "men" ? "homme" : "femme";
    title = `Chaussures ${label}`;
    description = `Découvrez la collection Mia Scarpa pour ${label} : cuir, sneakers, bottines et mocassins. Livraison rapide partout en Tunisie.`;
    canonical = `${baseUrl}/shop?gender=${params.gender}`;
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
  const gender = params.gender === "men" || params.gender === "women" ? params.gender : undefined;

  const [productsResult, menTreeResult, womenTreeResult, settingsResult] = await Promise.all([
    getPublishedProducts({
      categorySlug: params.category,
      gender,
      search: params.search,
    }),
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
    getStoreSettings(),
  ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const menTree = menTreeResult.success ? (menTreeResult.data ?? []) : [];
  const womenTree = womenTreeResult.success ? (womenTreeResult.data ?? []) : [];
  const categoryTree = gender === "men" ? menTree : gender === "women" ? womenTree : [...menTree, ...womenTree];
  const settings = settingsResult.success ? settingsResult.data : null;

  const coverImage =
    gender === "men"
      ? (settings?.menCoverImage ?? settings?.heroImage ?? null)
      : gender === "women"
        ? (settings?.womenCoverImage ?? settings?.heroImage ?? null)
        : (settings?.shopCoverImage ?? settings?.heroImage ?? null);

  const title = gender === "men" ? "Men" : gender === "women" ? "Women" : "Shop";

  const baseUrl = await getBaseUrl();
  const breadcrumbItems = [
    { name: "Accueil", url: `${baseUrl}/` },
    { name: "Boutique", url: `${baseUrl}/shop` },
    ...(gender === "men" ? [{ name: "Homme", url: `${baseUrl}/shop?gender=men` }] : []),
    ...(gender === "women" ? [{ name: "Femme", url: `${baseUrl}/shop?gender=women` }] : []),
  ];

  return (
    <main className="w-full pb-10">
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      {/* ── COVER ──────────────────────────────────────────────────────── */}
      <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden bg-[var(--color-green-dark)]">
        {coverImage && (
          <Image src={coverImage} alt="" fill priority className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute left-6 top-6 z-10">
          <Suspense fallback={null}>
            <ShopSearchInput defaultValue={params.search} onDark />
          </Suspense>
        </div>

        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl text-white sm:text-5xl">{title}</h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        <div className="w-full shrink-0 px-6 lg:w-56">
          <ShopFilters
            categories={categoryTree}
            current={{ category: params.category, gender, search: params.search }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </main>
  );
}
