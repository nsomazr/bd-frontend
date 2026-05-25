import { api, API_BASE_URL, buildApiHeaders } from "./client";

export type ArenaSlot = "a" | "b";
export type ArenaVote = "a" | "b" | "tie" | "both_bad";

export interface ArenaBattleStartEvent {
  battle_id: number;
  prompt: string;
}

export interface ArenaTokenEvent {
  slot: ArenaSlot;
  delta: string;
}

export interface ArenaResponseDoneEvent {
  slot: ArenaSlot;
  content: string;
}

export interface ArenaDoneEvent {
  battle_id: number;
  response_a: string;
  response_b: string;
}

export interface ArenaModelInfo {
  key: string;
  label: string;
}

export interface ArenaVoteResult {
  battle_id: number;
  vote: ArenaVote;
  model_a: {
    key: string;
    rating_before: number;
    rating_after: number;
    delta: number;
  };
  model_b: {
    key: string;
    rating_before: number;
    rating_after: number;
    delta: number;
  };
  models: {
    a: ArenaModelInfo;
    b: ArenaModelInfo;
  };
}

export interface LeaderboardRow {
  model_key: string;
  label: string;
  rating: number;
  battles: number;
  wins: number;
  losses: number;
  ties: number;
  win_rate: number;
}

export interface LeaderboardSnapshot {
  version: number;
  total_battles: number;
  models: LeaderboardRow[];
}

export interface ArenaStreamHandlers {
  onStart?: (e: ArenaBattleStartEvent) => void;
  onModelLoading?: (slot: ArenaSlot) => void;
  onModelReady?: (slot: ArenaSlot) => void;
  onToken?: (e: ArenaTokenEvent) => void;
  onResponseDone?: (e: ArenaResponseDoneEvent) => void;
  onDone?: (e: ArenaDoneEvent) => void;
  onError?: (slot: ArenaSlot | null, message: string) => void;
}

function parseSse(block: string): { event: string; data: any } | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  try {
    return { event, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return { event, data: { raw: dataLines.join("\n") } };
  }
}

export async function streamArenaBattle(
  prompt: string,
  handlers: ArenaStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const resp = await fetch(`${API_BASE_URL}/api/arena/battles/`, {
    method: "POST",
    headers: buildApiHeaders({ Accept: "text/event-stream" }),
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    handlers.onError?.(null, text || `HTTP ${resp.status}`);
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const block = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const evt = parseSse(block);
      if (!evt) continue;
      switch (evt.event) {
        case "start":
          handlers.onStart?.(evt.data);
          break;
        case "model_loading":
          handlers.onModelLoading?.(evt.data.slot);
          break;
        case "model_ready":
          handlers.onModelReady?.(evt.data.slot);
          break;
        case "token":
          handlers.onToken?.(evt.data);
          break;
        case "response_done":
          handlers.onResponseDone?.(evt.data);
          break;
        case "done":
          handlers.onDone?.(evt.data);
          break;
        case "error":
          handlers.onError?.(evt.data.slot ?? null, evt.data.error ?? "stream error");
          break;
        default:
          break;
      }
    }
  }
}

export async function voteArenaBattle(
  battleId: number,
  vote: ArenaVote,
): Promise<ArenaVoteResult> {
  const { data } = await api.post<ArenaVoteResult>(
    `/api/arena/battles/${battleId}/vote/`,
    { vote },
  );
  return data;
}

export async function getLeaderboard(): Promise<LeaderboardSnapshot> {
  const { data } = await api.get<LeaderboardSnapshot>("/api/arena/leaderboard/");
  return data;
}

/**
 * Subscribe to live leaderboard updates via SSE. Returns a cancel function.
 */
export function subscribeLeaderboard(
  onSnapshot: (snap: LeaderboardSnapshot) => void,
  onError?: (msg: string) => void,
): () => void {
  const controller = new AbortController();
  (async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/arena/leaderboard/stream/`, {
        method: "GET",
        headers: { Accept: "text/event-stream" },
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        onError?.(`HTTP ${resp.status}`);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const evt = parseSse(block);
          if (!evt) continue;
          if (evt.event === "snapshot") onSnapshot(evt.data);
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") onError?.(e?.message ?? "stream error");
    }
  })();
  return () => controller.abort();
}
