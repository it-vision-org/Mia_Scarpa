"use client";

import { useId, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  /** When set, renders a <textarea> with this many rows instead of an <input>. */
  rows?: number;
  autoComplete?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onClick?: () => void;
};

const WRAP =
  "relative border border-[var(--color-border)] bg-transparent transition focus-within:border-[var(--color-text)]";

const FIELD =
  "peer w-full bg-transparent px-4 pb-2 pt-3 text-sm text-[var(--color-text)] outline-none disabled:cursor-not-allowed disabled:text-[var(--color-muted)]";

const LABEL =
  "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-[var(--color-bg)] px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] transition-all";

/**
 * Outlined field with a notched, floating label — the label rests centered like
 * a placeholder and lifts onto the top border on focus or once filled.
 * Shared by the contact form, the account profile form, and checkout.
 */
export function FloatField({
  label,
  value,
  onChange,
  required,
  type = "text",
  rows,
  autoComplete,
  disabled,
  onFocus,
  onBlur,
  onClick,
}: Props) {
  const id = useId();

  const labelClass = [
    LABEL,
    // resting state (empty, unfocused)
    rows
      ? "peer-placeholder-shown:left-4 peer-placeholder-shown:top-4 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-xs"
      : "peer-placeholder-shown:left-4 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-xs",
    // focused state — back onto the border
    "peer-focus:left-3 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:bg-[var(--color-bg)] peer-focus:px-1 peer-focus:text-[10px] peer-focus:text-[var(--color-text)]",
  ].join(" ");

  return (
    <div className={WRAP}>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          required={required}
          className={`${FIELD} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onClick={onClick}
          className={FIELD}
        />
      )}
      <label htmlFor={id} className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>
    </div>
  );
}

/**
 * Same outlined/notched look as FloatField, as a custom dropdown rather than a
 * native <select> — a native select's option list is positioned by the browser
 * itself and can pop up far from the field (flips above/covers other fields
 * when there isn't room below), which isn't something CSS can fix. This one is
 * a plain button + list, always anchored directly under the field.
 */
export function FloatSelect({
  label,
  value,
  onChange,
  required,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  options: string[];
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

  return (
    <div ref={ref} className={WRAP}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${FIELD} flex items-center justify-between gap-2 pt-5 text-left`}
      >
        <span className={value ? "" : "text-[var(--color-muted)]"}>{value || placeholder}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <label className={`${LABEL} left-3 top-0 -translate-y-1/2 px-1 text-[10px]`}>
        {label}
        {required ? " *" : ""}
      </label>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto border border-[var(--color-border)] bg-white shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={opt === value}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-[var(--color-bg)] ${
                opt === value ? "font-semibold text-[var(--color-text)]" : "text-[var(--color-text)]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
