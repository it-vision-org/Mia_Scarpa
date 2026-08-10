"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { saveHeroSettings } from "@/actions/storeSettingsActions";
import type { HeroText } from "@/types";

type Props = {
  initial: HeroText;
  onPreviewChange?: (v: HeroText) => void;
};

export function HeroTextEditor({ initial, onPreviewChange }: Props) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set(key: keyof typeof form, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setSaved(false);
    onPreviewChange?.(next);
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await saveHeroSettings({
        heroCta1: form.cta1,
      });
      if (res.success) setSaved(true);
      else setError(res.error ?? "Failed to save");
    });
  }

  return (
    <div className="space-y-4">
      <Field label="Button text">
        <input value={form.cta1} onChange={(e) => set("cta1", e.target.value)} className={inp} />
      </Field>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      <SaveButton pending={pending} saved={saved} onClick={handleSave} />
    </div>
  );
}

// ── Shared helpers exported for other editor files ─────────────────────────

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SaveButton({ pending, saved, onClick }: { pending: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : null}
      {pending ? "Saving…" : saved ? "Saved!" : "Save Changes"}
    </button>
  );
}

export const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";
