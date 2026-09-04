"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/cart-context";
import { useTranslations } from "next-intl";

export function CartIcon() {
  const { count, openDrawer } = useCart();
  const t = useTranslations("Nav");

  return (
    <button
      onClick={openDrawer}
      aria-label={t("Cart")}
      className="relative flex items-center text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
    >
      <ShoppingBag size={20} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-[var(--color-accent)] px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
