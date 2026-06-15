import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Loader2,
  MapPin,
  MessageSquareQuote,
  MessagesSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { HeaderControls } from "@/components/HeaderControls";
import { useAuthStore } from "@/store/authStore";
import {
  downloadAdminExport,
  getAdminStats,
  listAdminArena,
  listAdminConversations,
  listAdminFeedback,
  listAdminRegenerations,
  listAdminVisitors,
  type AdminArenaRow,
  type AdminConversationRow,
  type AdminFeedbackRow,
  type AdminRegenRow,
  type AdminStats,
  type AdminVisitorRow,
  type Paginated,
} from "@/api/rlhf";

type Tab = "visitors" | "conversations" | "dpo-arena" | "dpo-regen" | "feedback";

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("visitors");

  useEffect(() => {
    refreshStats();
  }, []);

  function refreshStats() {
    setStatsError(null);
    getAdminStats()
      .then(setStats)
      .catch((e) => setStatsError(e?.response?.data?.detail ?? e?.message ?? "Failed"));
  }

  return (
    <div className="flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <Link to="/" aria-label="Maisha home">
              <BrandMark size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldCheck size={12} />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/api-docs"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <BookOpen size={14} />
              API Docs
            </Link>
            <button
              type="button"
              onClick={refreshStats}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <HeaderControls />
            <span className="hidden text-xs text-zinc-500 sm:inline">
              {user?.email}
            </span>
          </div>
        </div>
      </header>

      <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
              RLHF data console
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Inspect every signal collected from the platform and download
              training-ready preference pairs.
            </p>
          </div>

          <StatsGrid stats={stats} error={statsError} />

          <ExportsCard stats={stats} />

          <div className="mt-8 flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton active={tab === "visitors"} onClick={() => setTab("visitors")}>
              <MapPin size={14} />
              Unique visitors
            </TabButton>
            <TabButton active={tab === "conversations"} onClick={() => setTab("conversations")}>
              <MessagesSquare size={14} />
              All chats
            </TabButton>
            <TabButton active={tab === "dpo-arena"} onClick={() => setTab("dpo-arena")}>
              <Trophy size={14} />
              Arena DPO pairs
            </TabButton>
            <TabButton active={tab === "dpo-regen"} onClick={() => setTab("dpo-regen")}>
              <RefreshCw size={14} />
              Regeneration pairs
            </TabButton>
            <TabButton active={tab === "feedback"} onClick={() => setTab("feedback")}>
              <MessageSquareQuote size={14} />
              Message feedback
            </TabButton>
          </div>

          <div className="mt-4">
            {tab === "visitors" && <VisitorsTab />}
            {tab === "conversations" && <ConversationsTab />}
            {tab === "dpo-arena" && <ArenaTab />}
            {tab === "dpo-regen" && <RegenTab />}
            {tab === "feedback" && <FeedbackTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      {children}
    </button>
  );
}

function StatsGrid({
  stats,
  error,
}: {
  stats: AdminStats | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
        Could not load stats: {error}
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="grid h-32 place-items-center rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
      <StatCard icon={Users} label="Users" value={stats.users.total} sub={`${stats.users.staff} staff`} />
      <StatCard
        icon={MapPin}
        label="Visitors"
        value={stats.visitors?.total ?? 0}
        sub={`${stats.visitors?.with_conversations ?? 0} with chats`}
      />
      <StatCard
        icon={MessageSquareQuote}
        label="Conversations"
        value={stats.conversations}
        sub={`${stats.messages} messages`}
      />
      <StatCard
        icon={Trophy}
        label="Arena battles"
        value={stats.arena.total_battles}
        sub={`${stats.arena.decisive_battles} decisive`}
      />
      <StatCard
        icon={RefreshCw}
        label="Regenerations"
        value={stats.regenerations}
        sub="DPO pairs"
      />
      <StatCard
        icon={ThumbsUp}
        label="Thumbs up"
        value={stats.feedback.up}
        sub="positive ratings"
      />
      <StatCard
        icon={Sparkles}
        label="DPO pairs"
        value={stats.dpo_pairs_available}
        accent
        sub="train-ready"
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border p-4",
        accent
          ? "border-brand-200 bg-gradient-to-br from-brand-50 to-white dark:border-brand-900/40 dark:from-brand-950/30 dark:to-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        <Icon size={14} className={accent ? "text-brand-500" : "text-zinc-400"} />
      </div>
      <div className="mt-1 text-2xl font-bold text-zinc-900 tabular-nums dark:text-white">
        {value.toLocaleString()}
      </div>
      {sub && (
        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</div>
      )}
    </div>
  );
}

