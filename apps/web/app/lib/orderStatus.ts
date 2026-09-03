// Maps an order status enum value to its Admin-namespace i18n key.
// Usage:  const t = useTranslations("Admin");  t(orderStatusKey(status))
export function orderStatusKey(status: string): string {
  const s = status.toUpperCase();
  return "Status" + s.charAt(0) + s.slice(1).toLowerCase();
}
