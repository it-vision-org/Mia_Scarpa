"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send, Loader2, MessageCircle, Instagram, Phone } from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessengerMessage,
  type SocialConversationSummary,
  type SocialMessageItem,
} from "@/actions/socialActions";

const CONVERSATIONS_POLL_MS = 15000;
const MESSAGES_POLL_MS = 5000;

type Tab = "MESSENGER" | "INSTAGRAM" | "WHATSAPP";

const TABS: { key: Tab; label: string; icon: typeof MessageCircle }[] = [
  { key: "MESSENGER", label: "Messenger", icon: MessageCircle },
  { key: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { key: "WHATSAPP", label: "WhatsApp", icon: Phone },
];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string | null, fallback: string): string {
  const source = name?.trim() || fallback;
  return source.slice(0, 2).toUpperCase();
}

export function SocialInboxClient({
  initialConversations,
}: {
  initialConversations: SocialConversationSummary[];
}) {
  const [tab, setTab] = useState<Tab>("MESSENGER");
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversations[0]?.id ?? null);
  const [messages, setMessages] = useState<SocialMessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, startSending] = useTransition();
  const threadEndRef = useRef<HTMLDivElement>(null);

  async function refreshConversations() {
    const res = await getConversations("MESSENGER");
    if (res.success) setConversations(res.data ?? []);
  }

  async function loadMessages(conversationId: string, showSpinner: boolean) {
    if (showSpinner) setMessagesLoading(true);
    const res = await getMessages(conversationId);
    if (res.success) {
      setMessages(res.data ?? []);
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
      );
    }
    if (showSpinner) setMessagesLoading(false);
  }

  // conversation list polling
  useEffect(() => {
    if (tab !== "MESSENGER") return;
    const id = setInterval(refreshConversations, CONVERSATIONS_POLL_MS);
    return () => clearInterval(id);
  }, [tab]);

  // open thread — load + poll
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedId, true);
    const id = setInterval(() => loadMessages(selectedId, false), MESSAGES_POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSelect(id: string) {
    setSelectedId(id);
    setSendError("");
  }

  function handleSend() {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    setSendError("");
    startSending(async () => {
      const res = await sendMessengerMessage(selectedId, text);
      if (res.success) {
        setReplyText("");
        await loadMessages(selectedId, false);
        await refreshConversations();
      } else {
        setSendError(res.error ?? "Failed to send message");
      }
    });
  }

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
      {/* tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition ${
              tab === key
                ? "border-b-2 border-[var(--color-accent)] text-[var(--color-text)]"
                : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab !== "MESSENGER" ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
          {tab === "INSTAGRAM" ? (
            <Instagram className="h-8 w-8 text-[var(--color-muted)]" />
          ) : (
            <Phone className="h-8 w-8 text-[var(--color-muted)]" />
          )}
          <p className="font-semibold text-[var(--color-text)]">
            {tab === "INSTAGRAM" ? "Instagram" : "WhatsApp"} — coming soon
          </p>
          <p className="max-w-xs text-sm text-[var(--color-muted)]">
            This inbox will work the same way as Messenger once it's connected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* conversation list */}
          <div className="max-h-[560px] overflow-y-auto border-b border-[var(--color-border)] md:border-b-0 md:border-r">
            {conversations.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
                No conversations yet. Messages sent to your Page will show up here.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c.id)}
                  className={`flex w-full items-start gap-3 border-b border-[var(--color-border)] px-4 py-3 text-left transition ${
                    c.id === selectedId ? "bg-[var(--color-bg)]" : "hover:bg-[var(--color-bg)]"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-xs font-bold text-[var(--color-accent)]">
                    {initials(c.customerName, c.externalId)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {c.customerName ?? "Messenger user"}
                      </p>
                      <span className="shrink-0 text-[11px] text-[var(--color-muted)]">
                        {relativeTime(c.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-[var(--color-muted)]">
                        {c.lastMessageText ?? ""}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* thread */}
          <div className="flex min-h-[420px] flex-col">
            {!selected ? (
              <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-muted)]">
                Select a conversation to view messages
              </div>
            ) : (
              <>
                <div className="border-b border-[var(--color-border)] px-5 py-3">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    {selected.customerName ?? "Messenger user"}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                  {messagesLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-5 w-5 animate-spin text-[var(--color-muted)]" />
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex ${m.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            m.direction === "OUTBOUND"
                              ? "bg-[var(--color-accent)] text-white"
                              : "bg-[var(--color-bg)] text-[var(--color-text)]"
                          }`}
                        >
                          {m.text}
                          {m.attachmentUrl && (
                            <a
                              href={m.attachmentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`block underline ${m.direction === "OUTBOUND" ? "text-white/90" : "text-[var(--color-accent)]"}`}
                            >
                              Attachment
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={threadEndRef} />
                </div>

                <div className="border-t border-[var(--color-border)] p-3">
                  {sendError && <p className="mb-2 text-xs text-red-600">{sendError}</p>}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a reply…"
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending || !replyText.trim()}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
