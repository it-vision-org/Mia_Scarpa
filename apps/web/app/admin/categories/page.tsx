import { getCategoryTree } from "@/actions/categoryActions";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const result = await getCategoryTree();
  const tree = result.success ? (result.data ?? []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Categories</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Organize products into categories and sub-categories. Every product is Men's or
          Women's first (set on the product itself) — categories are the finer grouping within
          that, e.g. Sneakers, or Sneakers → Running Sneakers.
        </p>
      </div>
      <CategoriesClient initialTree={tree} />
    </div>
  );
}
