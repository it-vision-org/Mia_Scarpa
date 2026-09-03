// Shared promotion logic — used by serialization, order pricing and the shop UI.

export type PromoFields = {
  basePrice: number;
  promoActive: boolean;
  promoPrice: number | null;
  promoStartsAt: string | Date | null;
  promoEndsAt: string | Date | null;
};

/** Is the promotion actually live right now (toggled on, priced lower, inside its date window)? */
export function isPromoLive(p: PromoFields, now: Date = new Date()): boolean {
  if (!p.promoActive) return false;
  if (p.promoPrice == null || !(p.promoPrice > 0)) return false;
  if (p.promoPrice >= p.basePrice) return false;
  if (p.promoStartsAt && new Date(p.promoStartsAt) > now) return false;
  if (p.promoEndsAt && new Date(p.promoEndsAt) < now) return false;
  return true;
}

/** Price the customer actually pays for this product (before any per-size override). */
export function effectivePrice(p: PromoFields, now: Date = new Date()): number {
  return isPromoLive(p, now) ? (p.promoPrice as number) : p.basePrice;
}

/** Discount percentage, rounded — e.g. 30 for "-30%". Returns 0 when no live promo. */
export function promoPercent(p: PromoFields, now: Date = new Date()): number {
  if (!isPromoLive(p, now)) return 0;
  return Math.round((1 - (p.promoPrice as number) / p.basePrice) * 100);
}
