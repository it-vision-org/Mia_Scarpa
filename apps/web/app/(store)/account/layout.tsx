import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { logoutUser } from "@/actions/customerAuthActions";
import { AccountNav } from "./AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login / register / signed-out views keep their own standalone layout.
  if (!session) return <>{children}</>;

  const t = await getTranslations("Account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AccountNav
          items={[
            { href: "/account/profile", label: t("NavMyAccount") },
            { href: "/account", label: t("NavMyOrders") },
          ]}
          signOutLabel={t("SignOut")}
          signOut={async () => {
            "use server";
            await logoutUser();
          }}
        />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
