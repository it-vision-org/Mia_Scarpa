"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitContact } from "@/actions/contactActions";

const inp =
  "w-full border border-[var(--color-border)] bg-transparent px-4 py-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-xs placeholder:font-semibold placeholder:uppercase placeholder:tracking-[0.15em] placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]";

const submitBtn =
  "inline-flex w-full items-center justify-center gap-2 border border-[var(--color-text)] bg-[var(--color-text)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-transparent hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60";

export function ContactForm() {
  const t = useTranslations("Contact");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("ErrorName"));
      return;
    }
    if (!phone.trim()) {
      setError(t("ErrorPhone"));
      return;
    }
    if (!message.trim()) {
      setError(t("ErrorMessage"));
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await submitContact({ name, email, phone, message });
      if (!res.success) {
        setError(res.error ?? t("ErrorGeneric"));
        return;
      }
      setSent(true);
    });
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setError("");
    setSent(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 border border-[var(--color-border)] p-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-[var(--color-accent)]" />
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-[var(--color-text)]">
            {t("SuccessTitle")}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {t("SuccessBody", { name: name.split(" ")[0] })}
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 border border-[var(--color-border)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)] transition hover:border-[var(--color-text)]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("SendAnother")}
        </button>
      </div>
    );
  }

  const emailLabel = `${t("FieldEmail")} (${t("Optional")})`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("FieldName")}
        aria-label={t("FieldName")}
        className={inp}
      />

      <input
        required
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder={t("FieldPhone")}
        aria-label={t("FieldPhone")}
        className={inp}
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={emailLabel}
        aria-label={emailLabel}
        className={inp}
      />

      <textarea
        required
        rows={6}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("FieldMessage")}
        aria-label={t("FieldMessage")}
        className={inp + " resize-y"}
      />

      <button type="submit" disabled={isPending} className={submitBtn}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? t("Submitting") : t("Submit")}
      </button>
    </form>
  );
}
