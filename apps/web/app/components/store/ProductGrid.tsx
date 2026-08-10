import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

export function ProductGrid({ products }: { products: SerializedProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="mx-6 border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-[var(--color-muted)]">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--color-border)] sm:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
