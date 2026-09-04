"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type Option = { id: string; label: string };

/**
 * Custom category picker. Replaces a native <select> because the long, dynamic
 * (and sometimes nested) option list made Chrome dismiss the native popup on the
 * first click. This dropdown is a plain button + list, so re-renders and CSS
 * transitions can't collapse it mid-interaction.
 */
export function CategorySelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (id: string) => void;
  options: Option[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.id === value);
  const selectedLabel = selected ? selected.label.replace(/^(?:— )+/, "") : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-left text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
      >
        <span className={selected ? "text-[var(--color-text)]" : "text-[var(--color-muted)]"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-bg)]"
          >
            {placeholder}
            {value === "" && <Check className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />}
          </button>

          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition hover:bg-[var(--color-bg)] ${
                o.id === value ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text)]"
              }`}
            >
              <span className="whitespace-pre">{o.label}</span>
              {o.id === value && <Check className="h-4 w-4 shrink-0 text-[var(--color-accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
