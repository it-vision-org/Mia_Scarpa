"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { getDeliveryFee } from "@/actions/storeSettingsActions";
import { CartItemVariantEditor } from "@/components/store/CartItemVariantEditor";

export default function CartPage() {
  const { items, total, updateQty, removeItem, isHydrated } = useCart();
  const t = useTranslations("Cart");
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
  }, []);

  if (!isHydrated) return null;

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10 text-center lg:py-14">
        <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">{t("Empty")}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t("EmptyDesc")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center justify-center gap-2 border-2 border-[var(--color-text)] px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
        >
          {t("Continue")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">{t("Title")}</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-5">
        {/* Items list */}
        <div className="divide-y divide-[var(--color-border)] lg:col-span-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 py-5 first:pt-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-24 w-20 flex-shrink-0 object-cover"
                />
              ) : (
                <div className="h-24 w-20 flex-shrink-0 bg-[var(--color-border)]" />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${item.productSlug}`}
                      className="font-semibold text-[var(--color-text)] transition hover:text-[var(--color-accent)]"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {[item.size && `${t("Size")}: ${item.size}`, item.colorName].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-1.5">
                      <CartItemVariantEditor item={item} />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 p-1 text-[var(--color-muted)] transition hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="inline-flex items-center border border-[var(--color-border)]">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="px-2.5 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[24px] text-center text-sm font-semibold text-[var(--color-text)]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="px-2.5 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-[var(--color-text)]">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
              {t("OrderSummary")}
            </h2>

            <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Subtotal")}</span>
                <span className="font-semibold text-[var(--color-text)]">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted)]">{t("Shipping")}</span>
                <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-[var(--color-text)]"}`}>
                  {deliveryFee === 0 ? t("Free") : formatPrice(deliveryFee)}
                </span>
              </div>
            </div>

            <div className="flex justify-between border-t border-[var(--color-border)] pt-4">
              <span className="font-bold text-[var(--color-text)]">{t("Total")}</span>
              <span className="font-bold text-[var(--color-text)]">{formatPrice(total + deliveryFee)}</span>
            </div>

            <Link
              href="/checkout"
              className="mt-2 flex w-full items-center justify-center gap-2 border-2 border-[var(--color-text)] py-3.5 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
            >
              {t("Checkout")}
            </Link>

            <Link
              href="/shop"
              className="block text-center text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              {t("Continue")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
