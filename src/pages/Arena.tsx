import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Crown,
  Equal,
  Loader2,
  PanelLeftOpen,
  RotateCcw,
  Send,
  ThumbsDown,
  Trophy,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { BrandMark } from "@/components/BrandMark";
import { Markdown } from "@/components/Markdown";
import { ProfileMenu } from "@/components/ProfileMenu";
import { Sidebar } from "@/components/Sidebar";
import { HeaderControls } from "@/components/HeaderControls";
import { useUiStore } from "@/store/uiStore";
import { useModelStore } from "@/store/modelStore";
import {
  streamArenaBattle,
  voteArenaBattle,
  type ArenaSlot,
  type ArenaVote,
  type ArenaVoteResult,
} from "@/api/arena";

type SlotState = {
  status: "idle" | "loading" | "ready" | "streaming" | "done" | "error";
  content: string;
  error?: string;
};

const INITIAL_SLOT: SlotState = { status: "idle", content: "" };

const SAMPLE_PROMPTS = [
  "How long do I need to wait between blood donations?",
  "I am vegetarian. Can I still donate blood?",
  "What is the difference between whole blood and plasma donation?",
  "Naomba kuelewa mchakato wa kuchangia damu Tanzania.",
];

export default function ArenaPage() {
  const [prompt, setPrompt] = useState("");
  const [battleId, setBattleId] = useState<number | null>(null);
  const [slotA, setSlotA] = useState<SlotState>(INITIAL_SLOT);
  const [slotB, setSlotB] = useState<SlotState>(INITIAL_SLOT);
  const [running, setRunning] = useState(false);
  const [voteResult, setVoteResult] = useState<ArenaVoteResult | null>(null);
  const [votePending, setVotePending] = useState<ArenaVote | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { sidebarCollapsed, toggleSidebar, openMobileNav } = useUiStore((s) => ({
    sidebarCollapsed: s.sidebarCollapsed,
    toggleSidebar: s.toggleSidebar,
    openMobileNav: s.openMobileNav,
  }));
  const { models, loadingModels, loadModels } = useModelStore((s) => ({
    models: s.models,
    loadingModels: s.loadingList,
    loadModels: s.load,
  }));

  useEffect(() => {
    loadModels();
  }, [loadModels]);
  const arenaReady = models.length >= 2;

  const setSlot = useCallback((slot: ArenaSlot, patch: Partial<SlotState>) => {
    const setter = slot === "a" ? setSlotA : setSlotB;
    setter((s) => ({ ...s, ...patch }));
  }, []);

  function resetBattle() {
    abortRef.current?.abort();
    abortRef.current = null;
    setBattleId(null);
    setSlotA(INITIAL_SLOT);
    setSlotB(INITIAL_SLOT);
    setVoteResult(null);
    setVoteError(null);
    setRunning(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || running) return;
    resetBattle();
    setRunning(true);
    setSlotA({ status: "loading", content: "" });
    setSlotB({ status: "loading", content: "" });
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      await streamArenaBattle(
        text,
        {
          onStart: (e) => setBattleId(e.battle_id),
          onModelLoading: (slot) => setSlot(slot, { status: "loading" }),
          onModelReady: (slot) => setSlot(slot, { status: "streaming" }),
          onToken: ({ slot, delta }) => {
            const setter = slot === "a" ? setSlotA : setSlotB;
            setter((s) => ({ ...s, status: "streaming", content: s.content + delta }));
          },
          onResponseDone: ({ slot, content }) => {
            setSlot(slot, { status: "done", content });
          },
          onDone: () => setRunning(false),
          onError: (slot, message) => {
            if (slot) setSlot(slot, { status: "error", error: message });
            else setVoteError(message);
            setRunning(false);
          },
        },
        ctrl.signal,
      );
    } finally {
      setRunning(false);
    }
  }

  async function vote(choice: ArenaVote) {
    if (!battleId || votePending || voteResult) return;
    setVotePending(choice);
    setVoteError(null);
    try {
      const result = await voteArenaBattle(battleId, choice);
      setVoteResult(result);
    } catch (e: any) {
      setVoteError(
        e?.response?.data?.detail ?? e?.message ?? "Could not record your vote.",
      );
    } finally {
      setVotePending(null);
    }
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const bothFinished = slotA.status === "done" && slotB.status === "done";
  const canVote = bothFinished && !voteResult && battleId !== null;

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/70 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openMobileNav}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:hidden dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Open menu"
            >
              <PanelLeftOpen size={16} />
            </button>
            {sidebarCollapsed && (
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden h-9 w-9 place-items-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 md:grid dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <BrandMark size="sm" />
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 sm:inline-flex dark:bg-brand-950/40 dark:text-brand-300">
              <Trophy size={12} />
              Arena
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Link
              to="/leaderboard"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:inline-flex"
            >
              <Award size={14} />
              Leaderboard
            </Link>
            <HeaderControls />
            <ProfileMenu />
          </div>
        </header>

        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
            {!battleId && !running ? <ArenaIntro /> : null}

            {!arenaReady && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <Loader2
                  size={16}
                  className={clsx(
                    "mt-0.5 shrink-0 text-amber-600",
                    loadingModels && "animate-spin",
                  )}
                />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  {loadingModels
                    ? "Loading models..."
                    : "Need at least two models registered on the backend to start an arena battle."}
                </div>
              </div>
            )}

            <form onSubmit={onSubmit} className="mb-5">
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-zinc-700 dark:bg-zinc-900">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={running}
                  placeholder="Ask the same question to two random models..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 disabled:opacity-60 dark:text-zinc-100"
                />
                {battleId && (
                  <button
                    type="button"
                    onClick={resetBattle}
                    className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="New battle"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={running || !prompt.trim() || !arenaReady}
                  className="flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {running ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  {running ? "Battling..." : "Battle"}
                </button>
              </div>
              {!battleId && !running && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {SAMPLE_PROMPTS.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPrompt(p)}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-brand-700"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ResponseColumn
                slot="a"
                state={slotA}
                anonymousLabel="Model A"
                revealedLabel={voteResult?.models.a.label}
                ratingDelta={voteResult?.model_a.delta}
                winner={voteResult?.vote === "a"}
              />
              <ResponseColumn
                slot="b"
                state={slotB}
                anonymousLabel="Model B"
                revealedLabel={voteResult?.models.b.label}
                ratingDelta={voteResult?.model_b.delta}
                winner={voteResult?.vote === "b"}
              />
            </div>

            {(canVote || voteResult || voteError) && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {voteResult ? (
                  <VoteRecap
                    result={voteResult}
                    onAnother={resetBattle}
                  />
                ) : (
                  <VoteButtons
                    pending={votePending}
                    onVote={vote}
                    error={voteError}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function ArenaIntro() {
  return (
    <div className="mb-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-brand-50/40 p-6 dark:border-zinc-800 dark:from-zinc-900 dark:to-brand-950/20">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow">
          <Trophy size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Model Comparison Arena
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Ask a question once and two anonymous models will answer it. Vote
            for the response you prefer. Your votes update the public{" "}
            <Link to="/leaderboard" className="font-medium text-brand-600 hover:underline">
              live leaderboard
            </Link>{" "}
            via the Elo rating system.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ResponseColumnProps {
  slot: ArenaSlot;
  state: SlotState;
  anonymousLabel: string;
  revealedLabel?: string;
  ratingDelta?: number;
  winner?: boolean;
}

function ResponseColumn({
  state,
  anonymousLabel,
  revealedLabel,
  ratingDelta,
  winner,
}: ResponseColumnProps) {
  const revealed = revealedLabel !== undefined;
  return (
    <div
      className={clsx(
        "flex min-h-[280px] flex-col rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-zinc-900",
        winner
          ? "border-brand-400 ring-2 ring-brand-500/30 dark:border-brand-700"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "grid h-7 w-7 place-items-center rounded-full text-xs font-bold",
              winner
                ? "bg-brand-600 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {revealed ? <Crown size={14} className={winner ? "" : "opacity-40"} /> : anonymousLabel.split(" ")[1]}
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">
              {revealed ? revealedLabel : anonymousLabel}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">
              <SlotStatusLabel status={state.status} />
            </div>
          </div>
        </div>
        {revealed && ratingDelta !== undefined && (
          <span
            className={clsx(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              ratingDelta > 0
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : ratingDelta < 0
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {ratingDelta > 0 ? "+" : ""}
            {ratingDelta} Elo
          </span>
        )}
      </div>

      <div className="prose prose-sm flex-1 dark:prose-invert">
        {state.status === "idle" && (
          <div className="grid h-full place-items-center text-sm text-zinc-400">
            Waiting for prompt
          </div>
        )}
        {(state.status === "loading" || (state.status === "streaming" && !state.content)) && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 size={14} className="animate-spin text-brand-500" />
            <span>{state.status === "loading" ? "Loading model..." : "Thinking..."}</span>
          </div>
        )}
        {state.content && (
          <>
            <Markdown>{state.content}</Markdown>
            {state.status === "streaming" && (
              <span className="ml-0.5 inline-block h-4 w-[2px] -mb-0.5 animate-blink-caret bg-brand-500 align-middle" />
            )}
          </>
        )}
        {state.status === "error" && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
}

function SlotStatusLabel({ status }: { status: SlotState["status"] }) {
  switch (status) {
    case "idle":
      return <>Idle</>;
    case "loading":
      return <>Loading model</>;
    case "ready":
      return <>Ready</>;
    case "streaming":
      return <>Streaming</>;
    case "done":
      return <>Done</>;
    case "error":
      return <>Error</>;
  }
}

function VoteButtons({
  pending,
  onVote,
  error,
}: {
  pending: ArenaVote | null;
  onVote: (v: ArenaVote) => void;
  error: string | null;
}) {
  const Btn = ({
    vote,
    icon: Icon,
    label,
    tone,
  }: {
    vote: ArenaVote;
    icon: any;
    label: string;
    tone: "brand" | "zinc";
  }) => (
    <button
      type="button"
      onClick={() => onVote(vote)}
      disabled={!!pending}
      className={clsx(
        "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-60",
        tone === "brand"
          ? "bg-brand-600 text-white hover:bg-brand-700"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
      )}
    >
      {pending === vote ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Icon size={14} />
      )}
      {label}
    </button>
  );

  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
        Which response was better?
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Btn vote="a" icon={Crown} label="A is better" tone="brand" />
        <Btn vote="b" icon={Crown} label="B is better" tone="brand" />
        <Btn vote="tie" icon={Equal} label="Tie" tone="zinc" />
        <Btn vote="both_bad" icon={ThumbsDown} label="Both bad" tone="zinc" />
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-400">
        Your vote stays anonymous and updates the live leaderboard in real time.
      </p>
    </div>
  );
}

function VoteRecap({
  result,
  onAnother,
}: {
  result: ArenaVoteResult;
  onAnother: () => void;
}) {
  const winnerLabel =
    result.vote === "a"
      ? `${result.models.a.label} wins`
      : result.vote === "b"
        ? `${result.models.b.label} wins`
        : result.vote === "tie"
          ? "It's a tie"
          : "Both responses fell short";
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Vote recorded
        </div>
        <div className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
          {winnerLabel}
        </div>
        <div className="mt-1 text-sm text-zinc-500">
          {result.models.a.label}: {result.model_a.rating_before} -&gt;{" "}
          {result.model_a.rating_after} ({result.model_a.delta >= 0 ? "+" : ""}
          {result.model_a.delta}). {result.models.b.label}:{" "}
          {result.model_b.rating_before} -&gt; {result.model_b.rating_after} (
          {result.model_b.delta >= 0 ? "+" : ""}
          {result.model_b.delta}).
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Award size={14} />
          See leaderboard
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Send size={14} />
          New battle
        </button>
      </div>
    </div>
  );
}
