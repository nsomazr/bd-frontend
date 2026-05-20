import { api, API_BASE_URL, tokenStorage } from "./client";

export interface Conversation {
  id: string;
  title: string;
  model_key: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  model_key: string;
  created_at: string;
  feedback_rating?: "up" | "down" | null;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>("/api/conversations/");
  return data;
}

export async function createConversation(model_key: string, title?: string): Promise<Conversation> {
  const { data } = await api.post<Conversation>("/api/conversations/", { model_key, title });
  return data;
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const { data } = await api.get<ConversationDetail>(`/api/conversations/${id}/`);
  return data;
}

export async function renameConversation(id: string, title: string): Promise<Conversation> {
  const { data } = await api.patch<Conversation>(`/api/conversations/${id}/`, { title });
  return data;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/api/conversations/${id}/`);
}

export interface StreamEventHandlers {
  onStart?: (info: { conversation_id: string; user_message_id: number; model_key: string }) => void;
  onModelReady?: (info: { model_key: string }) => void;
  onToken?: (delta: string) => void;
  onDone?: (info: { assistant_message_id: number; content: string }) => void;
  onError?: (message: string) => void;
}

/**
 * Stream an assistant completion via SSE. Uses `fetch` so we can send the JWT
 * in the Authorization header (EventSource cannot set custom headers).
 */
export async function streamCompletion(
  conversationId: string,
  content: string,
  model_key: string,
  handlers: StreamEventHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = tokenStorage.getAccess();
  const resp = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/complete/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content, model_key }),
    signal,
  });

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
