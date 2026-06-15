import { useEffect, useRef, useState } from "react";
import { Download, FileJson, FileText } from "lucide-react";
import clsx from "clsx";
import type { Conversation, Message } from "@/api/chat";
import { exportChat } from "@/utils/exportChat";
import { asArray } from "@/utils/array";
import { useLocale } from "@/hooks/useLocale";

interface ChatExportMenuProps {
  messages: Message[];
  activeId: string | null;
  conversations: Conversation[];
  modelKey?: string | null;
  disabled?: boolean;
}

export function ChatExportMenu({
  messages,
  activeId,
  conversations,
  modelKey,
  disabled,
}: ChatExportMenuProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const conversation =
    asArray<Conversation>(conversations).find((c) => c.id === activeId) ?? null;
  const canExport = messages.length > 0 && !disabled;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function handleExport(format: "markdown" | "json") {
    exportChat(messages, format, { conversation, activeId, modelKey: modelKey ?? undefined });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={!canExport}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
        aria-label={t("chat.export")}
        title={t("chat.export")}
      >
        <Download size={15} />
        <span className="hidden sm:inline">{t("chat.export")}</span>
      </button>
      {open && canExport && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => handleExport("markdown")}
            className={clsx(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800",
            )}
          >
            <FileText size={14} />
            {t("chat.exportMarkdown")}
          </button>
          <button
            type="button"
            onClick={() => handleExport("json")}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <FileJson size={14} />
            {t("chat.exportJson")}
          </button>
        </div>
      )}
    </div>
  );
}
