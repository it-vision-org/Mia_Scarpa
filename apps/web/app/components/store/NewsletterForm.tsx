"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { submitContact } from "@/actions/contactActions";

export function NewsletterForm({
  emailPlaceholder,
  phonePlaceholder,
  submitLabel,
}: {
  emailPlaceholder: string;
  phonePlaceholder: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError("Enter an email or phone number");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await submitContact({
        name: "Newsletter signup",
        email: email.trim() || "no-email@provided.local",
        phone: phone.trim() || undefined,
        subject: "Newsletter / callback request",
        message: "Requested to be added to the mailing list / called back.",
      });
      if (res.success) {
        setSent(true);
        setEmail("");
        setPhone("");
      } else {
        setError(res.error ?? "Something went wrong");
      }
    });
  }

  if (sent) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text)]">
        <CheckCircle2 className="h-4 w-4" /> Thanks — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <div className="flex border-b border-[var(--color-text)]">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={emailPlaceholder}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
        />
      </div>
      <div className="flex border-b border-[var(--color-border)]">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={phonePlaceholder}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--color-text)] transition hover:text-[var(--color-muted)] disabled:opacity-60"
        >
          {pending && <Loader2 className="h-3 w-3 animate-spin" />}
          {submitLabel}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
