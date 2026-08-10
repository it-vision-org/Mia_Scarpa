"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function ShopSearchInput({
  defaultValue,
  onDark = false,
}: {
  defaultValue?: string;
  onDark?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (value === current) return;

      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value);
      else params.delete("search");

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full max-w-xs">
      <Search
        className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${
          onDark ? "" : "text-[var(--color-muted)]"
        }`}
        style={onDark ? { color: "#ffffff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" } : undefined}
        strokeWidth={onDark ? 2.5 : 2}
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search shoes..."
        className={
          onDark
            ? "w-full border border-white/40 bg-black/30 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/70 backdrop-blur-md outline-none focus:border-white/70"
            : "w-full rounded-xl border border-[var(--color-border)] bg-white py-3 pl-11 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        }
      />
    </div>
  );
}
