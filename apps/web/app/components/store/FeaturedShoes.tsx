"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTile } from "./ProductTile";
import type { SerializedProduct } from "@/types";

// Right-hand side of the homepage "featured" section. With exactly 4 products
// it's the classic 2x2 grid; with more than 4 it becomes a horizontally-paged
// 2-row slider (same 2x2 look, just paginated); with fewer than 4 it's a
// plain grid sized to the cards themselves instead of stretched to fill a
// fixed box (see `featuredBoxed` in the page — it mirrors this >= 4 split).
export function FeaturedShoes({ products }: { products: SerializedProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  if (products.length < 4) {
    return (
      <div className="grid grid-cols-2 gap-1">
        {products.map((product) => (
          <div key={product.id} className="relative aspect-square">
            <ProductTile product={product} />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 4) {
    return (
      <div className="grid h-[420px] grid-cols-2 grid-rows-2 gap-1 lg:h-full">
        {products.map((product) => (
          <div key={product.id} className="relative h-full w-full">
            <ProductTile product={product} />
          </div>
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
    <div className="relative h-[420px] lg:h-full">
      <div
        ref={trackRef}
        className="grid h-full auto-cols-[50%] grid-flow-col grid-rows-2 gap-1 overflow-x-auto snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <div key={product.id} className="relative h-full w-full snap-start">
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
