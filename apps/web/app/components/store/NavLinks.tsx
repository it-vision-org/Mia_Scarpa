"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { CategoryNode } from "@/types";

function isActive(pathname: string, gender: string | null, href: string): boolean {
  const [hrefPath, hrefQuery] = href.split("?");
  if (pathname !== hrefPath) return false;
  if (!hrefQuery) return true;
  const hrefGender = new URLSearchParams(hrefQuery).get("gender");
  return gender === hrefGender;
}

const linkClass =
  "relative whitespace-nowrap py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-150 after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-[var(--color-text)] after:transition-all after:duration-200";

function GenderMenuItem({
  href,
  label,
  active,
  categories,
}: {
  href: string;
  label: string;
  active: boolean;
  categories: CategoryNode[];
}) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`${linkClass} flex items-center gap-1 ${
          active
            ? "text-[var(--color-text)] after:w-full"
            : "text-[var(--color-muted)] after:w-0 hover:text-[var(--color-text)] hover:after:w-full"
        }`}
      >
        {label}
        {categories.length > 0 && (
          <ChevronDown className="h-3 w-3 transition-transform duration-150 group-hover:-rotate-180" />
        )}
      </Link>

      {categories.length > 0 && (
        <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
          <div className="grid min-w-[220px] grid-cols-1 gap-x-8 gap-y-4 border border-[var(--color-border)] bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <Link
              href={href}
              className="text-xs font-semibold uppercase tracking-widest text-[var(--color-text)] hover:text-[var(--color-muted)]"
            >
              View all
            </Link>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <Link
                    href={`${href}&category=${cat.slug}`}
                    className="block whitespace-nowrap text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-muted)]"
                  >
                    {cat.name}
                  </Link>
                  {cat.children.length > 0 && (
                    <div className="mt-1.5 space-y-1.5">
                      {cat.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`${href}&category=${child.slug}`}
                          className="block whitespace-nowrap text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VerticalGenderItem({
  href,
  label,
  active,
  categories,
}: {
  href: string;
  label: string;
  active: boolean;
  categories: CategoryNode[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href={href}
          className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-colors duration-150 ${
            active ? "text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {label}
        </Link>
        {categories.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? `Hide ${label} categories` : `Show ${label} categories`}
            className="p-3 text-[var(--color-muted)]"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {open && (
        <div className="ml-4 space-y-3 border-l border-[var(--color-border)] py-2 pl-4">
          {categories.map((cat) => (
            <div key={cat.id}>
              <Link href={`${href}&category=${cat.slug}`} className="block text-sm text-[var(--color-text)]">
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="mt-1.5 space-y-1.5">
                  {cat.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`${href}&category=${child.slug}`}
                      className="block text-xs text-[var(--color-muted)]"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavLinks({
  vertical = false,
  categoryTree = [],
}: {
  vertical?: boolean;
  categoryTree?: CategoryNode[];
}) {
  const pathname = usePathname();
  const gender = useSearchParams().get("gender");
  const t = useTranslations("Nav");

  const GENDER_LINKS = [
    { href: "/shop?gender=men", label: t("Men") },
    { href: "/shop?gender=women", label: t("Women") },
  ];
  const OTHER_LINKS = [
    { href: "/about", label: t("About") },
    { href: "/contact", label: t("Contact") },
  ];

  if (vertical) {
    return (
      <div className="flex flex-col gap-1">
        {GENDER_LINKS.map(({ href, label }) => (
          <VerticalGenderItem
            key={href}
            href={href}
            label={label}
            active={isActive(pathname, gender, href)}
            categories={categoryTree}
          />
        ))}
        {OTHER_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-3 text-sm font-semibold uppercase tracking-widest transition-colors duration-150 ${
              isActive(pathname, gender, href)
                ? "text-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-8">
      {GENDER_LINKS.map(({ href, label }) => (
        <GenderMenuItem
          key={href}
          href={href}
          label={label}
          active={isActive(pathname, gender, href)}
          categories={categoryTree}
        />
      ))}
      {OTHER_LINKS.map(({ href, label }) => {
        const active = isActive(pathname, gender, href);
        return (
          <Link
            key={href}
            href={href}
            className={`${linkClass} ${
              active
                ? "text-[var(--color-text)] after:w-full"
                : "text-[var(--color-muted)] after:w-0 hover:text-[var(--color-text)] hover:after:w-full"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
