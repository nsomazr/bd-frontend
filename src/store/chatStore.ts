import { create } from "zustand";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  renameConversation,
  streamCompletion,
  type Conversation,
  type Message,
} from "@/api/chat";
import {
  clearFeedback,
  streamRegenerate,
  submitFeedback,
  type FeedbackRating,
} from "@/api/rlhf";

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;
  messages: Message[];
  loadingList: boolean;
  loadingMessages: boolean;
  streaming: boolean;
  webSearching: boolean;
  knowledgeSearching: boolean;
  streamError: string | null;
  notFound: boolean;
  loadConversations: () => Promise<void>;
  newConversation: (modelKey: string) => Promise<Conversation>;
  selectConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  sendMessage: (
    content: string,
    modelKey: string,
    options?: { webSearch?: boolean; useKnowledge?: boolean },
  ) => Promise<string | null>;
  regenerateLast: (modelKey?: string) => Promise<void>;
  rateMessage: (messageId: number, rating: FeedbackRating | null, comment?: string) => Promise<void>;
  clearError: () => void;
  stopGeneration: () => void;
  appendVoiceTurn: (turn: VoiceTurnPayload) => void;
  reset: () => void;
}

export interface VoiceTurnPayload {
  sukumaTranscript: string;
  translatedQuery: string;
  assistantTarget: string;
  assistantSukuma: string;
  modelKey: string;
  targetLanguage: "sw" | "en";
  audioBase64?: string | null;
}

let tempAssistantId = -1;
let activeStreamAbort: AbortController | null = null;

