"use client";

import { usePromoBadgeImage } from "./PromoContext";
import type { SerializedProduct } from "@/types";

type Props = {
  product: Pick<SerializedProduct, "promoLive" | "promoImage" | "promoLabel" | "promoPercent">;
  className?: string;
};

/**
 * Corner promo badge for product cards / galleries. Shows the product's own
 * promo image, else the global default image, else a "-X%" / custom-label tag.
 * Render inside a `relative` container.
 */
export function PromoBadge({ product, className = "" }: Props) {
  const defaultImage = usePromoBadgeImage();
  if (!product.promoLive) return null;

  const img = product.promoImage || defaultImage;
  const label = product.promoLabel?.trim() || `-${product.promoPercent}%`;

  if (img) {
    return (
      <img
        src={img}
        alt={label}
        className={`pointer-events-none absolute left-2 top-2 z-20 h-24 w-24 object-contain drop-shadow-md sm:h-28 sm:w-28 ${className}`}
      />
    );
  }

  return (
    <span
      className={`pointer-events-none absolute left-2 top-2 z-20 rounded bg-[var(--color-promo)] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white shadow ${className}`}
    >
      {label}
    </span>
  );
}
