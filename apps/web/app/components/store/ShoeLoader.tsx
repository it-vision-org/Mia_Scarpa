import { Footprints, Mars, Venus, Baby } from "lucide-react";

type Props = {
  label?: string;
  variant?: "default" | "men" | "women" | "enfant";
  /** Full-screen frosted popup (default) vs. inline block. */
  overlay?: boolean;
  /** play the fade/scale/blur-out exit animation */
  exiting?: boolean;
};

export function ShoeLoader({ label, variant = "default", overlay = true, exiting = false }: Props) {
  const GenderIcon = variant === "men" ? Mars : variant === "women" ? Venus : variant === "enfant" ? Baby : null;

  const core = (
    <div className="flex flex-col items-center gap-6">
      {/* rotating ring with a stepping shoe at its centre */}
      <div className="relative h-20 w-20">
        <svg
          className="loader-spin absolute inset-0 h-full w-full"
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden
        >
          <circle cx="24" cy="24" r="21" stroke="var(--color-border)" strokeWidth="2.5" />
          <circle
            cx="24"
            cy="24"
            r="21"
            stroke="var(--color-text)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="30 200"
          />
        </svg>
        <Footprints
          className="shoe-walk absolute inset-0 m-auto h-7 w-7 text-[var(--color-text)]"
          strokeWidth={1.5}
        />
      </div>

      {/* footstep trail */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="step-print h-2 w-3 rounded-full bg-[var(--color-muted)]"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      {label && (
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
          {GenderIcon && <GenderIcon className="h-3.5 w-3.5" />}
          {label}
        </p>
      )}
    </div>
  );

  if (!overlay) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[45vh] items-center justify-center px-6"
      >
        {core}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[70] grid place-items-center bg-[var(--color-bg)]/70 px-6 backdrop-blur-md ${
        exiting ? "loader-out" : ""
      }`}
    >
      <div
        className={`${
          exiting ? "" : "loader-fade"
        } flex flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-12 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.14)]`}
      >
        {core}
      </div>
    </div>
  );
}
