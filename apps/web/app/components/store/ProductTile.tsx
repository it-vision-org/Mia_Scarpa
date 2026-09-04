import Link from "next/link";
import type { SerializedProduct } from "@/types";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";
import { PromoBadge } from "./PromoBadge";

// Square photo + a natural-height info bar below it — sized by its own width,
// never stretched to fill whatever height a parent grid hands it. `object-cover`
// crops to fill instead of letterboxing, so a square upload lands edge-to-edge
// with no padding, and any other ratio still fills the tile consistently.
export function ProductTile({ product }: { product: SerializedProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden bg-[var(--color-bg)]"
    >
      <div className="relative aspect-square overflow-hidden">
        <PromoBadge product={product} />
        {product.primaryImage ? (
          <ProductImage
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-muted)]">
            No image
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-widest text-white drop-shadow">
            Featured
          </span>
        )}
      </div>

      {/* white info bar — name + price always legible */}
      <div className="border-t border-[var(--color-border)] bg-white px-4 py-3">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{product.name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[var(--color-muted)]">{product.category?.name ?? ""}</p>
          <ProductPrice product={product} className="shrink-0 text-sm font-semibold text-[var(--color-text)]" />
        </div>
      </div>
    </Link>
  );
}