const INITIAL_STATE = {
  conversations: [] as Conversation[],
  activeId: null as string | null,
  messages: [] as Message[],
  loadingList: false,
  loadingMessages: false,
  streaming: false,
  webSearching: false,
  knowledgeSearching: false,
  streamError: null as string | null,
  notFound: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...INITIAL_STATE,

  clearError() {
    set({ streamError: null });
  },

  stopGeneration() {
    activeStreamAbort?.abort();
    activeStreamAbort = null;
    set({ streaming: false, webSearching: false, knowledgeSearching: false });
  },

  appendVoiceTurn(turn) {
    const now = new Date().toISOString();
    const userContent =
      turn.targetLanguage === "sw"
        ? `${turn.sukumaTranscript}\n\n_(Kiswahili: ${turn.translatedQuery})_`
        : `${turn.sukumaTranscript}\n\n_(English: ${turn.translatedQuery})_`;
    const assistantContent =
      `${turn.assistantSukuma}\n\n---\n\n${turn.assistantTarget}`;

    set((s) => ({
      messages: [
        ...s.messages,
        {
          id: -Date.now(),
          role: "user",
          content: userContent,
          model_key: turn.modelKey,
          created_at: now,
        },
        {
          id: tempAssistantId--,
          role: "assistant",
          content: assistantContent,
          model_key: turn.modelKey,
          created_at: now,
        },
      ],
      streamError: null,
    }));
  },

  reset() {
    activeStreamAbort?.abort();
    activeStreamAbort = null;
    set({ ...INITIAL_STATE });
  },

  async loadConversations() {
    set({ loadingList: true });
    try {
      const conversations = await listConversations();
      set({ conversations });
    } catch {
      // Either 401 (handled by interceptor) or a transient network error.
      // Treat as "no conversations" rather than crashing the UI.
      set({ conversations: [] });
    } finally {
      set({ loadingList: false });
    }
  },

  async newConversation(modelKey) {
    const convo = await createConversation(modelKey);
    set((s) => ({
      conversations: [convo, ...s.conversations],
      activeId: convo.id,
      messages: [],
    }));
    return convo;
  },

  async selectConversation(id) {
    const state = get();
    if (state.activeId === id && (state.streaming || state.messages.length > 0)) {
      return;
    }
    if (state.activeId === id) {
      set({ loadingMessages: true, notFound: false });
    } else {
      set({ activeId: id, loadingMessages: true, messages: [], notFound: false });
    }
    try {
      const detail = await getConversation(id);
      set((s) => {
        if (s.activeId !== id) return s;
        if (s.streaming) {
          return { ...s, loadingMessages: false, notFound: false };
        }
        return { messages: detail.messages, notFound: false, loadingMessages: false };
      });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        set({ messages: [], notFound: true, activeId: null, loadingMessages: false });
      } else {
        set((s) => ({ ...s, loadingMessages: false }));
      }
    }
  },

  async removeConversation(id) {
    await deleteConversation(id);
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      activeId: s.activeId === id ? null : s.activeId,
      messages: s.activeId === id ? [] : s.messages,
    }));
  },

  async renameConversation(id, title) {
    const updated = await renameConversation(id, title);
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? updated : c)),
    }));
  },

  async sendMessage(content, modelKey, options) {
    let activeId = get().activeId;
    if (!activeId) {
      const convo = await get().newConversation(modelKey);
      activeId = convo.id;
    }

    const now = new Date().toISOString();
    const optimisticUserId = -Date.now();
    const optimisticUser: Message = {
      id: optimisticUserId,
      role: "user",
      content,
      model_key: modelKey,
      created_at: now,
    };
    const placeholderId = tempAssistantId--;
    const placeholder: Message = {
      id: placeholderId,
      role: "assistant",
      content: "",
      model_key: modelKey,
      created_at: now,
    };
    set((s) => ({
      activeId,
      messages: [...s.messages, optimisticUser, placeholder],
      streaming: true,
      webSearching: Boolean(options?.webSearch),
      knowledgeSearching: Boolean(options?.useKnowledge),
      streamError: null,
    }));

    activeStreamAbort?.abort();
    activeStreamAbort = new AbortController();
    const signal = activeStreamAbort.signal;

    try {
      await streamCompletion(
        activeId,
        content,
        modelKey,
        {
        onStart: (info) => {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === optimisticUserId
                ? { ...m, id: info.user_message_id }
                : m,
            ),
          }));
        },
        onWebSearch: (info) => {
          set({ webSearching: info.status === "searching" });
        },
        onKnowledge: (info) => {
          set({ knowledgeSearching: info.status === "searching" });
        },
        onToken: (delta) => {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === placeholderId ? { ...m, content: m.content + delta } : m,
            ),
          }));
        },
        onDone: (info) => {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === placeholderId
                ? {
                    ...m,
                    id: info.assistant_message_id,
                    content: info.content,
                    web_sources: info.web_sources ?? m.web_sources,
                    rag_sources: info.rag_sources ?? m.rag_sources,
                    truncated: Boolean(info.truncated),
                  }
                : m,
            ),
          }));
        },
        onError: (msg) => {
          set({ streamError: msg });
        },
      },
        signal,
        { webSearch: options?.webSearch, useKnowledge: options?.useKnowledge },
      );
      get().loadConversations().catch(() => undefined);
      return activeId;
    } catch (e: any) {
      if (e?.name === "AbortError") return activeId;
      set({ streamError: e?.message ?? "Stream failed" });
      return activeId;
    } finally {
      activeStreamAbort = null;
      set({ streaming: false, webSearching: false, knowledgeSearching: false });
    }
  },

  async regenerateLast(modelKey) {
    const { activeId, messages } = get();
    if (!activeId) return;

    // The assistant message we are about to replace is the last one in view.
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    const placeholderId = tempAssistantId--;
    const placeholder: Message = {
      id: placeholderId,
      role: "assistant",
      content: "",
      model_key: modelKey ?? lastAssistant.model_key,
      created_at: new Date().toISOString(),
    };

    // Optimistically remove the rejected response and append a streaming placeholder.
    set((s) => ({
      messages: s.messages
        .filter((m) => m.id !== lastAssistant.id)
        .concat(placeholder),
      streaming: true,
      streamError: null,
    }));

    activeStreamAbort?.abort();
    activeStreamAbort = new AbortController();
    const signal = activeStreamAbort.signal;

    try {
      await streamRegenerate(activeId, modelKey ?? null, {
        onToken: (delta) => {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === placeholderId ? { ...m, content: m.content + delta } : m,
            ),
          }));
        },
        onDone: (info) => {
          set((s) => ({
            messages: s.messages.map((m) =>
              m.id === placeholderId
                ? {
                    ...m,
                    id: info.assistant_message_id,
                    content: info.content,
                    feedback_rating: null,
                    web_sources: [],
                    truncated: Boolean(info.truncated),
                  }
                : m,
            ),
          }));
        },
        onError: (msg) => {
          set({ streamError: msg });
        },
      }, signal);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      set({ streamError: e?.message ?? "Regeneration failed" });
    } finally {
      activeStreamAbort = null;
      set({ streaming: false });
    }
  },

  async rateMessage(messageId, rating, comment) {
    const prev = get().messages.find((m) => m.id === messageId)?.feedback_rating ?? null;
    // Optimistic update
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, feedback_rating: rating } : m,
      ),
    }));
    try {
      if (rating === null) {
        await clearFeedback(messageId);
      } else {
        await submitFeedback(messageId, { rating, comment: comment ?? "" });
      }
    } catch (e: any) {
      // Roll back on failure
      set((s) => ({
        messages: s.messages.map((m) =>
          m.id === messageId ? { ...m, feedback_rating: prev } : m,
        ),
        streamError: e?.response?.data?.detail ?? "Could not save feedback",
      }));
    }
  },
}));
