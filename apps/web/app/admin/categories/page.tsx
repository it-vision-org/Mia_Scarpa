import { getCategoryTree } from "@/actions/categoryActions";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const [menResult, womenResult] = await Promise.all([
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
  ]);
  const menTree = menResult.success ? (menResult.data ?? []) : [];
  const womenTree = womenResult.success ? (womenResult.data ?? []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Categories</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Men's and Women's categories are kept separate — create sub-categories under either
          (e.g. Sneakers → Running Sneakers) to match how products can be grouped in the shop.
        </p>
      </div>
      <CategoriesClient menTree={menTree} womenTree={womenTree} />
    </div>
  );
}
