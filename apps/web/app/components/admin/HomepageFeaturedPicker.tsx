"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, Check, Loader2, CheckCircle2 } from "lucide-react";
import { saveHomepageFeaturedProducts } from "@/actions/storeSettingsActions";

type PickerProduct = {
  id: string;
  name: string;
  priceCents: number;
  images: string[];
  isPublished: boolean;
};

const MAX_PICKS = 4;

export function HomepageFeaturedPicker({
  products,
  initialSelectedIds,
}: {
  products: PickerProduct[];
  initialSelectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(
    initialSelectedIds.filter((id) => products.some((p) => p.id === id)),
  );
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
    return list.filter((p) => p.isPublished);
  }, [products, search]);

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, id];
    });
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await saveHomepageFeaturedProducts(selected);
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-[var(--color-text)]">
          Selected {selected.length} / {MAX_PICKS}
        </p>
        <p className="text-xs text-[var(--color-muted)]">
          Pick up to {MAX_PICKS} products for the "image + products" row right below the hero
          video. Leave empty to fall back to your featured products automatically.
        </p>
      </div>

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
        />
      </div>

      <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((product) => {
          const index = selected.indexOf(product.id);
          const isSelected = index !== -1;
          const disabled = !isSelected && selected.length >= MAX_PICKS;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              disabled={disabled}
              className={`group relative overflow-hidden rounded-xl border text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30" : "border-[var(--color-border)]"
              }`}
            >
              <div className="relative aspect-square bg-[var(--color-bg)]">
                {product.images[0] && (
                  <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                )}
                {isSelected && (
                  <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="bg-white p-1.5">
                <p className="truncate text-[11px] font-semibold text-[var(--color-text)]">{product.name}</p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-[var(--color-muted)]">No products found.</p>
        )}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={handleSave}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        {pending ? "Saving…" : saved ? "Saved!" : "Save Selection"}
      </button>
    </div>
  );
}
