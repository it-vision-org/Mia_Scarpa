import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { getCategoryTree } from "@/actions/categoryActions";

export default async function NewProductPage() {
  const [t, result] = await Promise.all([getTranslations("Admin"), getCategoryTree()]);
  const categoryTree = result.success ? (result.data ?? []) : [];

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
      >
        <ChevronLeft className="h-4 w-4" />
        {t("BackToProducts")}
      </Link>
      <h1 className="mb-1 text-2xl font-bold text-[var(--color-text)]">{t("AddShoeTitle")}</h1>
      <p className="mb-8 text-sm text-[var(--color-muted)]">{t("AddShoeDesc")}</p>
      <ProductForm categoryTree={categoryTree} />
    </div>
  );
}
