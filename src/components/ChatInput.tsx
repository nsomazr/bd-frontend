import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { ModelDropdown } from "./ModelDropdown";
import { useLocale } from "@/hooks/useLocale";

interface ChatInputProps {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (text: string) => void;
}

export function ChatInput({ disabled, streaming, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const { t } = useLocale();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
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
            <textarea
              ref={ref}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKey}
              placeholder={t("chat.inputPlaceholder")}
              rows={1}
              disabled={disabled}
              className="max-h-60 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={submit}
              disabled={disabled || !value.trim()}
              className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t("chat.send")}
            >
              {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
            <ModelDropdown direction="up" />
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
