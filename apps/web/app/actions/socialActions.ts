"use server";

import { revalidatePath } from "next/cache";
import { db } from "@shoestore/db";
import type { ActionResult } from "@/types";

const GRAPH_API_VERSION = "v21.0";

export type SocialPlatform = "MESSENGER" | "INSTAGRAM" | "WHATSAPP";

export type SocialConversationSummary = {
  id: string;
  platform: SocialPlatform;
  externalId: string;
  customerName: string | null;
  customerAvatar: string | null;
  lastMessageText: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type SocialMessageItem = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  text: string | null;
  attachmentUrl: string | null;
  sentAt: string;
};

export async function getConversations(
  platform: SocialPlatform,
): Promise<ActionResult<SocialConversationSummary[]>> {
  try {
    const conversations = await db.socialConversation.findMany({
      where: { platform },
      orderBy: { lastMessageAt: "desc" },
    });
    return {
      success: true,
      data: conversations.map((c) => ({
        id: c.id,
        platform: c.platform,
        externalId: c.externalId,
        customerName: c.customerName,
        customerAvatar: c.customerAvatar,
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt.toISOString(),
        unreadCount: c.unreadCount,
      })),
    };
  } catch (error) {
    console.error("[SOCIAL] getConversations error:", error);
    return { success: false, error: "Failed to load conversations" };
  }
}

export async function getUnreadSocialCount(): Promise<number> {
  try {
    const result = await db.socialConversation.aggregate({
      _sum: { unreadCount: true },
    });
    return result._sum.unreadCount ?? 0;
  } catch (error) {
    console.error("[SOCIAL] getUnreadSocialCount error:", error);
    return 0;
  }
}

export async function getMessages(
  conversationId: string,
): Promise<ActionResult<SocialMessageItem[]>> {
  try {
    const [messages] = await Promise.all([
      db.socialMessage.findMany({
        where: { conversationId },
        orderBy: { sentAt: "asc" },
      }),
      db.socialConversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 },
      }),
    ]);

    revalidatePath("/admin", "layout");

    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        text: m.text,
        attachmentUrl: m.attachmentUrl,
        sentAt: m.sentAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("[SOCIAL] getMessages error:", error);
    return { success: false, error: "Failed to load messages" };
  }
}

export async function sendMessengerMessage(
  conversationId: string,
  text: string,
): Promise<ActionResult> {
  try {
    const trimmed = text.trim();
    if (!trimmed) return { success: false, error: "Message is empty" };

    const conversation = await db.socialConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) return { success: false, error: "Conversation not found" };

    const token = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!token) return { success: false, error: "Messenger is not configured (missing page access token)" };

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/me/messages?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: { id: conversation.externalId },
          message: { text: trimmed },
          messaging_type: "RESPONSE",
        }),
      },
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const message = errBody?.error?.message ?? "Failed to send message";
      console.error("[SOCIAL] Graph API send error:", errBody);
      return { success: false, error: message };
    }

    const resBody = await res.json();

    await db.socialMessage.create({
      data: {
        conversationId,
        externalId: resBody.message_id ?? null,
        direction: "OUTBOUND",
        text: trimmed,
        sentAt: new Date(),
      },
    });
    await db.socialConversation.update({
      where: { id: conversationId },
      data: { lastMessageText: trimmed, lastMessageAt: new Date() },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[SOCIAL] sendMessengerMessage error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

export async function sendWhatsAppMessage(
  conversationId: string,
  text: string,
): Promise<ActionResult> {
  try {
    const trimmed = text.trim();
    if (!trimmed) return { success: false, error: "Message is empty" };

    const conversation = await db.socialConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) return { success: false, error: "Conversation not found" };

    const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      return {
        success: false,
        error: "WhatsApp is not configured (missing WHATSAPP_PHONE_NUMBER_ID or access token)",
      };
    }

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: conversation.externalId,
          type: "text",
          text: { preview_url: false, body: trimmed },
        }),
      },
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const code = errBody?.error?.code;
      let message = errBody?.error?.message ?? "Failed to send message";
      if (code === 131047 || code === 131051) {
        message =
          "Can't reply — more than 24h since the customer's last message. WhatsApp only allows free replies inside a 24-hour window.";
      }
      console.error("[SOCIAL] WhatsApp send error:", errBody);
      return { success: false, error: message };
    }

    const resBody = await res.json();
    const messageId = resBody?.messages?.[0]?.id ?? null;

    await db.socialMessage.create({
      data: {
        conversationId,
        externalId: messageId,
        direction: "OUTBOUND",
        text: trimmed,
        sentAt: new Date(),
      },
    });
    await db.socialConversation.update({
      where: { id: conversationId },
      data: { lastMessageText: trimmed, lastMessageAt: new Date() },
    });

    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (error) {
    console.error("[SOCIAL] sendWhatsAppMessage error:", error);
    return { success: false, error: "Failed to send message" };
  }
}
