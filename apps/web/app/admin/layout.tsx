import { AdminShell } from "@/components/admin/AdminShell";
import { getStoreSettings } from "@/actions/storeSettingsActions";
import { getContacts } from "@/actions/contactActions";
import { getUnreadSocialCount } from "@/actions/socialActions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [settings, unreadContacts, unreadSocialCount] = await Promise.all([
    getStoreSettings(),
    getContacts({ unreadOnly: true }),
    getUnreadSocialCount(),
  ]);
  const logoUrl = settings.success ? settings.data?.logoUrl ?? null : null;
  return (
    <AdminShell
      logoUrl={logoUrl}
      unreadContactsCount={unreadContacts.length}
      unreadSocialCount={unreadSocialCount}
    >
      {children}
    </AdminShell>
  );
}
