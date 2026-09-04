"use client";

import { useRef, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { User, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { logoutUser } from "@/actions/customerAuthActions";

type Props = { name: string; email: string; role: string };

const ADMIN_ROLES = new Set(["ADMIN", "SUPER_ADMIN"]);

export function UserMenu({ name, role }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("UserMenu");

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    startTransition(async () => {
      await logoutUser();
      window.location.href = "/";
    });
  }

  const itemClass =
    "block w-full px-4 py-3 text-left text-sm text-[var(--color-text)] transition hover:bg-[var(--color-bg)]";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={name}
        aria-expanded={open}
        className="relative flex items-center text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
      >
        <User size={20} strokeWidth={1.5} />
        {ADMIN_ROLES.has(role) && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-[var(--color-accent)] ring-2 ring-[var(--color-bg)]" />
        )}
      </button>

      {open && (
        <div className="animate-ui-slide-down absolute right-0 top-full mt-3 w-48 border border-[var(--color-border)] bg-white shadow-lg z-50">
          {ADMIN_ROLES.has(role) && (
            <Link
              href="/admin/orders"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-bg)]"
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            disabled={isPending}
            className={`${itemClass} disabled:opacity-60`}
          >
            {isPending && <Loader2 size={14} className="mr-2 inline animate-spin align-[-2px]" />}
            {t("SignOut")}
          </button>

          <Link href="/account/profile" onClick={() => setOpen(false)} className={itemClass}>
            {t("MyProfile")}
          </Link>

          <Link href="/account" onClick={() => setOpen(false)} className={itemClass}>
            {t("MyOrders")}
          </Link>
        </div>
      )}
    </div>
  );
}
