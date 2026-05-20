import { api, API_BASE_URL, tokenStorage } from "./client";

export type FeedbackRating = "up" | "down";

export interface FeedbackPayload {
  rating: FeedbackRating;
  comment?: string;
}

export async function submitFeedback(
  messageId: number,
  payload: FeedbackPayload,
): Promise<void> {
  await api.post(`/api/messages/${messageId}/feedback/`, payload);
}

export async function clearFeedback(messageId: number): Promise<void> {
  await api.delete(`/api/messages/${messageId}/feedback/`);
}

// --- Regenerate (SSE) ------------------------------------------------------

export interface RegenHandlers {
  onStart?: (info: {
    conversation_id: string;
    rejected_message_id: number;
    model_key: string;
  }) => void;
  onModelReady?: (info: { model_key: string }) => void;
  onToken?: (delta: string) => void;
  onDone?: (info: {
    assistant_message_id: number;
    rejected_message_id: number;
    content: string;
  }) => void;
  onError?: (message: string) => void;
}

export async function streamRegenerate(
  conversationId: string,
  modelKey: string | null,
  handlers: RegenHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = tokenStorage.getAccess();
  const resp = await fetch(
    `${API_BASE_URL}/api/conversations/${conversationId}/regenerate/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(modelKey ? { model_key: modelKey } : {}),
      signal,
    },
  );

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    handlers.onError?.(text || `HTTP ${resp.status}`);
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIdx: number;
    while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, sepIdx);
      buffer = buffer.slice(sepIdx + 2);
      const evt = parseSseBlock(raw);
      if (!evt) continue;
      switch (evt.event) {
        case "start":
          handlers.onStart?.(evt.data);
          break;
        case "model_ready":
          handlers.onModelReady?.(evt.data);
          break;
        case "token":
          if (typeof evt.data?.delta === "string") handlers.onToken?.(evt.data.delta);
          break;
        case "done":
          handlers.onDone?.(evt.data);
          break;
        case "error":
          handlers.onError?.(evt.data?.error ?? "stream error");
          break;
        default:
          break;
      }
    }
  }
}

function parseSseBlock(block: string): { event: string; data: any } | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  const dataStr = dataLines.join("\n");
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: { raw: dataStr } };
  }
}

// --- Admin -----------------------------------------------------------------

export interface AdminStats {
  users: { total: number; staff: number };
  conversations: number;
  messages: number;
  feedback: { total: number; up: number; down: number };
  arena: {
    total_battles: number;
    voted_battles: number;
    decisive_battles: number;
  };
  regenerations: number;
  dpo_pairs_available: number;
  as_of: string;
}

export interface AdminFeedbackRow {
  id: number;
  rating: FeedbackRating;
  comment: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  message_id: number;
  message_role: string;
  message_content: string;
  conversation_id: number;
  model_key: string;
}

export interface AdminRegenRow {
  id: number;
  conversation_id: number;
  user_message_id: number;
  user_email: string;
  prompt: string;
  rejected_text: string;
  rejected_model_key: string;
  chosen_text: string;
  chosen_model_key: string;
  created_at: string;
}

export interface AdminArenaRow {
  id: number;
  user_email: string;
  prompt: string;
  chosen_text: string;
  chosen_model_key: string;
  rejected_text: string;
  rejected_model_key: string;
  vote: string;
  created_at: string;
  voted_at: string | null;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>("/api/admin/rlhf/stats/");
  return data;
}

export async function listAdminFeedback(params: {
  page?: number;
  page_size?: number;
  rating?: FeedbackRating | "";
  q?: string;
}): Promise<Paginated<AdminFeedbackRow>> {
  const { data } = await api.get<Paginated<AdminFeedbackRow>>(
    "/api/admin/rlhf/feedback/",
    { params },
  );
  return data;
}

export async function listAdminRegenerations(params: {
  page?: number;
  page_size?: number;
  q?: string;
}): Promise<Paginated<AdminRegenRow>> {
  const { data } = await api.get<Paginated<AdminRegenRow>>(
    "/api/admin/rlhf/regenerations/",
    { params },
  );
  return data;
}

export async function listAdminArena(params: {
  page?: number;
  page_size?: number;
  q?: string;
}): Promise<Paginated<AdminArenaRow>> {
  const { data } = await api.get<Paginated<AdminArenaRow>>(
    "/api/admin/rlhf/arena/",
    { params },
  );
  return data;
}

/** Trigger an authenticated browser download for an admin export endpoint. */
export async function downloadAdminExport(
  path: string,
  filename: string,
): Promise<void> {
  const token = tokenStorage.getAccess();
  const resp = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!resp.ok) {
    throw new Error(`Download failed (${resp.status})`);
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
