import { getTranslations } from "next-intl/server";
import { getCategoryTree } from "@/actions/categoryActions";
import { CategoriesClient } from "@/components/admin/CategoriesClient";

export default async function AdminCategoriesPage() {
  const [t, menResult, womenResult] = await Promise.all([
    getTranslations("Admin"),
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
  ]);
  const menTree = menResult.success ? (menResult.data ?? []) : [];
  const womenTree = womenResult.success ? (womenResult.data ?? []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("CategoriesTitle")}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t("CategoriesDesc")}</p>
      </div>
      <CategoriesClient menTree={menTree} womenTree={womenTree} />
    </div>
  );
}
