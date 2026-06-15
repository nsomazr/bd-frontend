import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { searchConversations, type ConversationSearchHit } from "@/api/chat";
import { useLocale } from "@/hooks/useLocale";

interface ChatSearchBoxProps {
  onSelectHit: (hit: ConversationSearchHit) => void;
  disabled?: boolean;
}

export function ChatSearchBox({ onSelectHit, disabled }: ChatSearchBoxProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ConversationSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    searchConversations(debouncedQuery)
      .then((resp) => {
        if (!active) return;
        setResults(resp.results);
      })
      .catch((e: any) => {
        if (!active) return;
        setResults([]);
        setError(e?.response?.data?.detail ?? e?.message ?? t("sidebar.searchFailed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, t]);

  const searching = debouncedQuery.length >= 2;

  return (
    <div className="px-2 pb-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("sidebar.searchPlaceholder")}
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            aria-label={t("sidebar.clearSearch")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {searching && (
        <div className="mt-2 space-y-1">
          <div className="px-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {loading ? t("sidebar.searching") : `${t("sidebar.searchResults")} (${results.length})`}
          </div>
          {loading && (
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-zinc-500">
              <Loader2 size={12} className="animate-spin" />
              {t("sidebar.searching")}
            </div>
          )}
          {error && !loading && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          )}
          {!loading && !error && results.length === 0 && (
            <div className="px-2 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              {t("sidebar.searchEmpty")}
            </div>
          )}
          {!loading &&
            results.map((hit) => (
              <button
                key={`${hit.conversation_id}-${hit.message_id ?? "title"}`}
                type="button"
                onClick={() => onSelectHit(hit)}
                className="w-full rounded-lg px-2 py-2 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              >
                <div className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {hit.title || t("sidebar.untitled")}
                </div>
                <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {hit.match_in === "title" ? (
                    <span className="text-brand-600 dark:text-brand-300">{hit.snippet}</span>
                  ) : (
                    <>
                      <span className="font-medium capitalize">{hit.message_role}: </span>
                      {highlightSnippet(hit.snippet, debouncedQuery)}
                    </>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function highlightSnippet(text: string, query: string) {
  const needle = query.trim();
  if (!needle) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(needle.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-brand-100 px-0.5 text-brand-800 dark:bg-brand-950/60 dark:text-brand-200">
        {text.slice(idx, idx + needle.length)}
      </mark>
      {text.slice(idx + needle.length)}
    </>
  );
}
