import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@shoestore/db";

// WhatsApp Cloud API webhook — mirrors the Messenger webhook. Point your Meta
// app's "whatsapp_business_account" webhook at /api/webhooks/whatsapp and
// subscribe to the "messages" field.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN || process.env.MESSENGER_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.FB_APP_SECRET;
  if (!appSecret || !signatureHeader) return false;

  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const provided = signatureHeader.replace("sha256=", "");

  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

function messageText(msg: any): string {
  switch (msg.type) {
    case "text":
      return msg.text?.body ?? "";
    case "button":
      return msg.button?.text ?? "[button]";
    case "interactive":
      return (
        msg.interactive?.button_reply?.title ??
        msg.interactive?.list_reply?.title ??
        "[interactive]"
      );
    case "location":
      return "[location]";
    default:
      return `[${msg.type ?? "message"}]`;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  if (body.object !== "whatsapp_business_account") {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value ?? {};
      const messages: any[] = value.messages ?? [];
      if (messages.length === 0) continue; // statuses / read receipts — ignore

      // contacts[] carries the sender's display name, keyed by wa_id
      const nameByWaId = new Map<string, string>();
      for (const contact of value.contacts ?? []) {
        if (contact.wa_id && contact.profile?.name) {
          nameByWaId.set(contact.wa_id, contact.profile.name);
        }
      }

      for (const msg of messages) {
        const from: string | undefined = msg.from;
        if (!from) continue;

        const text = messageText(msg);
        const sentAt = msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date();

        const existing = await db.socialConversation.findUnique({
          where: { platform_externalId: { platform: "WHATSAPP", externalId: from } },
        });

        const conversation = existing
          ? await db.socialConversation.update({
              where: { id: existing.id },
              data: {
                lastMessageText: text,
                lastMessageAt: sentAt,
                unreadCount: { increment: 1 },
                ...(nameByWaId.get(from) && !existing.customerName
                  ? { customerName: nameByWaId.get(from) }
                  : {}),
              },
            })
          : await db.socialConversation.create({
              data: {
                platform: "WHATSAPP",
                externalId: from,
                customerName: nameByWaId.get(from) ?? null,
                lastMessageText: text,
                lastMessageAt: sentAt,
                unreadCount: 1,
              },
            });

        await db.socialMessage.create({
          data: {
            conversationId: conversation.id,
            externalId: msg.id ?? null,
            direction: "INBOUND",
            text: text || null,
            sentAt,
          },
        });
      }
    }
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
