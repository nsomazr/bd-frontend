import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import clsx from "clsx";
import {
  deleteKnowledgeDocument,
  fetchKnowledgeMeta,
  listKnowledgeDocuments,
  uploadKnowledgeDocument,
  type KnowledgeDocument,
  type KnowledgeMeta,
} from "@/api/knowledge";
import { useLocale } from "@/hooks/useLocale";
import { asArray } from "@/utils/array";

const EXPANDED_KEY = "maisha.knowledge_panel_expanded";

interface KnowledgePanelProps {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  onLayoutChange?: () => void;
}

function readExpandedPreference(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(EXPANDED_KEY) === "1";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgePanel({ open, onClose, conversationId, onLayoutChange }: KnowledgePanelProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [meta, setMeta] = useState<KnowledgeMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(readExpandedPreference);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    Promise.all([listKnowledgeDocuments(conversationId), fetchKnowledgeMeta()])
      .then(([docs, limits]) => {
        setDocuments(asArray(docs));
        setMeta(limits);
      })
      .catch((e: any) =>
        setError(e?.response?.data?.detail ?? e?.message ?? t("knowledge.loadFailed")),
      )
      .finally(() => setLoading(false));
  }, [open, conversationId, t]);

  function toggleExpanded() {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(EXPANDED_KEY, next ? "1" : "0");
      queueMicrotask(() => onLayoutChange?.());
      return next;
    });
  }

  function validateFile(file: File): string | null {
    if (!meta) return null;
    if (file.size > meta.max_file_bytes) {
      return t("knowledge.fileTooLarge").replace(
        "{max}",
        formatBytes(meta.max_file_bytes),
      );
    }
    if (meta.file_count >= meta.max_files) {
      return t("knowledge.fileLimitReached").replace(
        "{max}",
        String(meta.max_files),
      );
    }
    if (meta.total_bytes + file.size > meta.max_total_bytes) {
      return t("knowledge.storageLimitReached").replace(
        "{max}",
        formatBytes(meta.max_total_bytes),
      );
    }
    return null;
  }

  async function handleUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const doc = await uploadKnowledgeDocument(file, conversationId);
      setDocuments((prev) => [doc, ...prev.filter((d) => d.id !== doc.id)]);
      const freshMeta = await fetchKnowledgeMeta();
      setMeta(freshMeta);
    } catch (e: any) {
      setError(e?.message ?? t("knowledge.uploadFailed"));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      await deleteKnowledgeDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      const freshMeta = await fetchKnowledgeMeta();
      setMeta(freshMeta);
    } catch (e: any) {
      setError(e?.message ?? t("knowledge.deleteFailed"));
    }
  }

  if (!open) return null;

  const atFileLimit = meta ? meta.file_count >= meta.max_files : false;
  const atStorageLimit = meta ? meta.total_bytes >= meta.max_total_bytes : false;
  const uploadDisabled = uploading || loading || atFileLimit || atStorageLimit;

  const usageSummary =
    meta &&
    t("knowledge.usageSummary")
      .replace("{count}", String(meta.file_count))
      .replace("{maxFiles}", String(meta.max_files))
      .replace("{size}", formatBytes(meta.total_bytes))
      .replace("{maxSize}", formatBytes(meta.max_total_bytes));

  return (
    <div className="border-t border-zinc-200 bg-zinc-50/90 px-3 py-2 backdrop-blur sm:px-4 dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2.5 sm:px-4",
            expanded && "border-b border-zinc-200 dark:border-zinc-800",
          )}
        >
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={expanded}
          >
            <Paperclip size={16} className="shrink-0 text-zinc-500" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                {t("knowledge.title")}
              </div>
              {!expanded && usageSummary && (
                <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                  {usageSummary}
                </div>
              )}
            </div>
          </button>

          {meta && expanded && (
            <span className="hidden shrink-0 text-[11px] text-zinc-500 sm:inline dark:text-zinc-400">
              {usageSummary}
            </span>
          )}

          <button
            type="button"
            onClick={toggleExpanded}
            className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={expanded ? t("knowledge.collapse") : t("knowledge.expand")}
            title={expanded ? t("knowledge.collapse") : t("knowledge.expand")}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={t("knowledge.close")}
          >
            <X size={16} />
          </button>
        </div>

        {expanded && (
          <div className="px-4 py-3">
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              {t("knowledge.hint")}
            </p>

            {meta && (
              <div className="mb-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300">
                {t("knowledge.limitsHint")
                  .replace("{maxFiles}", String(meta.max_files))
                  .replace("{maxFile}", formatBytes(meta.max_file_bytes))
                  .replace("{maxTotal}", formatBytes(meta.max_total_bytes))}
              </div>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".txt,.md,.markdown,.pdf,.docx,.xlsx,.csv,.tsv,.json,.html,.htm,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,text/*,application/pdf,application/json,image/*"
                className="hidden"
                disabled={uploadDisabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                }}
              />
              <button
                type="button"
                disabled={uploadDisabled}
                onClick={() => inputRef.current?.click()}
                title={
                  atFileLimit
                    ? t("knowledge.fileLimitReached").replace(
                        "{max}",
                        String(meta?.max_files ?? 0),
                      )
                    : atStorageLimit
                      ? t("knowledge.storageLimitReached").replace(
                          "{max}",
                          formatBytes(meta?.max_total_bytes ?? 0),
                        )
                      : undefined
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                {t("knowledge.upload")}
              </button>
              {conversationId && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("knowledge.scopedToChat")}
                </span>
              )}
            </div>

            {error && (
              <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
                <Loader2 size={14} className="animate-spin" />
                {t("knowledge.loading")}
              </div>
            ) : documents.length === 0 ? (
              <div className="py-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {t("knowledge.empty")}
              </div>
            ) : (
              <ul className="max-h-48 space-y-2 overflow-y-auto">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        <FileText size={14} className="shrink-0 opacity-70" />
                        <span className="truncate">{doc.original_filename}</span>
                        <span className="shrink-0 text-[10px] font-normal text-zinc-400">
                          {formatBytes(doc.file_size)}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500">
                        <StatusBadge status={doc.status} t={t} />
                        {doc.status === "ready" && (
                          <span className="ml-2">
                            {doc.chunk_count} {t("knowledge.chunks")}
                          </span>
                        )}
                        {doc.status === "failed" && doc.error_message && (
                          <span className="ml-2 text-rose-600 dark:text-rose-300">
                            {doc.error_message}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(doc.id)}
                      className="shrink-0 rounded p-1 text-zinc-400 hover:text-rose-600"
                      aria-label={t("knowledge.delete")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: KnowledgeDocument["status"];
  t: (key: import("@/i18n/translations").TranslationKey) => string;
}) {
  const label =
    status === "ready"
      ? t("knowledge.statusReady")
      : status === "processing"
        ? t("knowledge.statusProcessing")
        : t("knowledge.statusFailed");
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 font-medium",
        status === "ready" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
        status === "processing" && "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        status === "failed" && "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
      )}
    >
      {label}
    </span>
  );
}
