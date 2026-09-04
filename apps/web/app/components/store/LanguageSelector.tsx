"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { changeLocaleAction } from "@/actions/localeAction";

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const LANGUAGES: Language[] = [
  { code: "fr", name: "French",  nativeName: "Français" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic",  nativeName: "العربية" },
];

export function LanguageSelector() {
  const activeLocale = useLocale();
  const t = useTranslations("LanguageSelector");
  const initialLang = LANGUAGES.find((l) => l.code === activeLocale) ?? LANGUAGES[0];

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Language>(initialLang);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  async function handleSelect(lang: Language) {
    setSelected(lang);
    setIsOpen(false);
    await changeLocaleAction(lang.code);
    window.location.reload();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe size={20} strokeWidth={1.5} />
        <span className="hidden sm:block uppercase tracking-wide text-xs font-medium">{selected.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-52 overflow-hidden border border-[var(--color-border)] bg-white shadow-lg z-50">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
              {t("Label")}
            </p>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selected.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isSelected
                      ? "bg-[var(--color-accent)]/10"
                      : "hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg)]">
                    <Globe className={`h-4 w-4 ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"}`} />
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
                      {lang.name}
                    </p>
                    <p className={`text-xs ${isSelected ? "text-[var(--color-accent)]" : "text-[var(--color-muted)]"} ${lang.code === "ar" ? "text-right" : ""}`}>
                      {lang.nativeName}
                    </p>
                  </div>
                  {isSelected && (
                    <svg className="h-4 w-4 flex-shrink-0 text-[var(--color-accent)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
