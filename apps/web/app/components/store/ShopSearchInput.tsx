"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

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

  const urlSearch = searchParams.get("search") ?? "";

  // Reflect changes made elsewhere (e.g. the navbar search) into this field.
  useEffect(() => {
    setValue(urlSearch);
  }, [urlSearch]);

  function pushValue(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("search", next);
    else params.delete("search");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      const current = searchParams.get("search") ?? "";
      if (value === current) return;
      pushValue(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 300);

    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function clear() {
    setValue("");
    pushValue("");
  }

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
          (onDark
            ? "w-full rounded-md border border-white/70 bg-black/55 py-3 pl-11 text-sm text-white shadow-lg placeholder:text-white/80 backdrop-blur-md outline-none focus:border-white"
            : "w-full rounded-xl border border-[var(--color-border)] bg-white py-3 pl-11 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20") +
          (value ? " pr-10" : " pr-4")
        }
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition ${
            onDark
              ? "text-white/80 hover:bg-white/20 hover:text-white"
              : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
          }`}
        >
          <X className="h-4 w-4" strokeWidth={onDark ? 2.5 : 2} />
        </button>
      )}
    </div>
  );
}
