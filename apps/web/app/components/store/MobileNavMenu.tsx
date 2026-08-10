"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./NavLinks";
import type { CategoryNode } from "@/types";

export function MobileNavMenu({ categoryTree = [] }: { categoryTree?: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-9 w-9 items-center justify-center border border-[var(--color-border)] text-[var(--color-text)] transition hover:border-[var(--color-text)]"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 shadow-lg">
          <Suspense fallback={null}>
            <NavLinks vertical categoryTree={categoryTree} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
