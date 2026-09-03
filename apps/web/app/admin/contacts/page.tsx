import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { ContactsContent } from "./ContactsContent";

export default async function AdminContactsPage() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t("ContactsTitle")}</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <CardListSkeleton rows={5} />
          </div>
        }
      >
        <ContactsContent />
      </Suspense>
    </div>
  );
}
