"use client";

import { useId, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/actions/customerAuthActions";

type Props = { initialFirstName: string; initialLastName: string; email: string };

function FloatInput({
  label,
  required,
  type = "text",
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <div className="relative border border-[var(--color-border)] bg-transparent transition focus-within:border-[var(--color-text)]">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        autoComplete={autoComplete}
        className="peer w-full bg-transparent px-4 pb-2 pt-3 text-sm text-[var(--color-text)] outline-none"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-[var(--color-bg)] px-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] transition-all peer-placeholder-shown:left-4 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-xs peer-focus:left-3 peer-focus:top-0 peer-focus:bg-[var(--color-bg)] peer-focus:px-1 peer-focus:text-[10px] peer-focus:text-[var(--color-text)]"
      >
        {label}
        {required ? " *" : ""}
      </label>
    </div>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--color-text)]">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border transition ${
          checked
            ? "border-[var(--color-text)] bg-[var(--color-text)] text-white"
            : "border-[var(--color-border)] bg-white"
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      {label}
    </label>
  );
}

function scorePassword(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

export function ProfileForm({ initialFirstName, initialLastName, email }: Props) {
  const t = useTranslations("Profile");

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [changeEmail, setChangeEmail] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => scorePassword(newPassword), [newPassword]);
  const strengthLabel = [
    t("StrengthNone"),
    t("StrengthWeak"),
    t("StrengthMedium"),
    t("StrengthMedium"),
    t("StrengthStrong"),
  ][strength];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (changePassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await updateProfile({
        firstName,
        lastName,
        changeEmail,
        newEmail: changeEmail ? newEmail : undefined,
        changePassword,
        currentPassword: changeEmail || changePassword ? currentPassword : undefined,
        newPassword: changePassword ? newPassword : undefined,
        confirmPassword: changePassword ? confirmPassword : undefined,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      const emailChanged = changeEmail;
      setChangeEmail(false);
      setChangePassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);

      if (emailChanged) window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
          {t("AccountInformation")}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">{t("RequiredNote")}</p>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("Updated")}
        </div>
      )}

      <div className="space-y-4">
        <FloatInput
          label={t("FirstName")}
          required
          value={firstName}
          onChange={setFirstName}
          autoComplete="given-name"
        />
        <FloatInput
          label={t("LastName")}
          required
          value={lastName}
          onChange={setLastName}
          autoComplete="family-name"
        />
      </div>

      <div className="space-y-4">
        <CheckboxRow checked={changeEmail} onChange={setChangeEmail} label={t("ChangeEmail")} />
        <CheckboxRow
          checked={changePassword}
          onChange={setChangePassword}
          label={t("ChangePassword")}
        />
      </div>

      {changeEmail && (
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-[var(--color-text)]">
            {t("ChangeEmail")}
          </h2>
          <FloatInput
            label={t("Email")}
            required
            type="email"
            value={newEmail}
            onChange={setNewEmail}
            autoComplete="email"
          />
          {!changePassword && (
            <FloatInput
              label={t("CurrentPassword")}
              required
              type="password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
            />
          )}
        </section>
      )}

      {changePassword && (
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wide text-[var(--color-text)]">
            {t("ChangePassword")}
          </h2>
          <FloatInput
            label={t("CurrentPassword")}
            required
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <FloatInput
            label={t("NewPassword")}
            required
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <div className="bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)]">
            <div className="flex items-center justify-between">
              <span>
                {t("PasswordStrength")}: <span className="font-semibold">{strengthLabel}</span>
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 ${
                    i < strength ? "bg-[var(--color-text)]" : "bg-[var(--color-border)]"
                  }`}
                />
              ))}
            </div>
          </div>
          <FloatInput
            label={t("ConfirmNewPassword")}
            required
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
        </section>
      )}

      <div className="flex items-center gap-6 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 border-2 border-[var(--color-text)] px-10 py-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white disabled:opacity-60"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {t("SaveBtn")}
        </button>
        <Link
          href="/account"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition hover:text-[var(--color-text)]"
        >
          {t("GoBack")}
        </Link>
      </div>
    </form>
  );
}
