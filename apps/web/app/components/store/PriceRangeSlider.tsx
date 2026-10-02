"use client";

import { useEffect, useRef, useState } from "react";
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
  const [editing, setEditing] = useState<"lo" | "hi" | null>(null);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLo(valueMin ?? min);
    setHi(valueMax ?? max);
  }, [valueMin, valueMax, min, max]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

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

  function startEditing(field: "lo" | "hi") {
    setDraft(String(Math.round(field === "lo" ? lo : hi)));
    setEditing(field);
  }

  function submitEditing() {
    if (!editing) return;
    const parsed = Number(draft.replace(/[^\d]/g, ""));
    if (!Number.isNaN(parsed) && draft.trim() !== "") {
      if (editing === "lo") {
        const nextLo = Math.min(Math.max(parsed, min), hi - step);
        setLo(nextLo);
        commit(nextLo, hi);
      } else {
        const nextHi = Math.max(Math.min(parsed, max), lo + step);
        setHi(nextHi);
        commit(lo, nextHi);
      }
    }
    setEditing(null);
  }

  const pctLo = ((lo - min) / span) * 100;
  const pctHi = ((hi - min) / span) * 100;

  const editableInputClass =
    "w-16 border-b border-[var(--color-text)] bg-transparent text-xs font-medium text-[var(--color-text)] outline-none";

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
        {editing === "lo" ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEditing();
              if (e.key === "Escape") setEditing(null);
            }}
            className={editableInputClass}
          />
        ) : (
          <button
            type="button"
            onClick={() => startEditing("lo")}
            className="rounded px-0.5 transition hover:text-[var(--color-text)]"
          >
            {formatPrice(lo)}
          </button>
        )}

        {editing === "hi" ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitEditing}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitEditing();
              if (e.key === "Escape") setEditing(null);
            }}
            className={`${editableInputClass} text-right`}
          />
        ) : (
          <button
            type="button"
            onClick={() => startEditing("hi")}
            className="rounded px-0.5 transition hover:text-[var(--color-text)]"
          >
            {formatPrice(hi)}
          </button>
        )}
      </div>
    </div>
  );
}
