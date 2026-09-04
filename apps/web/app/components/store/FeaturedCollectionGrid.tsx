"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

// Homepage "Featured Shoes" collection block. A plain grid — sized to however
// many cards there are, never padded out with dead empty cells — up to 4
// products; past that it becomes a horizontally-paged slider instead of
// wrapping into a mostly-empty extra row.
export function FeaturedCollectionGrid({ products }: { products: SerializedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return (
      <div className="border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-[var(--color-muted)]">No products found.</p>
      </div>
    );
  }

  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="grid grid-flow-col auto-cols-[85%] gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth sm:auto-cols-[46%] lg:auto-cols-[24%] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Previous"
        className="absolute left-2 top-[34%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[var(--color-text)] shadow-sm backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Next"
        className="absolute right-2 top-[34%] z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[var(--color-text)] shadow-sm backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
