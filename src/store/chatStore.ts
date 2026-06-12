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
  streamError: string | null;
  notFound: boolean;
  loadConversations: () => Promise<void>;
  newConversation: (modelKey: string) => Promise<Conversation>;
  selectConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  renameConversation: (id: string, title: string) => Promise<void>;
  sendMessage: (content: string, modelKey: string, options?: { webSearch?: boolean }) => Promise<void>;
  regenerateLast: (modelKey?: string) => Promise<void>;
  rateMessage: (messageId: number, rating: FeedbackRating | null, comment?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

let tempAssistantId = -1;

const INITIAL_STATE = {
  conversations: [] as Conversation[],
  activeId: null as string | null,
  messages: [] as Message[],
  loadingList: false,
  loadingMessages: false,
  streaming: false,
  webSearching: false,
  streamError: null as string | null,
  notFound: false,
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...INITIAL_STATE,

  clearError() {
    set({ streamError: null });
  },

  reset() {
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
    if (get().activeId === id) return;
    set({ activeId: id, loadingMessages: true, messages: [], notFound: false });
    try {
      const detail = await getConversation(id);
      set({ messages: detail.messages, notFound: false });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        set({ messages: [], notFound: true, activeId: null });
      } else {
        set({ messages: [] });
      }
    } finally {
      set({ loadingMessages: false });
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
    const optimisticUser: Message = {
      id: -Date.now(),
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
      messages: [...s.messages, optimisticUser, placeholder],
      streaming: true,
      webSearching: Boolean(options?.webSearch),
      streamError: null,
    }));

    try {
      await streamCompletion(
        activeId,
        content,
        modelKey,
        {
        onWebSearch: (info) => {
          set({ webSearching: info.status === "searching" });
          if (info.status === "done" && info.sources?.length) {
            set((s) => ({
              messages: s.messages.map((m) =>
                m.id === placeholderId ? { ...m, web_sources: info.sources } : m,
              ),
            }));
          }
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
                  }
                : m,
            ),
          }));
        },
        onError: (msg) => {
          set({ streamError: msg });
        },
      },
        undefined,
        { webSearch: options?.webSearch },
      );
      get().loadConversations().catch(() => undefined);
    } catch (e: any) {
      set({ streamError: e?.message ?? "Stream failed" });
    } finally {
      set({ streaming: false, webSearching: false });
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
                  }
                : m,
            ),
          }));
        },
        onError: (msg) => {
          set({ streamError: msg });
        },
      });
    } catch (e: any) {
      set({ streamError: e?.message ?? "Regeneration failed" });
    } finally {
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
