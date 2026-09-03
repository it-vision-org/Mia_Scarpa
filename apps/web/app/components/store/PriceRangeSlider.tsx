"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

type Props = {
  min: number;
  max: number;
  valueMin?: number;
  valueMax?: number;
};

export function PriceRangeSlider({ min, max, valueMin, valueMax }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const span = Math.max(1, max - min);
  const step = Math.max(1, Math.round(span / 100));

  const [lo, setLo] = useState(valueMin ?? min);
  const [hi, setHi] = useState(valueMax ?? max);

  useEffect(() => {
    setLo(valueMin ?? min);
    setHi(valueMax ?? max);
  }, [valueMin, valueMax, min, max]);

  if (max <= min) return null;

  function commit(nextLo: number, nextHi: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextLo <= min) params.delete("minPrice");
    else params.set("minPrice", String(Math.round(nextLo)));
    if (nextHi >= max) params.delete("maxPrice");
    else params.set("maxPrice", String(Math.round(nextHi)));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const pctLo = ((lo - min) / span) * 100;
  const pctHi = ((hi - min) / span) * 100;

  return (
    <div>
      <div className="price-range relative h-6 select-none">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-border)]" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--color-text)]"
          style={{ left: `${pctLo}%`, right: `${100 - pctHi}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Minimum price"
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi - step))}
          onPointerUp={() => commit(lo, hi)}
          onKeyUp={() => commit(lo, hi)}
          onTouchEnd={() => commit(lo, hi)}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo + step))}
          onPointerUp={() => commit(lo, hi)}
          onKeyUp={() => commit(lo, hi)}
          onTouchEnd={() => commit(lo, hi)}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs font-medium text-[var(--color-muted)]">
        <span>{formatPrice(lo)}</span>
        <span>{formatPrice(hi)}</span>
      </div>
    </div>
  );
}
