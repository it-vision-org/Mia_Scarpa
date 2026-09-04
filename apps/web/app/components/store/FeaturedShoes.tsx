"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTile } from "./ProductTile";
import type { SerializedProduct } from "@/types";

// Right-hand side of the homepage "featured" section. Every tile is a perfect
// square (see ProductTile), so this grid is always sized by its own content —
// never stretched to fill an arbitrary fixed-height box, which used to distort
// how images filled their tile. With more than 4 products it becomes a
// horizontally-paged 2-row slider instead of wrapping into extra rows.
export function FeaturedShoes({ products }: { products: SerializedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  if (products.length <= 4) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} />
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
        className="grid auto-cols-[50%] grid-flow-col grid-rows-2 gap-1 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductTile product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Previous"
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[var(--color-text)] shadow-sm backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Next"
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-[var(--color-text)] shadow-sm backdrop-blur-sm transition hover:bg-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
