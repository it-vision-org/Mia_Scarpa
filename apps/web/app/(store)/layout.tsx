import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { StoreHeader } from "@/components/store/StoreHeader";
import { NewsletterForm } from "@/components/store/NewsletterForm";
import { RouteProgress } from "@/components/store/RouteProgress";
import { PromoBadgeProvider } from "@/components/store/PromoContext";
import { getCurrentUser } from "@/lib/session";
import { getCategoryTree } from "@/actions/categoryActions";
import { getStoreSettings } from "@/actions/storeSettingsActions";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tFooter, tNav, user, menTreeResult, womenTreeResult, settingsResult] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
    getCurrentUser(),
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
    getStoreSettings(),
  ]);

  const promoBadgeImage = settingsResult.success
    ? settingsResult.data?.promoBadgeImage ?? null
    : null;

  const showAccount = !user;
  const departments = [
    {
      label: tNav("Men"),
      href: "/shop?gender=men",
      tree: menTreeResult.success ? (menTreeResult.data ?? []) : [],
    },
    {
      label: tNav("Women"),
      href: "/shop?gender=women",
      tree: womenTreeResult.success ? (womenTreeResult.data ?? []) : [],
    },
  ];

  return (
    <PromoBadgeProvider image={promoBadgeImage}>
      <Suspense fallback={null}>
        <RouteProgress />
      </Suspense>
      <StoreHeader />
      {children}
      <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)]">
                {tFooter("ShopHeading")}
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link href="/shop" className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
                    {tFooter("AllProducts")}
                  </Link>
                </li>
              </ul>

              {departments.map((dept) => (
                <div key={dept.href} className="mt-6">
                  <Link
                    href={dept.href}
                    className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
                  >
                    {dept.label}
                  </Link>
                  {dept.tree.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {dept.tree.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            href={`${dept.href}&category=${cat.slug}`}
                            className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                          >
                            {cat.name}
                          </Link>
                          {cat.children.length > 0 && (
                            <ul className="mt-2 space-y-2 border-l border-[var(--color-border)] pl-3">
                              {cat.children.map((child) => (
                                <li key={child.id}>
                                  <Link
                                    href={`${dept.href}&category=${child.slug}`}
                                    className="text-xs text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                                  >
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {showAccount && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)]">
                  {tFooter("AccountHeading")}
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <Link href="/account" className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
                      {tFooter("MyAccount")}
                    </Link>
                  </li>
                  <li>
                    <Link href="/account/login" className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
                      {tNav("SignIn")}
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            <div className={`col-span-2 ${showAccount ? "sm:col-span-1" : "sm:col-span-2"}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)]">
                {tFooter("NewsletterHeading")}
              </p>
              <p className="mt-4 text-sm text-[var(--color-muted)]">{tFooter("NewsletterDesc")}</p>
              <NewsletterForm
                emailPlaceholder={tFooter("NewsletterPlaceholder")}
                phonePlaceholder={tFooter("NewsletterPhonePlaceholder")}
                submitLabel={tFooter("NewsletterSubmit")}
              />
            </div>
          </div>

          <div className="mt-14 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-muted)]">
            © {new Date().getFullYear()} Mia Scarpa — {tFooter("Rights")}
          </div>
        </div>
      </footer>
    </PromoBadgeProvider>
  );
}