function ExportsCard({ stats }: { stats: AdminStats | null }) {
  const [busy, setBusy] = useState<string | null>(null);
  async function dl(path: string, name: string) {
    setBusy(path);
    try {
      await downloadAdminExport(path, name);
    } catch (e: any) {
      alert(e?.message ?? "Download failed");
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-white">
            Training data exports
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            JSONL outputs are shaped for{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px] dark:bg-zinc-800">
              trl.DPOTrainer
            </code>
            : every row has prompt, chosen, rejected, metadata.
          </div>
        </div>
        {stats && (
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            updated{" "}
            {new Date(stats.as_of).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <ExportButton
          label="All DPO pairs (.jsonl)"
          sub="arena + regenerations"
          accent
          busy={busy === "/api/admin/rlhf/exports/dpo.jsonl"}
          onClick={() =>
            dl("/api/admin/rlhf/exports/dpo.jsonl", "maisha_dpo_pairs.jsonl")
          }
        />
        <ExportButton
          label="Arena DPO pairs (.jsonl)"
          sub="voted arena battles only"
          busy={busy === "/api/admin/rlhf/exports/dpo.jsonl?source=arena"}
          onClick={() =>
            dl(
              "/api/admin/rlhf/exports/dpo.jsonl?source=arena",
              "maisha_arena_dpo.jsonl",
            )
          }
        />
        <ExportButton
          label="Regeneration DPO pairs (.jsonl)"
          sub="rejected vs. new response"
          busy={busy === "/api/admin/rlhf/exports/dpo.jsonl?source=regeneration"}
          onClick={() =>
            dl(
              "/api/admin/rlhf/exports/dpo.jsonl?source=regeneration",
              "maisha_regen_dpo.jsonl",
            )
          }
        />
        <ExportButton
          label="Feedback (.jsonl)"
          sub="reward modelling shape"
          busy={busy === "/api/admin/rlhf/exports/feedback.jsonl"}
          onClick={() =>
            dl(
              "/api/admin/rlhf/exports/feedback.jsonl",
              "maisha_feedback.jsonl",
            )
          }
        />
        <ExportButton
          label="Feedback (.csv)"
          sub="spreadsheet-friendly"
          busy={busy === "/api/admin/rlhf/exports/feedback.csv"}
          onClick={() =>
            dl("/api/admin/rlhf/exports/feedback.csv", "maisha_feedback.csv")
          }
        />
        <ExportButton
          label="SFT samples (.jsonl)"
          sub="thumbs-up assistant messages"
          busy={busy === "/api/admin/rlhf/exports/sft.jsonl"}
          onClick={() =>
            dl("/api/admin/rlhf/exports/sft.jsonl", "maisha_sft.jsonl")
          }
        />
      </div>
    </div>
  );
}

function ExportButton({
  label,
  sub,
  onClick,
  busy,
  accent,
}: {
  label: string;
  sub: string;
  onClick: () => void;
  busy: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={clsx(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
        accent
          ? "border-brand-200 bg-brand-50 hover:border-brand-300 hover:bg-brand-100 dark:border-brand-900/40 dark:bg-brand-950/30 dark:hover:bg-brand-950/50"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900",
      )}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
          {label}
        </div>
        <div className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
          {sub}
        </div>
      </div>
      {busy ? (
        <Loader2 size={16} className="shrink-0 animate-spin text-brand-500" />
      ) : (
        <Download size={16} className="shrink-0 text-brand-600" />
      )}
    </button>
  );
}

// -- generic search/page wrapper --------------------------------------------

function useTablePage<T>(
  fetcher: (params: { page: number; q?: string }) => Promise<Paginated<T>>,
  deps: unknown[] = [],
) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [pending, setPending] = useState(false);
  const [data, setData] = useState<Paginated<T> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPending(true);
    setError(null);
    fetcher({ page, q: q.trim() || undefined })
      .then(setData)
      .catch((e) => setError(e?.response?.data?.detail ?? e?.message ?? "Failed"))
      .finally(() => setPending(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, ...deps]);

  return { page, setPage, q, setQ, pending, data, error };
}

function SearchBar({ q, setQ }: { q: string; setQ: (v: string) => void }) {
  return (
    <div className="relative max-w-md">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search..."
        className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-sm shadow-sm placeholder:text-zinc-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950"
      />
    </div>
  );
}

function Pagination({
  page,
  setPage,
  data,
}: {
  page: number;
  setPage: (n: number) => void;
  data: Paginated<unknown> | null;
}) {
  if (!data) return null;
  const pageSize = data.results.length > 0 ? data.results.length : 50;
  const totalPages = Math.max(1, Math.ceil((data.count ?? 0) / pageSize));
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
      <span>
        {data.count.toLocaleString()} rows · page {page} of ~{totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!data.previous}
          onClick={() => setPage(Math.max(1, page - 1))}
          className="rounded-md border border-zinc-200 px-2 py-1 disabled:opacity-50 dark:border-zinc-700"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={!data.next}
          onClick={() => setPage(page + 1)}
          className="rounded-md border border-zinc-200 px-2 py-1 disabled:opacity-50 dark:border-zinc-700"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// -- ARENA table ------------------------------------------------------------

function ArenaTab() {
  const { page, setPage, q, setQ, pending, data, error } = useTablePage(
    ({ page, q }) => listAdminArena({ page, page_size: 25, q }),
  );

  return (
    <div>
      <SearchBar q={q} setQ={setQ} />
      <div className="mt-3 space-y-3">
        {error && <ErrorBox msg={error} />}
        {pending && !data ? (
          <SkeletonRows />
        ) : data?.results.length === 0 ? (
          <EmptyBox label="No voted arena pairs yet." />
        ) : (
          data?.results.map((row) => <ArenaRow key={row.id} row={row} />)
        )}
      </div>
      <Pagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

function ArenaRow({ row }: { row: AdminArenaRow }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>#{row.id} · {row.user_email}</span>
        <span>{new Date(row.created_at).toLocaleString()}</span>
      </div>
      <PromptBlock label="Prompt" body={row.prompt} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <DpoBlock
          label="Chosen"
          model={row.chosen_model_key}
          modelMeta={row.chosen_model}
          body={row.chosen_text}
          tone="emerald"
        />
        <DpoBlock
          label="Rejected"
          model={row.rejected_model_key}
          modelMeta={row.rejected_model}
          body={row.rejected_text}
          tone="rose"
        />
      </div>
    </div>
  );
}

// -- REGEN table ------------------------------------------------------------

function RegenTab() {
  const { page, setPage, q, setQ, pending, data, error } = useTablePage(
    ({ page, q }) => listAdminRegenerations({ page, page_size: 25, q }),
  );

  return (
    <div>
      <SearchBar q={q} setQ={setQ} />
      <div className="mt-3 space-y-3">
        {error && <ErrorBox msg={error} />}
        {pending && !data ? (
          <SkeletonRows />
        ) : data?.results.length === 0 ? (
          <EmptyBox label="No regeneration pairs yet. They are created when a user clicks 'Regenerate' on a response." />
        ) : (
          data?.results.map((row) => <RegenRow key={row.id} row={row} />)
        )}
      </div>
      <Pagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

function RegenRow({ row }: { row: AdminRegenRow }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>#{row.id} · {row.user_email} · conv {row.conversation_id}</span>
        <span>{new Date(row.created_at).toLocaleString()}</span>
      </div>
      <PromptBlock label="Prompt" body={row.prompt} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <DpoBlock
          label="Chosen (new)"
          model={row.chosen_model_key}
          body={row.chosen_text}
          tone="emerald"
        />
        <DpoBlock
          label="Rejected (previous)"
          model={row.rejected_model_key}
          body={row.rejected_text}
          tone="rose"
        />
      </div>
    </div>
  );
}

// -- FEEDBACK table ---------------------------------------------------------

function FeedbackTab() {
  const [rating, setRating] = useState<"" | "up" | "down">("");
  const { page, setPage, q, setQ, pending, data, error } = useTablePage(
    ({ page, q }) =>
      listAdminFeedback({ page, page_size: 25, q, rating: rating || "" }),
    [rating],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar q={q} setQ={setQ} />
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
          <FilterPill active={rating === ""} onClick={() => setRating("")}>
            All
          </FilterPill>
          <FilterPill active={rating === "up"} onClick={() => setRating("up")}>
            <ThumbsUp size={12} />
            Up
          </FilterPill>
          <FilterPill active={rating === "down"} onClick={() => setRating("down")}>
            <ThumbsDown size={12} />
            Down
          </FilterPill>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {error && <ErrorBox msg={error} />}
        {pending && !data ? (
          <SkeletonRows />
        ) : data?.results.length === 0 ? (
          <EmptyBox label="No feedback yet. Thumbs up/down on assistant responses are collected automatically." />
        ) : (
          data?.results.map((row) => <FeedbackRow key={row.id} row={row} />)
        )}
      </div>
      <Pagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
        active
          ? "bg-brand-600 text-white"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      {children}
    </button>
  );
}

function FeedbackRow({ row }: { row: AdminFeedbackRow }) {
  const positive = row.rating === "up";
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          #{row.id} · {row.user_email} · conv {row.conversation_id} · model{" "}
          <code className="text-zinc-700 dark:text-zinc-300">{row.model_key}</code>
        </span>
        <span>{new Date(row.created_at).toLocaleString()}</span>
      </div>
      <div className="flex items-start gap-3">
        <span
          className={clsx(
            "grid h-7 w-7 shrink-0 place-items-center rounded-full",
            positive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
          )}
        >
          {positive ? <ThumbsUp size={14} /> : <ThumbsDown size={14} />}
        </span>
        <div className="min-w-0 flex-1">
          {row.comment && (
            <div className="mb-1 rounded-lg bg-zinc-50 px-3 py-2 text-xs italic text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              &ldquo;{row.comment}&rdquo;
            </div>
          )}
          <details className="text-sm text-zinc-700 dark:text-zinc-300">
            <summary className="cursor-pointer text-xs font-medium text-brand-600 hover:underline">
              View message
            </summary>
            <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              {row.message_content}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

// -- shared blocks ----------------------------------------------------------

function PromptBlock({ label, body }: { label: string; body: string }) {
  return (
    <details>
      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </summary>
      <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        {body}
      </pre>
    </details>
  );
}

function DpoBlock({
  label,
  model,
  modelMeta,
  body,
  tone,
}: {
  label: string;
  model: string;
  modelMeta?: {
    display_label: string;
    variant: "instruct" | "dpo";
    variant_label: string;
  };
  body: string;
  tone: "emerald" | "rose";
}) {
  const c = tone === "emerald"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
    : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200";
  return (
    <div className={clsx("rounded-xl border p-3", c)}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span>{label}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {modelMeta && (
            <span className="normal-case tracking-normal">{modelMeta.display_label}</span>
          )}
          <code className="text-[10px] opacity-80">{model}</code>
        </div>
      </div>
      <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs">{body}</pre>
    </div>
  );
}

function EmptyBox({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
      {label}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
      {msg}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        />
      ))}
    </div>
  );
}

function VisitorsTab() {
  const { page, setPage, q, setQ, pending, data, error } = useTablePage(
    ({ page, q }) => listAdminVisitors({ page, page_size: 25, q }),
  );

  return (
    <div>
      <SearchBar q={q} setQ={setQ} />
      <div className="mt-3 space-y-3">
        {error && <ErrorBox msg={error} />}
        {pending && !data ? (
          <SkeletonRows />
        ) : data?.results.length === 0 ? (
          <EmptyBox label="No anonymous visitors tracked yet." />
        ) : (
          data?.results.map((row) => <VisitorRow key={row.visitor_key} row={row} />)
        )}
      </div>
      <Pagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

function VisitorRow({ row }: { row: AdminVisitorRow }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span className="font-mono">{row.visitor_key.slice(0, 8)}…</span>
        <span>{new Date(row.last_seen).toLocaleString()}</span>
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <div className="font-medium text-zinc-900 dark:text-white">
            {row.location_label || "Unknown location"}
          </div>
          <div className="text-xs text-zinc-500">
            {row.last_ip || "No IP"} · {row.visit_count} visits
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          <div>{row.conversation_count} conversations · {row.message_count} messages</div>
          {row.linked_user_email && <div>Linked: {row.linked_user_email}</div>}
        </div>
      </div>
    </div>
  );
}

function ConversationsTab() {
  const [owner, setOwner] = useState<"" | "guest" | "registered">("");
  const { page, setPage, q, setQ, pending, data, error } = useTablePage(
    ({ page, q }) =>
      listAdminConversations({
        page,
        page_size: 25,
        q,
        owner: owner || undefined,
      }),
    [owner],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar q={q} setQ={setQ} />
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value as "" | "guest" | "registered")}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="">All owners</option>
          <option value="guest">Guest only</option>
          <option value="registered">Registered only</option>
        </select>
      </div>
      <div className="mt-3 space-y-3">
        {error && <ErrorBox msg={error} />}
        {pending && !data ? (
          <SkeletonRows />
        ) : data?.results.length === 0 ? (
          <EmptyBox label="No conversations yet." />
        ) : (
          data?.results.map((row) => <ConversationRow key={row.id} row={row} />)
        )}
      </div>
      <Pagination page={page} setPage={setPage} data={data} />
    </div>
  );
}

function ConversationRow({ row }: { row: AdminConversationRow }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          {row.id} · {row.owner_label} ({row.owner_type})
          {row.location_label ? ` · ${row.location_label}` : ""}
        </span>
        <span>{new Date(row.updated_at).toLocaleString()}</span>
      </div>
      <div className="text-sm font-medium text-zinc-900 dark:text-white">
        {row.title || "Untitled chat"}
      </div>
      <div className="mt-1 text-xs text-zinc-500">
        {row.message_count} messages · {row.model_key}
      </div>
    </div>
  );
}
