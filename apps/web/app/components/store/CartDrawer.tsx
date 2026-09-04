"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { CartItemVariantEditor } from "./CartItemVariantEditor";

export function CartDrawer() {
  const { items, count, total, drawerOpen, closeDrawer, updateQty, removeItem } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      {/* backdrop */}
      <div
        className="animate-ui-fade-in fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeDrawer}
      />

      {/* drawer */}
      <div className="animate-ui-slide-in-right fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text)]">
            My Bag {count > 0 && <span className="text-[var(--color-muted)]">({count})</span>}
          </span>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <p className="text-sm text-[var(--color-text)]">You have no items in your bag.</p>
              <button
                onClick={closeDrawer}
                className="border-2 border-[var(--color-text)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 first:pt-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="h-28 w-24 flex-shrink-0 bg-[var(--color-bg)] object-cover"
                    />
                  ) : (
                    <div className="h-28 w-24 flex-shrink-0 bg-[var(--color-border)]" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold uppercase text-[var(--color-text)]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text)]">{formatPrice(item.unitPrice)}</p>

                    <div className="mt-2 space-y-0.5 text-xs text-[var(--color-muted)]">
                      {item.colorName && (
                        <p>
                          Color: <span className="text-[var(--color-text)]">{item.colorName}</span>
                        </p>
                      )}
                      {item.size && (
                        <p>
                          Size: <span className="text-[var(--color-text)]">{item.size}</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-2">
                      <CartItemVariantEditor item={item} />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[var(--color-border)]">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="px-2 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[20px] text-center text-sm font-semibold text-[var(--color-text)]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="px-2 py-1.5 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-[var(--color-muted)] transition hover:text-red-500"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="space-y-3 border-t border-[var(--color-border)] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-muted)]">Subtotal</span>
              <span className="font-bold text-[var(--color-text)]">{formatPrice(total)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="block w-full border-2 border-[var(--color-text)] py-3.5 text-center text-sm font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="block w-full bg-[var(--color-text)] py-3.5 text-center text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[var(--color-green-mid)]"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
