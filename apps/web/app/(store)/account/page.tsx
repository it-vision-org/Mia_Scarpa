import Link from "next/link";
import { UserCircle, LogIn, UserPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/session";
import { db } from "@shoestore/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusTag } from "@/components/store/OrderStatusTag";

export default async function AccountPage() {
  const session = await getSession();
  const t = await getTranslations("Account");

  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20 text-center space-y-8">
        <div className="flex justify-center">
          <div className="border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
            <UserCircle size={48} className="text-[var(--color-muted)]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("Title")}</h1>
          <p className="text-[var(--color-muted)]">{t("Subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/account/login"
            className="flex flex-col items-center gap-3 border border-[var(--color-border)] bg-white p-6 transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5"
          >
            <div className="bg-[var(--color-bg)] p-3">
              <LogIn size={22} className="text-[var(--color-text)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text)]">{t("SignIn")}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("SignInDesc")}</p>
            </div>
          </Link>
          <Link
            href="/account/register"
            className="flex flex-col items-center gap-3 border-2 border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-6 transition hover:border-[var(--color-accent)]/60"
          >
            <div className="bg-[var(--color-accent)]/10 p-3">
              <UserPlus size={22} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="font-bold text-[var(--color-text)]">{t("CreateAccount")}</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">{t("CreateDesc")}</p>
            </div>
          </Link>
        </div>
      </main>
    );
  }

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
          {t("MyOrders")}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          {session.name} &middot; {session.email}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-[var(--color-border)] py-16 text-center text-sm text-[var(--color-muted)]">
          {t("NoOrders")}{" "}
          <Link
            href="/shop"
            className="font-semibold text-[var(--color-text)] underline underline-offset-4"
          >
            {t("StartShopping")}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {orders.map((order) => (
            <div key={order.id} className="flex items-start justify-between gap-4 py-5">
              <div className="space-y-1">
                <p className="font-mono text-xs font-bold text-[var(--color-text)]">
                  {order.orderNumber}
                </p>
                <p className="text-sm text-[var(--color-muted)]">
                  {new Date(order.createdAt).toLocaleDateString("fr-TN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {t("Items", { count: order._count.items })}
                </p>
              </div>
              <div className="space-y-2 text-right">
                <p className="font-bold text-[var(--color-text)]">
                  {formatPrice(Number(order.total))}
                </p>
                <OrderStatusTag status={order.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
