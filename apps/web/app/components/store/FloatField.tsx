"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  /** When set, renders a <textarea> with this many rows instead of an <input>. */
  rows?: number;
  autoComplete?: string;
};

const WRAP =
  "relative border border-[var(--color-border)] bg-transparent transition focus-within:border-[var(--color-text)]";

const FIELD =
  "peer w-full bg-transparent px-4 pb-2 pt-3 text-sm text-[var(--color-text)] outline-none";

/**
 * Outlined field with a notched, floating label — the label rests centered like
 * a placeholder and lifts onto the top border on focus or once filled.
 * Shared by the contact form and the account profile form.
 */
export function FloatField({ label, value, onChange, required, type = "text", rows, autoComplete }: Props) {
  const id = useId();

  const labelClass = [
    "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-[var(--color-bg)] px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] transition-all",
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
