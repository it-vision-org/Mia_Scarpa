import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { StoreHeader } from "@/components/store/StoreHeader";
import { NewsletterForm } from "@/components/store/NewsletterForm";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tFooter, tNav] = await Promise.all([
    getTranslations("Footer"),
    getTranslations("Nav"),
  ]);

  return (
    <>
      <StoreHeader />
      {children}
      <footer className="mt-24 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
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
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text)]">
                {tFooter("HelpHeading")}
              </p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link href="/about" className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
                    {tFooter("About")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]">
                    {tFooter("Contact")}
                  </Link>
                </li>
              </ul>
            </div>

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

            <div className="col-span-2 sm:col-span-1">
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
    </>
  );
}
