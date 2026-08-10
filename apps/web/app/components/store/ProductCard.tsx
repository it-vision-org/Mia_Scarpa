"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { SerializedProduct } from "@/types";
import { QuickAddModal } from "./QuickAddModal";

export function ProductCard({ product }: { product: SerializedProduct }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // top-level product images are rare in practice — most products only carry
  // per-color images, so fall back to those (same convention as ProductGallery).
  const images =
    product.images.length > 0 ? product.images : product.colors.flatMap((c) => c.images);
  const activeImage = images[activeIndex]?.url ?? product.primaryImage;

  function goToImage(e: React.MouseEvent, index: number) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(index);
  }

  function goToPrev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }

  function goToNext(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((i) => (i + 1) % images.length);
  }

  function openQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setQuickAddOpen(true);
  }

  return (
    <>
      <Link
        href={`/product/${product.slug}`}
        className="group block overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:border-[var(--color-text)]"
      >
        <div className="relative aspect-square overflow-hidden bg-[var(--color-bg)]">
          {activeImage ? (
            <Image
              key={activeImage}
              src={activeImage}
              alt={product.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
              No image
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute left-3 top-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-text)]">
              Featured
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--color-text)] opacity-0 shadow-sm backdrop-blur-sm transition hover:bg-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[var(--color-text)] opacity-0 shadow-sm backdrop-blur-sm transition hover:bg-white group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={(e) => goToImage(e, i)}
                    aria-label={`Show image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? "w-4 bg-white shadow" : "w-1.5 bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="p-4">
          {product.category?.name && (
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {product.category.name}
            </p>
          )}
          <h3 className="font-display mt-1 text-base text-[var(--color-text)]">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-[var(--color-text)]">
              {formatPrice(product.basePrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={openQuickAdd}
            className="mt-3 flex w-full items-center justify-center gap-2 border border-[var(--color-text)] py-2.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white active:scale-[0.98]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        </div>
      </Link>

      {quickAddOpen && (
        <QuickAddModal product={product} onClose={() => setQuickAddOpen(false)} />
      )}
    </>
  );
}
