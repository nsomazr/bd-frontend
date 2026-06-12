import { ExternalLink, Globe, X } from "lucide-react";
import type { WebSearchSource } from "@/api/chat";
import { useLocale } from "@/hooks/useLocale";

interface SourcesPanelProps {
  sources: WebSearchSource[];
  onClose: () => void;
}

export function SourcesPanel({ sources, onClose }: SourcesPanelProps) {
  const { t } = useLocale();

  return (
    <aside className="fixed inset-y-0 right-0 z-40 flex h-full w-full max-w-sm shrink-0 flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 md:relative md:inset-auto md:z-auto md:w-80 md:max-w-none md:shadow-none lg:w-96">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-2">
          <Globe size={16} className="shrink-0 text-brand-600 dark:text-brand-400" />
          <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("chat.sourcesPanelTitle")}
          </h2>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {sources.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label={t("chat.closeSources")}
        >
          <X size={16} />
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
        <ol className="space-y-2">
          {sources.map((source, index) => (
            <li
              key={`${source.url || source.title}-${index}`}
              className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                    {source.title || t("chat.untitledSource")}
                  </p>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex max-w-full items-center gap-1 text-xs text-brand-600 hover:underline dark:text-brand-400"
                    >
                      <span className="truncate">{source.url}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">{t("chat.noSourceUrl")}</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
