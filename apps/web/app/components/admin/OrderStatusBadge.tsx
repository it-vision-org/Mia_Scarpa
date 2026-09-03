"use client";

import { useTranslations } from "next-intl";
import { orderStatusKey } from "@/lib/orderStatus";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-sky-100 text-sky-700",
  SHIPPED:   "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED:  "bg-orange-100 text-orange-700",
};

export function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {t(orderStatusKey(status))}
    </span>
  );
}
