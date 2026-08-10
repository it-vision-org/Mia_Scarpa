import { Suspense } from "react";
import Image from "next/image";
import { getPublishedProducts } from "@/actions/productActions";
import { getCategoryTree } from "@/actions/categoryActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopSearchInput } from "@/components/store/ShopSearchInput";

type SearchParams = Promise<{
  category?: string;
  gender?: string;
  search?: string;
}>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const gender = params.gender === "men" || params.gender === "women" ? params.gender : undefined;

  const [productsResult, categoryTreeResult, settingsResult] = await Promise.all([
    getPublishedProducts({
      categorySlug: params.category,
      gender,
      search: params.search,
    }),
    getCategoryTree(),
    getStoreSettings(),
  ]);

  const products = productsResult.success ? (productsResult.data ?? []) : [];
  const categoryTree = categoryTreeResult.success ? (categoryTreeResult.data ?? []) : [];
  const settings = settingsResult.success ? settingsResult.data : null;

  const coverImage =
    gender === "men"
      ? (settings?.menCoverImage ?? settings?.heroImage ?? null)
      : gender === "women"
        ? (settings?.womenCoverImage ?? settings?.heroImage ?? null)
        : (settings?.shopCoverImage ?? settings?.heroImage ?? null);

  const title = gender === "men" ? "Men" : gender === "women" ? "Women" : "Shop";

  return (
    <main className="w-full pb-10">
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
