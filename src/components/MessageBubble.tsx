import { useState } from "react";
import {
  Check,
  Copy,
  Droplet,
  FileText,
  Globe,
  PanelRightOpen,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import clsx from "clsx";
import type { Message, WebSearchSource } from "@/api/chat";
import type { RagSource } from "@/api/knowledge";
import type { ModelInfo } from "@/api/models";
import { useChatStore } from "@/store/chatStore";
import { useModelStore } from "@/store/modelStore";
import { useUiStore } from "@/store/uiStore";
import { useLocale } from "@/hooks/useLocale";
import { ModelVariantBadge } from "./ModelVariantBadge";
import { Markdown } from "./Markdown";
import { balanceMarkdownDelimiters } from "@/utils/markdown";
import { asArray } from "@/utils/array";

interface MessageBubbleProps {
  message: Message;
  streaming?: boolean;
  isLastAssistant?: boolean;
  highlighted?: boolean;
}

export function MessageBubble({
  message,
  streaming,
  isLastAssistant,
  highlighted,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState("");

  const rateMessage = useChatStore((s) => s.rateMessage);
  const regenerateLast = useChatStore((s) => s.regenerateLast);
  const globallyStreaming = useChatStore((s) => s.streaming);
  const openSourcesPanel = useUiStore((s) => s.openSourcesPanel);
  const modelCatalog = useModelStore((s) => s.models);
  const { t } = useLocale();

  const modelMeta = asArray<ModelInfo>(modelCatalog).find((m) => m.key === message.model_key);

  const webSources = asArray<WebSearchSource>(message.web_sources).filter(
    (s) => s.title || s.url,
  );
  const ragSources = asArray<RagSource>(message.rag_sources).filter(
    (s) => s.title || s.snippet,
  );
  const renderedContent =
    !isUser && !streaming ? balanceMarkdownDelimiters(message.content) : message.content;

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  function toggleRating(rating: "up" | "down") {
    if (message.id <= 0) return; // optimistic, not yet persisted
    if (message.feedback_rating === rating) {
      void rateMessage(message.id, null);
      setShowCommentBox(false);
    } else {
      void rateMessage(message.id, rating, comment.trim() || undefined);
      if (rating === "down") setShowCommentBox(true);
      else setShowCommentBox(false);
    }
  }

  function saveComment() {
    if (!message.feedback_rating || message.id <= 0) return;
    void rateMessage(message.id, message.feedback_rating, comment.trim());
    setShowCommentBox(false);
  }

  return (
    <div
      className={clsx(
        "px-2 py-2 sm:px-4 sm:py-3 transition",
        highlighted && "rounded-xl bg-brand-50/80 ring-2 ring-brand-400/60 dark:bg-brand-950/20",
      )}
    >
      <div
        className={clsx(
          "mx-auto flex w-full max-w-3xl gap-2 sm:gap-3",
          isUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        <div
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white",
            isUser
              ? "bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900"
              : "bg-gradient-to-br from-brand-500 to-brand-700",
          )}
        >
          {isUser ? <UserRound size={16} /> : <Droplet size={16} fill="currentColor" />}
        </div>

        <div
          className={clsx(
            "group flex min-w-0 max-w-[92%] flex-col sm:max-w-[85%]",
            isUser ? "items-end" : "items-start",
          )}
        >
          <div
            className={clsx(
              "mb-1 flex items-center gap-2 text-xs font-medium text-zinc-500",
              isUser && "flex-row-reverse",
            )}
          >
            <span>{isUser ? t("chat.you") : t("chat.assistant")}</span>
            {!isUser && message.model_key && (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {modelMeta?.label ?? message.model_key}
                </span>
                {modelMeta && (
                  <ModelVariantBadge
                    variant={modelMeta.variant}
                    label={modelMeta.variant_label}
                    instructOnly={modelMeta.variant === "instruct" && !modelMeta.has_dpo}
                  />
                )}
              </span>
            )}
          </div>

          <div
            className={clsx(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ring-1",
              isUser
                ? "rounded-br-md bg-brand-600 text-white ring-brand-700/20"
                : "rounded-bl-md bg-white text-zinc-800 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-800",
            )}
          >
            {message.content || !streaming ? (
              isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <Markdown>{renderedContent}</Markdown>
              )
            ) : (
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                <span>{t("chat.thinking")}</span>
              </div>
            )}
            {streaming && message.content && !isUser && (
              <span className="ml-0.5 inline-block h-4 w-[2px] -mb-0.5 animate-blink-caret bg-brand-500 align-middle" />
            )}

            {!isUser && message.truncated && !streaming && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                {t("chat.responseTruncated")}
              </p>
            )}
          </div>

          {!isUser && ragSources.length > 0 && !streaming && (
            <div className="mt-2 w-full rounded-xl border border-violet-200 bg-violet-50/80 px-3 py-2.5 dark:border-violet-900/40 dark:bg-violet-950/20">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-violet-800 dark:text-violet-200">
                <FileText size={12} />
                <span>{t("chat.documentSources")}</span>
              </div>
              <ol className="space-y-2 text-xs">
                {ragSources.map((source, index) => (
                  <li key={`${source.document_id}-${source.chunk_index}-${index}`}>
                    <div className="font-medium text-violet-900 dark:text-violet-100">
                      [{index + 1}] {source.title}
                      {typeof source.score === "number" && (
                        <span className="ml-1.5 font-normal text-violet-600 dark:text-violet-300">
                          ({Math.round(source.score * 100)}%)
                        </span>
                      )}
                    </div>
                    {source.snippet && (
                      <p className="mt-0.5 line-clamp-3 text-violet-800/90 dark:text-violet-200/90">
                        {source.snippet}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {!isUser && webSources.length > 0 && !streaming && (
            <div className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                <Globe size={12} />
                <span>{t("chat.sources")}</span>
              </div>
              <ol className="space-y-1.5 text-xs">
                {webSources.map((source, index) => (
                  <li key={`${source.url || source.title}-${index}`} className="flex gap-2">
                    <span className="shrink-0 font-medium text-zinc-500">[{index + 1}]</span>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 text-brand-600 hover:underline dark:text-brand-400"
                      >
                        <span className="line-clamp-2">{source.title || source.url}</span>
                      </a>
                    ) : (
                      <span className="line-clamp-2 text-zinc-700 dark:text-zinc-300">
                        {source.title || t("chat.untitledSource")}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => openSourcesPanel(message.id, webSources)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <PanelRightOpen size={12} />
                {t("chat.viewSources")}
              </button>
            </div>
          )}

          {!isUser && message.content && !streaming && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <ActionButton onClick={copy} title={t("chat.copy")}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? t("chat.copied") : t("chat.copy")}</span>
              </ActionButton>

              <ActionButton
                onClick={() => toggleRating("up")}
                title="Good response"
                active={message.feedback_rating === "up"}
                activeClass="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                disabled={message.id <= 0}
              >
                <ThumbsUp size={12} />
              </ActionButton>

              <ActionButton
                onClick={() => toggleRating("down")}
                title="Needs work"
                active={message.feedback_rating === "down"}
                activeClass="border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                disabled={message.id <= 0}
              >
                <ThumbsDown size={12} />
              </ActionButton>

              {isLastAssistant && (
                <ActionButton
                  onClick={() => regenerateLast()}
                  title="Regenerate response"
                  disabled={globallyStreaming}
                >
                  <RefreshCw size={12} />
                  <span>{t("chat.regenerate")}</span>
                </ActionButton>
              )}
            </div>
          )}

          {isUser && message.content && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1">
              <ActionButton onClick={copy} title={t("chat.copy")}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? t("chat.copied") : t("chat.copy")}</span>
              </ActionButton>
            </div>
          )}

          {!isUser && showCommentBox && message.feedback_rating === "down" && (
            <div className="mt-2 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was wrong? (optional, helps us improve)"
                rows={2}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/40 dark:border-zinc-700 dark:bg-zinc-950"
              />
              <div className="mt-1.5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommentBox(false)}
                  className="rounded-md px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveComment}
                  className="rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  active?: boolean;
  activeClass?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ActionButton({
  onClick,
  title,
  active,
  activeClass,
  disabled,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={clsx(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? activeClass
          : "border-zinc-200 bg-white text-zinc-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
      )}
    >
      {children}
    </button>
  );
}
