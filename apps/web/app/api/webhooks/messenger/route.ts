import crypto from "crypto";
import { NextRequest } from "next/server";
import { db } from "@shoestore/db";

const GRAPH_API_VERSION = "v21.0";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.MESSENGER_VERIFY_TOKEN && challenge) {
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

async function fetchSenderName(psid: string): Promise<string | null> {
  try {
    const token = process.env.FB_PAGE_ACCESS_TOKEN;
    if (!token) return null;
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${psid}?fields=first_name,last_name&access_token=${token}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
    return name || null;
  } catch (error) {
    console.error("[MESSENGER] fetchSenderName failed:", error);
    return null;
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

  if (body.object !== "page") {
    return new Response("EVENT_RECEIVED", { status: 200 });
  }

  for (const entry of body.entry ?? []) {
    for (const event of entry.messaging ?? []) {
      const senderId: string | undefined = event.sender?.id;
      const text: string | undefined = event.message?.text;
      const mid: string | undefined = event.message?.mid;
      const isEcho: boolean = event.message?.is_echo === true;
      const attachmentUrl: string | undefined = event.message?.attachments?.[0]?.payload?.url;

      if (!senderId || (!text && !attachmentUrl)) continue;

      const existing = await db.socialConversation.findUnique({
        where: { platform_externalId: { platform: "MESSENGER", externalId: senderId } },
      });

      const lastMessageText = text ?? "[attachment]";
      const conversation = existing
        ? await db.socialConversation.update({
            where: { id: existing.id },
            data: {
              lastMessageText,
              lastMessageAt: new Date(),
              ...(isEcho ? {} : { unreadCount: { increment: 1 } }),
            },
          })
        : await db.socialConversation.create({
            data: {
              platform: "MESSENGER",
              externalId: senderId,
              customerName: await fetchSenderName(senderId),
              lastMessageText,
              lastMessageAt: new Date(),
              unreadCount: isEcho ? 0 : 1,
            },
          });

      await db.socialMessage.create({
        data: {
          conversationId: conversation.id,
          externalId: mid ?? null,
          direction: isEcho ? "OUTBOUND" : "INBOUND",
          text: text ?? null,
          attachmentUrl: attachmentUrl ?? null,
          sentAt: event.timestamp ? new Date(event.timestamp) : new Date(),
        },
      });
    }
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
