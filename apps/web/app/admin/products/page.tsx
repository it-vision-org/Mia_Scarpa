import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Skeleton, TableSkeleton } from "@/components/admin/Skeleton";
import { ProductsContent } from "./ProductsContent";

export default async function AdminProductsPage() {
  const t = await getTranslations("Admin");
  return (
    <div>
      {/* header — renders instantly, independent of the DB fetch below */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("ProductsTitle")}</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-green-mid)]"
        >
          <Plus className="h-4 w-4" />
          {t("AddShoe")}
        </Link>
      </div>

      <Suspense
        fallback={
          <>
            <Skeleton className="mb-6 h-4 w-24" />
            <TableSkeleton rows={6} cols={5} />
          </>
        }
      >
        <ProductsContent />
      </Suspense>
    </div>
  );
}
