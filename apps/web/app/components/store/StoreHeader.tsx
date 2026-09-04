import Link from "next/link";
import { Suspense } from "react";
import { User } from "lucide-react";
import { LogoImage } from "./LogoImage";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { NavSearch } from "./NavSearch";
import { NavLinks } from "./NavLinks";
import { MobileNavMenu } from "./MobileNavMenu";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { getCurrentUser } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getCategoryTree } from "@/actions/categoryActions";

export async function StoreHeader() {
  const [session, settings, menTreeResult, womenTreeResult, enfantTreeResult] = await Promise.all([
    getCurrentUser(),
    getStoreSettings(),
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
    getCategoryTree("ENFANT"),
  ]);
  const t = await getTranslations("Nav");
  const logoUrl = settings.success ? settings.data?.logoUrl ?? null : null;
  const menCategoryTree = menTreeResult.success ? (menTreeResult.data ?? []) : [];
  const womenCategoryTree = womenTreeResult.success ? (womenTreeResult.data ?? []) : [];
  const enfantCategoryTree = enfantTreeResult.success ? (enfantTreeResult.data ?? []) : [];

  return (
    <>
      <CartDrawer />
      <header className="sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          {/* Left: logo + nav.
              The logo sits in a fixed-size slot so its dimensions never shift the nav links. */}
          <div className="flex items-center gap-5 lg:gap-8">
            <Link
              href="/"
              className="flex h-9 w-28 shrink-0 items-center overflow-hidden transition-opacity hover:opacity-70 sm:w-36"
            >
              <LogoImage height={34} src={logoUrl} />
            </Link>
            <div className="hidden h-6 w-px shrink-0 bg-[var(--color-border)] sm:block" />
            <div className="hidden sm:flex">
              <Suspense fallback={null}>
                <NavLinks
                  menCategoryTree={menCategoryTree}
                  womenCategoryTree={womenCategoryTree}
                  enfantCategoryTree={enfantCategoryTree}
                />
              </Suspense>
            </div>
          </div>

          {/* Right: search, language, cart, profile */}
          <div className="flex items-center gap-4 sm:gap-5">
            <NavSearch />

            <LanguageSelector />

            <CartIcon />

            {session ? (
              <UserMenu name={session.name} email={session.email} role={session.role} />
            ) : (
              <Link
                href="/account/login"
                aria-label={t("SignIn")}
                className="flex items-center text-[var(--color-text)] transition hover:text-[var(--color-muted)]"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}

            <MobileNavMenu
              menCategoryTree={menCategoryTree}
              womenCategoryTree={womenCategoryTree}
              enfantCategoryTree={enfantCategoryTree}
            />
          </div>
        </div>
      </header>
    </>
  );
}
