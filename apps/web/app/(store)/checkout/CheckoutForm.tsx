"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/cart-context";
import { formatPrice } from "@/lib/utils";
import { createOrder } from "@/actions/orderActions";
import { getDeliveryFee } from "@/actions/storeSettingsActions";
import type { PastAddress } from "@/actions/customerAuthActions";
import { TUNISIA_CITIES } from "@/lib/tunisia-cities";
import { CheckoutSuccessModal } from "@/components/store/CheckoutSuccessModal";
import { FloatField, FloatSelect } from "@/components/store/FloatField";

type Prefill = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pastAddresses: PastAddress[];
} | null;

export function CheckoutForm({ prefill }: { prefill: Prefill }) {
  const { items, total, clearCart, isHydrated } = useCart();
  const router = useRouter();
  const t = useTranslations("Checkout");
  const [, startTransition] = useTransition();
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee);
  }, []);

  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [city, setCity] = useState(prefill?.city ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState<{ orderNumber: string; orderId: string } | null>(null);
  const orderPlacedRef = useRef(false);

  const pastAddresses = prefill?.pastAddresses ?? [];
  const [selectedAddressKey, setSelectedAddressKey] = useState(
    pastAddresses[0] ? `${pastAddresses[0].address}|${pastAddresses[0].city}` : null,
  );

  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);

  function applyPastAddress(p: PastAddress) {
    setAddress(p.address);
    setCity(p.city);
    setSelectedAddressKey(`${p.address}|${p.city}`);
    setAddressDropdownOpen(false);
  }

  useEffect(() => {
    if (isHydrated && items.length === 0 && !modal && !orderPlacedRef.current) {
      router.replace("/cart");
    }
  }, [isHydrated, items.length, modal, router]);

  if (!isHydrated) return null;
  if (items.length === 0 && !modal) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError(t("ErrorNameRequired"));
      return;
    }
    if (!phone.trim()) {
      setError(t("ErrorPhoneRequired"));
      return;
    }
    if (!address.trim()) {
      setError(t("ErrorAddressRequired"));
      return;
    }
    setSubmitting(true);
    setError("");

    startTransition(async () => {
      try {
        const result = await createOrder({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          address,
          city: city || undefined,
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        });
        if (!result.success) {
          setError(result.error ?? t("ErrorGeneral"));
          setSubmitting(false);
          return;
        }
        orderPlacedRef.current = true;
        clearCart();
        const { orderNumber, orderId } = result.data!;
        if (prefill) {
          router.push(`/checkout/success?ref=${orderNumber}`);
        } else {
          setModal({ orderNumber, orderId });
        }
      } catch {
        setError(t("ErrorGeneral"));
        setSubmitting(false);
      }
    });
  }

  const cityOptions = city && !TUNISIA_CITIES.includes(city) ? [city, ...TUNISIA_CITIES] : TUNISIA_CITIES;

  return (
    <>
      {modal && (
        <CheckoutSuccessModal
          orderNumber={modal.orderNumber}
          orderId={modal.orderId}
          prefill={{ name, email, phone }}
        />
      )}
      <main className="mx-auto max-w-5xl px-6 py-10 lg:py-14">
        <div className="mb-8">
          <h1 className="text-lg font-bold uppercase tracking-wide text-[var(--color-text)]">
            {t("Title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{t("RequiredNote")}</p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* Customer form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-3">
            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <FloatField
              label={t("FullName")}
              required
              value={name}
              onChange={setName}
              autoComplete="name"
            />

            <FloatField
              label={`${t("Email")} (${t("Optional")})`}
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />

            <FloatField
              label={t("Phone")}
              required
              type="tel"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
            />

            <div className="relative">
              <FloatField
                label={t("Address")}
                required
                value={address}
                onChange={(v) => { setAddress(v); setSelectedAddressKey(null); }}
                onFocus={() => setAddressDropdownOpen(true)}
                onClick={() => setAddressDropdownOpen(true)}
                onBlur={() => setTimeout(() => setAddressDropdownOpen(false), 100)}
                autoComplete="off"
              />
              {addressDropdownOpen && pastAddresses.length > 0 && (
                <div className="absolute z-10 mt-1 w-full border border-[var(--color-border)] bg-white shadow-lg">
                  <p className="flex items-center gap-1.5 border-b border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-muted)]">
                    <MapPin className="h-3 w-3" />
                    {t("SavedAddresses")}
                  </p>
                  {pastAddresses.map((p) => {
                    const key = `${p.address}|${p.city}`;
                    const selected = selectedAddressKey === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => applyPastAddress(p)}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition ${
                          selected ? "bg-blue-50 text-blue-900" : "text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                        }`}
                      >
                        <span className="truncate">{p.address}</span>
                        {p.city && <span className="shrink-0 text-xs text-[var(--color-muted)]">{p.city}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <FloatSelect
              label={t("City")}
              required
              value={city}
              onChange={(v) => { setCity(v); setSelectedAddressKey(null); }}
              options={cityOptions}
              placeholder={t("SelectCity")}
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 border-2 border-[var(--color-text)] py-4 text-sm font-bold uppercase tracking-widest text-[var(--color-text)] transition hover:bg-[var(--color-text)] hover:text-white disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("PlaceOrder")}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text)]">
                {t("OrderSummary")}
              </h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.productName} className="h-16 w-14 flex-shrink-0 object-cover" />
                    ) : (
                      <div className="h-16 w-14 flex-shrink-0 bg-[var(--color-border)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-text)]">{item.productName}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {[item.size && `${t("Size")} ${item.size}`, item.colorName].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">{t("Subtotal")}</span>
                  <span className="font-semibold text-[var(--color-text)]">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted)]">{t("Shipping")}</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {deliveryFee === 0 ? t("Free") : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t border-[var(--color-border)] pt-4">
                <span className="font-bold text-[var(--color-text)]">{t("Total")}</span>
                <span className="font-bold text-[var(--color-text)]">{formatPrice(total + deliveryFee)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
