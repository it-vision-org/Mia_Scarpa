import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Package, UserPlus, ClipboardList } from "lucide-react";
import { getOrderByNumber } from "@/actions/orderActions";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";

type SearchParams = Promise<{ ref?: string; name?: string; email?: string }>;

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { ref, name, email } = await searchParams;

  const [order, user] = await Promise.all([
    ref ? getOrderByNumber(ref).then((r) => (r.success ? r.data : null)) : Promise.resolve(null),
    getCurrentUser(),
  ]);

  const displayName = order?.customerName ?? name ?? "there";
  const orderRef = order?.orderNumber ?? ref;

  return (
    <main className="mx-auto max-w-xl px-6 py-16 lg:py-20 space-y-8">
      {/* Hero */}
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">Order Placed!</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Thanks {displayName.split(" ")[0]}! We&apos;ll contact you shortly to confirm your order and arrange delivery.
        </p>
        {orderRef && (
          <div className="inline-block border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2">
            <p className="text-xs text-[var(--color-muted)]">
              Order reference:{" "}
              <span className="font-mono font-bold text-[var(--color-text)]">{orderRef}</span>
            </p>
          </div>
        )}
      </div>

      {/* Order items */}
      {order && order.items.length > 0 && (
        <div className="border border-[var(--color-border)]">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-3.5">
            <Package size={15} className="text-[var(--color-muted)]" />
            <span className="text-sm font-semibold text-[var(--color-text)]">
              Your order ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
            </span>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                {item.productImage ? (
                  <div className="relative h-14 w-12 shrink-0 overflow-hidden border border-[var(--color-border)]">
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" sizes="48px" />
                  </div>
                ) : (
                  <div className="h-14 w-12 shrink-0 border border-[var(--color-border)] bg-[var(--color-bg)]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {[item.size && `Size ${item.size}`, item.colorName, `×${item.quantity}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[var(--color-text)]">
                  {formatPrice(item.totalPrice)}
                </p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Subtotal</span>
              <span className="font-semibold text-[var(--color-text)]">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-muted)]">Delivery fee</span>
              <span className="font-semibold text-[var(--color-text)]">
                {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">Total</span>
              <span className="text-sm font-bold text-[var(--color-text)]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Account CTA — differs for logged-in vs. guest customers */}
      {user ? (
        <div className="space-y-3 border-2 border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-6 text-center">
          <div className="flex justify-center">
            <ClipboardList size={22} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)]">Track this order</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Follow its status and see your full purchase history from your account.
            </p>
          </div>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 border-2 border-[var(--color-text)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
          >
            <ClipboardList size={15} />
            View My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-3 border-2 border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-6 text-center">
          <div className="flex justify-center">
            <UserPlus size={22} className="text-[var(--color-accent)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)]">Track your order anytime</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Create a free account to follow your order status, view your purchase history, and get notified on updates.
            </p>
          </div>
          <Link
            href={`/account/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}
            className="inline-flex items-center gap-2 border-2 border-[var(--color-text)] px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white"
          >
            <UserPlus size={15} />
            Create Account
          </Link>
          <p className="text-xs text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link href="/account/login" className="font-semibold text-[var(--color-accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <Link
          href="/shop"
          className="border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
        >
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
