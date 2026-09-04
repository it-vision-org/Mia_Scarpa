"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

export function AccountNav({
  items,
  signOutLabel,
  signOut,
}: {
  items: Item[];
  signOutLabel: string;
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `block px-4 py-3 text-xs font-semibold uppercase tracking-widest transition ${
      active
        ? "bg-[var(--color-bg)] text-[var(--color-text)]"
        : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
    }`;

  return (
    <nav className="flex flex-row flex-wrap gap-1 border-b border-[var(--color-border)] pb-3 lg:flex-col lg:border-b-0 lg:pb-0">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
          {item.label}
        </Link>
      ))}

      <form action={signOut} className="lg:mt-1">
        <button
          type="submit"
          className="w-full px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] transition hover:text-red-600"
        >
          {signOutLabel}
        </button>
      </form>
    </nav>
  );
}
