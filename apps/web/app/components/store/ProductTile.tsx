import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct } from "@/types";

export function ProductTile({ product }: { product: SerializedProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden bg-[var(--color-bg)]"
    >
      {/* image area — full-bleed, image never cropped/cut */}
      <div className="relative flex-1 overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            className="object-contain p-6 transition duration-300 group-hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        ) : null}
        {product.isFeatured && (
          <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
            Featured
          </span>
        )}
      </div>

      {/* white info bar — name + price always legible */}
      <div className="border-t border-[var(--color-border)] bg-white px-4 py-3">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">{product.name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-[var(--color-muted)]">{product.category?.name ?? ""}</p>
          <p className="shrink-0 text-sm font-semibold text-[var(--color-text)]">
            {formatPrice(product.basePrice)}
          </p>
        </div>
      </div>
    </Link>
  );
}
