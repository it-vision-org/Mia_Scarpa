import { getAdminProducts } from "@/actions/adminActions";
import { getTranslations } from "next-intl/server";
import { ProductsTable } from "@/components/admin/ProductsTable";

export async function ProductsContent() {
  const [t, result] = await Promise.all([getTranslations("Admin"), getAdminProducts()]);
  const products = result.success ? (result.data ?? []) : [];

  return (
    <>
      <p className="mt-0.5 text-sm text-[var(--color-muted)]">
        {t("ShoesTotal", { count: products.length })}
      </p>
      <div className="mt-6">
        <ProductsTable products={products} />
      </div>
    </>
  );
}
