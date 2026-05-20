import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  Crown,
  Inbox,
  Loader2,
  RadioTower,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import { BrandMark } from "@/components/BrandMark";
import { HeaderControls } from "@/components/HeaderControls";
import { useAuthStore } from "@/store/authStore";
import {
  getLeaderboard,
  subscribeLeaderboard,
  type LeaderboardSnapshot,
} from "@/api/arena";

export default function LeaderboardPage() {
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authed = useAuthStore((s) => s.status === "authenticated");

  useEffect(() => {
    let active = true;
    getLeaderboard()
      .then((snap) => {
        if (active) setSnapshot(snap);
      })
      .catch((e) => {
        if (active) setError(e?.message ?? "Failed to load leaderboard");
      });

    const unsubscribe = subscribeLeaderboard(
      (snap) => {
        if (!active) return;
        setSnapshot(snap);
        setConnected(true);
        setError(null);
      },
      (msg) => {
        if (!active) return;
        setConnected(false);
        setError(msg);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Maisha home">
              <BrandMark size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              <Award size={12} />
              Leaderboard
            </span>
          </div>
          <div className="flex items-center gap-1">
            {authed ? (
              <>
                <Link
                  to="/arena"
                  className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:inline-flex"
                >
                  <Zap size={14} />
                  Open arena
                </Link>
                <Link
                  to="/chat"
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white sm:inline-flex"
                >
                  Back to chat
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
                >
                  Get started
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
            <HeaderControls />
          </div>
        </div>
      </header>

      <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Header snapshot={snapshot} connected={connected} error={error} />
          {snapshot ? (
            <LeaderboardTable snapshot={snapshot} authed={authed} />
          ) : !error ? (
            <div className="grid place-items-center rounded-2xl border border-zinc-200 bg-white p-12 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              <Loader2 className="animate-spin text-brand-500" />
              <span className="mt-2 text-sm">Loading leaderboard...</span>
            </div>
          ) : null}
          {error && !snapshot && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              Could not connect to the live stream: {error}. The page will retry
              automatically.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Header({
  snapshot,
  connected,
  error,
}: {
  snapshot: LeaderboardSnapshot | null;
  connected: boolean;
  error: string | null;
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Live rankings
        </div>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
          Maisha Arena Leaderboard
        </h1>
        <p className="mt-1 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
          Elo ratings updated in real time as users vote in the arena. Each model
          starts at 1000; wins go up, losses go down, ties hover.
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div
          className={clsx(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
            connected
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : error
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
          )}
        >
          <span
            className={clsx(
              "h-2 w-2 rounded-full",
              connected
                ? "animate-pulse bg-emerald-500"
                : error
                  ? "bg-rose-500"
                  : "bg-zinc-400",
            )}
          />
          {connected ? "Live" : error ? "Disconnected" : "Connecting..."}
          <RadioTower size={12} className="opacity-50" />
        </div>
        {snapshot && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {snapshot.total_battles}
            </span>{" "}
            total votes ·{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">
              {snapshot.models.length}
            </span>{" "}
            models
          </div>
        )}
      </div>
    </div>
  );
}

const TIER_ICON = [Crown, Trophy, Sparkles, Activity];

function LeaderboardTable({
  snapshot,
  authed,
}: {
  snapshot: LeaderboardSnapshot;
  authed: boolean;
}) {
  if (snapshot.models.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
          <Inbox size={22} />
        </div>
        <div className="text-base font-semibold text-zinc-900 dark:text-white">
          No models registered yet
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Once the backend serves at least one model, it will appear here ranked by Elo.
        </p>
      </div>
    );
  }
  const noBattles = snapshot.total_battles === 0;
  const top = snapshot.models[0]?.rating ?? 1000;
  return (
    <>
      {noBattles && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-950/30">
          <Zap size={16} className="mt-0.5 shrink-0 text-brand-600" />
          <div className="text-sm text-brand-800 dark:text-brand-200">
            <span className="font-semibold">No votes yet.</span> All models start at
            Elo 1000.{" "}
            {authed ? (
              <Link to="/arena" className="font-semibold underline">
                Open the arena
              </Link>
            ) : (
              <Link to="/signup" className="font-semibold underline">
                Create an account
              </Link>
            )}{" "}
            and vote on a battle to bring this leaderboard to life.
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-[40px_1fr_120px_80px_120px] items-center gap-3 border-b border-zinc-100 bg-zinc-50/70 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400">
          <div>#</div>
          <div>Model</div>
          <div className="text-right">Elo</div>
          <div className="text-right">Battles</div>
          <div className="text-right">Win rate</div>
        </div>
        <ul>
          {snapshot.models.map((m, idx) => {
            const Icon = TIER_ICON[idx] ?? Activity;
            const widthPct = Math.max(
              8,
              Math.min(100, ((m.rating - 800) / Math.max(top - 800, 1)) * 100),
            );
            return (
              <li
                key={m.model_key}
                className="grid grid-cols-[40px_1fr_120px_80px_120px] items-center gap-3 border-b border-zinc-100 px-5 py-4 last:border-b-0 dark:border-zinc-800"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <Icon
                      size={14}
                      className={idx === 0 ? "text-amber-500" : "text-zinc-400"}
                    />
                    <span className="truncate">{m.label}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-700 ease-out"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-400">
                    {m.wins}W · {m.losses}L · {m.ties}T
                  </div>
                </div>
                <div className="text-right font-mono text-base font-semibold text-zinc-900 tabular-nums dark:text-white">
                  {m.rating.toFixed(0)}
                </div>
                <div className="text-right text-sm text-zinc-600 tabular-nums dark:text-zinc-300">
                  {m.battles}
                </div>
                <div className="text-right text-sm font-medium tabular-nums">
                  {m.battles === 0 ? (
                    <span className="text-zinc-400">n/a</span>
                  ) : (
                    <span
                      className={clsx(
                        m.win_rate >= 0.5
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {(m.win_rate * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
