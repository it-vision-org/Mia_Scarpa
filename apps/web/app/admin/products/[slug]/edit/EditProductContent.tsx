import { notFound } from "next/navigation";
import { getProductForEdit } from "@/actions/adminActions";
import { getCategoryTree } from "@/actions/categoryActions";
import { ProductForm } from "@/components/admin/ProductForm";

export async function EditProductContent({ slug }: { slug: string }) {
  const [result, categoryResult] = await Promise.all([
    getProductForEdit(slug),
    getCategoryTree(),
  ]);
  if (!result.success || !result.data) notFound();

  const categoryTree = categoryResult.success ? (categoryResult.data ?? []) : [];

  return <ProductForm initialData={result.data} categoryTree={categoryTree} />;
}
