import { ProductCard } from "./ProductCard";
import type { SerializedProduct } from "@/types";

// tiny tileable fractal-noise texture — adds a barely-there grain so the grid
// doesn't read as a flat grey table
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function ProductGrid({ products }: { products: SerializedProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="mx-6 border border-dashed border-[var(--color-border)] py-16 text-center">
        <p className="text-[var(--color-muted)]">No products found.</p>
      </div>
    );
  }

  return (
    <div className="relative isolate">
      {/* soft feathered light-pool + grain behind the grid — purely decorative */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-8 -inset-y-12 -z-10 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 55% at 50% 28%, var(--color-surface) 0%, transparent 72%)",
            opacity: 0.75,
          }}
        />
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{ backgroundImage: GRAIN, opacity: 0.045 }}
        />
      </div>

      {/* the mesh feathers diagonally from grey into the page tone; a whisper of
          depth lifts the block off the background */}
      <div className="grid grid-cols-2 gap-px bg-gradient-to-br from-[var(--color-border)] via-[var(--color-border)] to-[var(--color-bg)] shadow-[0_1px_44px_-16px_rgba(0,0,0,0.14)] sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
