import Link from "next/link";
import { Suspense } from "react";
import { UserCircle } from "lucide-react";
import { LogoImage } from "./LogoImage";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { NavLinks } from "./NavLinks";
import { MobileNavMenu } from "./MobileNavMenu";
import { UserMenu } from "./UserMenu";
import { LanguageSelector } from "./LanguageSelector";
import { getCurrentUser } from "@/lib/session";
import { getTranslations } from "next-intl/server";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getCategoryTree } from "@/actions/categoryActions";

export async function StoreHeader() {
  const [session, settings, menTreeResult, womenTreeResult] = await Promise.all([
    getCurrentUser(),
    getStoreSettings(),
    getCategoryTree("MEN"),
    getCategoryTree("WOMEN"),
  ]);
  const t = await getTranslations("Nav");
  const logoUrl = settings.success ? settings.data?.logoUrl ?? null : null;
  const menCategoryTree = menTreeResult.success ? (menTreeResult.data ?? []) : [];
  const womenCategoryTree = womenTreeResult.success ? (womenTreeResult.data ?? []) : [];

  return (
    <>
      <CartDrawer />
      <header className="sticky top-0 z-40 bg-[var(--color-bg)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">

          {/* Logo */}
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-70">
            <LogoImage height={34} src={logoUrl} />
          </Link>

          {/* Nav — center */}
          <div className="hidden sm:flex">
            <Suspense fallback={null}>
              <NavLinks menCategoryTree={menCategoryTree} womenCategoryTree={womenCategoryTree} />
            </Suspense>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSelector />

            <CartIcon />

            <div className="h-5 w-px bg-[var(--color-border)]" />

            {session ? (
              <UserMenu name={session.name} email={session.email} role={session.role} />
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-widest text-[var(--color-text)] transition hover:text-[var(--color-muted)] sm:px-2.5"
              >
                <UserCircle size={16} />
                <span className="hidden sm:block">{t("SignIn")}</span>
              </Link>
            )}

            <MobileNavMenu menCategoryTree={menCategoryTree} womenCategoryTree={womenCategoryTree} />
          </div>
        </div>
      </header>
    </>
  );
}
