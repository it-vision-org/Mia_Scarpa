import { getConversations } from "@/actions/socialActions";
import { SocialInboxClient } from "@/components/admin/SocialInboxClient";

export async function SocialContent() {
  const result = await getConversations("MESSENGER");
  const conversations = result.success ? (result.data ?? []) : [];

  return <SocialInboxClient initialConversations={conversations} />;
}
