import { formatPrice } from "@/lib/utils";
import type { SerializedProduct } from "@/types";

type Props = {
  product: Pick<
    SerializedProduct,
    "basePrice" | "effectivePrice" | "promoLive" | "promoLabel" | "promoPercent"
  >;
  className?: string;
  /** stack the old + new price on two lines instead of inline */
  stacked?: boolean;
  /** hide the -X% / label chip (badge image already shows it elsewhere) */
  hideTag?: boolean;
};

/** Price display: struck-through old price + coloured sale price + a -X% / label chip when a promo is live. */
export function ProductPrice({ product, className = "", stacked = false, hideTag = false }: Props) {
  if (!product.promoLive) {
    return <span className={className}>{formatPrice(product.basePrice)}</span>;
  }

  const tag = product.promoLabel?.trim() || `-${product.promoPercent}%`;

  return (
    <span className={`${stacked ? "flex flex-col" : "inline-flex flex-wrap items-baseline gap-x-2 gap-y-1"} ${className}`}>
      <span className="text-[var(--color-muted)] line-through decoration-1">
        {formatPrice(product.basePrice)}
      </span>
      <span className="font-semibold text-[var(--color-promo)]">
        {formatPrice(product.effectivePrice)}
      </span>
      {!hideTag && (
        <span className="rounded bg-[var(--color-promo)]/10 px-1.5 py-0.5 text-[11px] font-bold uppercase leading-none text-[var(--color-promo)]">
          {tag}
        </span>
      )}
    </span>
  );
}
