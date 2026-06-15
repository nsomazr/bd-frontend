import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Globe, Loader2, Mic, Paperclip, Send, Square } from "lucide-react";
import clsx from "clsx";
import { ModelDropdown } from "./ModelDropdown";
import { useLocale } from "@/hooks/useLocale";
import { useUiStore } from "@/store/uiStore";

interface ChatInputProps {
  disabled?: boolean;
  streaming?: boolean;
  webSearching?: boolean;
  voiceProcessing?: boolean;
  knowledgeSearching?: boolean;
  onSend: (text: string) => void;
  onStop?: () => void;
  onVoiceToggle?: () => void;
  onOpenKnowledge?: () => void;
  knowledgePanelOpen?: boolean;
  voiceRecording?: boolean;
  prefillText?: string | null;
  onPrefillApplied?: () => void;
}

export function ChatInput({
  disabled,
  streaming,
  webSearching,
  voiceProcessing,
  knowledgeSearching,
  onSend,
  onStop,
  onVoiceToggle,
  onOpenKnowledge,
  knowledgePanelOpen,
  voiceRecording,
  prefillText,
  onPrefillApplied,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useLocale();
  const { webSearchEnabled, setWebSearchEnabled, knowledgeEnabled, setKnowledgeEnabled } =
    useUiStore((s) => ({
      webSearchEnabled: s.webSearchEnabled,
      setWebSearchEnabled: s.setWebSearchEnabled,
      knowledgeEnabled: s.knowledgeEnabled,
      setKnowledgeEnabled: s.setKnowledgeEnabled,
    }));

  const busy = Boolean(streaming || voiceProcessing);
  const inputDisabled = busy || !onSend;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  useEffect(() => {
    if (!prefillText) return;
    setValue(prefillText);
    onPrefillApplied?.();
    ref.current?.focus();
  }, [prefillText, onPrefillApplied]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || inputDisabled) return;
    onSend(trimmed);
    setValue("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-zinc-200 bg-white px-3 py-3 sm:px-4 sm:py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-zinc-300 bg-white shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-end gap-2 px-2 pt-2">
            {onOpenKnowledge && (
              <button
                type="button"
                onClick={onOpenKnowledge}
                disabled={busy}
                className={clsx(
                  "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50",
                  knowledgePanelOpen
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                )}
                aria-label={t("knowledge.openPanel")}
                title={t("knowledge.openPanel")}
              >
                <Paperclip size={16} />
              </button>
            )}
            {onVoiceToggle && (
              <button
                type="button"
                onClick={onVoiceToggle}
                disabled={busy && !voiceRecording}
                className={`mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                  voiceRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                aria-label={t("chat.voiceInput")}
                title={t("chat.voiceHint")}
              >
                <Mic size={16} />
              </button>
            )}
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              placeholder={t("chat.inputPlaceholder")}
              rows={1}
              disabled={inputDisabled}
              className="max-h-60 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
            {streaming ? (
              <button
                type="button"
                onClick={onStop}
                className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-white shadow-sm transition hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                aria-label={t("chat.stop")}
                title={t("chat.stop")}
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={inputDisabled || !value.trim()}
                className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={t("chat.send")}
              >
                {voiceProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <ModelDropdown direction="up" />
              <div
                className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-xs transition ${
                  webSearchEnabled
                    ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
                    : "border-transparent text-zinc-500 dark:text-zinc-400"
                }`}
                title={t("chat.webSearchHint")}
              >
                <Globe size={14} className="shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{t("chat.webSearch")}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={webSearchEnabled}
                  aria-label={t("chat.webSearch")}
                  disabled={busy}
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    webSearchEnabled
                      ? "bg-brand-600"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                      webSearchEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <div
                className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-xs transition ${
                  knowledgeEnabled
                    ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
                    : "border-transparent text-zinc-500 dark:text-zinc-400"
                }`}
                title={t("chat.knowledgeHint")}
              >
                <Paperclip size={14} className="shrink-0" aria-hidden />
                <span className="whitespace-nowrap">{t("chat.useKnowledge")}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={knowledgeEnabled}
                  aria-label={t("chat.useKnowledge")}
                  disabled={busy}
                  onClick={() => setKnowledgeEnabled(!knowledgeEnabled)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${
                    knowledgeEnabled
                      ? "bg-violet-600"
                      : "bg-zinc-300 dark:bg-zinc-600"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                      knowledgeEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              {webSearching && (
                <span className="text-[11px] text-brand-600 dark:text-brand-300">
                  {t("chat.webSearching")}
                </span>
              )}
              {knowledgeSearching && (
                <span className="text-[11px] text-violet-600 dark:text-violet-300">
                  {t("chat.knowledgeSearching")}
                </span>
              )}
              {voiceProcessing && (
                <span className="text-[11px] text-violet-600 dark:text-violet-300">
                  {t("chat.voiceProcessing")}
                </span>
              )}
            </div>
            <div className="hidden text-[11px] text-zinc-400 sm:block">
              <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Enter
              </kbd>{" "}
              to send,{" "}
              <kbd className="rounded border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Shift+Enter
              </kbd>{" "}
              for newline
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
