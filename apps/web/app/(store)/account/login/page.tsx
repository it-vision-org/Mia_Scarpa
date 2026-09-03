"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/actions/customerAuthActions";

const inp =
  "w-full border border-[var(--color-border)] bg-transparent px-4 py-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-xs placeholder:font-semibold placeholder:uppercase placeholder:tracking-[0.15em] placeholder:text-[var(--color-muted)] focus:border-[var(--color-text)]";

const submitBtn =
  "inline-flex w-full items-center justify-center gap-2 border border-[var(--color-text)] bg-[var(--color-text)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-transparent hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-60";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Login");
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await loginUser({ email, password });
      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/account");
    });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-text)]">{t("Title")}</h1>
        <p className="text-sm text-[var(--color-muted)]">{t("Subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("Email")}
          aria-label={t("Email")}
          className={inp}
        />

        <div className="relative">
          <input
            required
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("Password")}
            aria-label={t("Password")}
            className={inp + " pr-11"}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button type="submit" disabled={isPending} className={submitBtn}>
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {t("Submit")}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--color-muted)]">
        {t("NoAccount")}{" "}
        <Link href="/account/register" className="font-semibold text-[var(--color-accent)] hover:underline">{t("CreateOne")}</Link>
      </p>
    </main>
  );
}
