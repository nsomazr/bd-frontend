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
  onVoiceCancel?: () => void;
  onClearVoiceNotice?: () => void;
  onOpenKnowledge?: () => void;
  knowledgePanelOpen?: boolean;
  voiceRecording?: boolean;
  voiceDurationSec?: number;
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
  onVoiceCancel,
  onClearVoiceNotice,
  onOpenKnowledge,
  knowledgePanelOpen,
  voiceRecording,
  voiceDurationSec,
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

  const chatBusy = Boolean(streaming);
  const inputDisabled = chatBusy || !onSend;

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

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

  useEffect(() => {
    if (!voiceRecording) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onVoiceCancel?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [voiceRecording, onVoiceCancel]);

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
          {voiceRecording && (
            <div className="flex items-center justify-between gap-2 border-b border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-600" />
                </span>
                <span className="font-semibold">{t("chat.voiceRecording")}</span>
                <span className="font-mono tabular-nums">
                  {formatDuration(voiceDurationSec ?? 0)}
                </span>
                <span className="hidden truncate text-rose-700/80 sm:inline dark:text-rose-200/80">
                  {t("chat.voiceRecordingHint")}
                </span>
              </div>
              {onVoiceCancel && (
                <button
                  type="button"
                  onClick={onVoiceCancel}
                  className="shrink-0 rounded-md px-2 py-1 font-medium text-rose-700 hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-900/40"
                >
                  {t("chat.voiceCancel")}
                </button>
              )}
            </div>
          )}
          <div className="flex items-end gap-2 px-2 pt-2">
            {onOpenKnowledge && (
              <button
                type="button"
                onClick={onOpenKnowledge}
                disabled={chatBusy}
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
                disabled={chatBusy && !voiceRecording}
                className={clsx(
                  "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50",
                  voiceRecording
                    ? "bg-rose-600 text-white ring-2 ring-rose-300 ring-offset-1 dark:ring-rose-800"
                    : voiceProcessing
                      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
                )}
                aria-label={
                  voiceRecording ? t("chat.voiceStop") : t("chat.voiceInput")
                }
                title={
                  voiceRecording ? t("chat.voiceStopHint") : t("chat.voiceHint")
                }
              >
                {voiceProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : voiceRecording ? (
                  <Square size={14} fill="currentColor" />
                ) : (
                  <Mic size={16} />
                )}
              </button>
            )}
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onClearVoiceNotice?.();
              }}
              onKeyDown={onKey}
              placeholder={
                voiceRecording
                  ? t("chat.voiceRecordingPlaceholder")
                  : voiceProcessing
                    ? t("chat.voiceProcessingPlaceholder")
                    : t("chat.inputPlaceholder")
              }
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
                disabled={inputDisabled || !value.trim() || voiceRecording || voiceProcessing}
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
                  disabled={chatBusy}
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
                  disabled={chatBusy}
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
              {voiceRecording && (
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-300">
                  {t("chat.voiceRecordingShort")}
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
