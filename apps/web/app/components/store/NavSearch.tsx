"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function NavSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Nav");

  const urlSearch = searchParams.get("search") ?? "";
  const [manualOpen, setManualOpen] = useState(false);
  const [query, setQuery] = useState(urlSearch);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the field in sync with the active search in the URL (e.g. cleared or
  // changed from the shop banner search).
  useEffect(() => {
    setQuery(urlSearch);
  }, [urlSearch]);

  // Expanded whenever there is an active search, or the user opened it.
  const open = manualOpen || urlSearch !== "";

  useEffect(() => {
    if (manualOpen) inputRef.current?.focus();
  }, [manualOpen]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setManualOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setManualOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function goToSearch(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("search", next.trim());
    else params.delete("search");
    const qs = params.toString();
    const base = next.trim() ? "/shop" : pathname;
    router.push(qs ? `${base}?${qs}` : base);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }
    setManualOpen(false);
    goToSearch(query);
  }

  function clear() {
    setQuery("");
    setManualOpen(false);
    if (urlSearch) goToSearch("");
    inputRef.current?.focus();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setManualOpen(true)}
        aria-label={t("Search")}
        className="flex items-center rounded-xl border border-[var(--color-border)] p-2.5 text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-accent)]"
      >
        <Search size={16} />
      </button>
    );
  }

  return (
    <div ref={wrapRef}>
      <form
        onSubmit={submit}
        className="flex items-center gap-1 rounded-xl border border-[var(--color-accent)] bg-white pl-2.5 pr-1 py-1"
      >
        <Search size={15} className="shrink-0 text-[var(--color-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("Search")}
          aria-label={t("Search")}
          className="w-24 bg-transparent py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none sm:w-32"
        />
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="shrink-0 rounded-lg p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
        >
          <X size={14} />
        </button>
      </form>
    </div>
  );
}
