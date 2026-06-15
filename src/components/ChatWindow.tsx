import { useEffect, useRef } from "react";
import { Droplet } from "lucide-react";
import type { Message } from "@/api/chat";
import type { TranslationKey } from "@/i18n/translations";
import { useLocale } from "@/hooks/useLocale";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  streaming: boolean;
  emptyHint?: React.ReactNode;
  highlightMessageId?: number | null;
  knowledgePanelOpen?: boolean;
  knowledgeLayoutTick?: number;
}

const SUGGESTION_KEYS = [
  "chat.suggest1",
  "chat.suggest2",
  "chat.suggest3",
  "chat.suggest4",
] as const satisfies readonly TranslationKey[];

export function ChatWindow({
  messages,
  streaming,
  emptyHint,
  highlightMessageId,
  knowledgePanelOpen,
  knowledgeLayoutTick,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (highlightMessageId) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming, highlightMessageId, knowledgePanelOpen, knowledgeLayoutTick]);

  useEffect(() => {
    if (!highlightMessageId) return;
    highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightMessageId, messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-3 py-6 text-center sm:px-6">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
          <Droplet size={28} fill="currentColor" />
        </div>
        <h2 className="mt-4 text-xl font-semibold sm:text-2xl">{t("chat.emptyTitle")}</h2>
        <p className="mt-2 max-w-md text-sm text-zinc-500">{t("chat.emptyBody")}</p>
        {emptyHint && <div className="mt-3 text-xs text-zinc-400">{emptyHint}</div>}
        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTION_KEYS.map((key) => {
            const text = t(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const ev = new CustomEvent("maisha:suggest", { detail: text });
                  window.dispatchEvent(ev);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-sm text-zinc-700 transition hover:border-brand-300 hover:bg-brand-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/40"
              >
                {text}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin h-full overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950">
      <div className="py-3">
        {messages.map((m, idx) => {
          const isLast = idx === messages.length - 1;
          const isLastAssistant =
            m.role === "assistant" &&
            !streaming &&
            !messages.slice(idx + 1).some((later) => later.role === "assistant");
          return (
            <div
              key={m.id}
              ref={highlightMessageId === m.id ? highlightRef : undefined}
            >
              <MessageBubble
                message={m}
                streaming={streaming && isLast && m.role === "assistant"}
                isLastAssistant={isLastAssistant}
                highlighted={highlightMessageId === m.id}
              />
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} className="h-6" />
    </div>
  );
}
