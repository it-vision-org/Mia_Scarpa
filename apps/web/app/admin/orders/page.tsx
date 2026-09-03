import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { OrdersFilters } from "@/components/admin/OrdersFilters";
import { StatCardsSkeleton, TableSkeleton, Skeleton } from "@/components/admin/Skeleton";
import { OrdersContent } from "./OrdersContent";

type SearchParams = Promise<{
  status?: string;
  q?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDir?: string;
  period?: string;
}>;

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-6">
      {/* Header — renders instantly, independent of the DB fetch below */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("OrdersTitle")}</h1>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 print:hidden">
        <Suspense>
          <OrdersFilters />
        </Suspense>
      </div>

      {/* Data-dependent content streams in once the DB query resolves */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <StatCardsSkeleton />
            <TableSkeleton rows={6} cols={6} />
          </div>
        }
      >
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
