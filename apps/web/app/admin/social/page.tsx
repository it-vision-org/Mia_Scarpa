import { Suspense } from "react";
import { Skeleton, CardListSkeleton } from "@/components/admin/Skeleton";
import { SocialContent } from "./SocialContent";

export default function AdminSocialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Social Media</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Reply to Messenger, Instagram, and WhatsApp conversations without leaving the dashboard.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-4 w-32" />
            <CardListSkeleton rows={5} />
          </div>
        }
      >
        <SocialContent />
      </Suspense>
    </div>
  );
}
