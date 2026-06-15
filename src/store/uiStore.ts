import { create } from "zustand";
import type { WebSearchSource } from "@/api/chat";

const SIDEBAR_KEY = "maisha.sidebar_collapsed";
const WEB_SEARCH_KEY = "maisha.web_search";
const KNOWLEDGE_KEY = "maisha.use_knowledge";

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_KEY) === "1";
}

function readWebSearchEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WEB_SEARCH_KEY) === "1";
}

function readKnowledgeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KNOWLEDGE_KEY) === "1";
}

interface UiState {
  sidebarCollapsed: boolean;
  webSearchEnabled: boolean;
  knowledgeEnabled: boolean;
  knowledgePanelOpen: boolean;
  sourcesPanelOpen: boolean;
  sourcesPanelMessageId: number | null;
  sourcesPanelSources: WebSearchSource[];
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setWebSearchEnabled: (v: boolean) => void;
  toggleWebSearch: () => void;
  setKnowledgeEnabled: (v: boolean) => void;
  toggleKnowledge: () => void;
  setKnowledgePanelOpen: (v: boolean) => void;
  openSourcesPanel: (messageId: number, sources: WebSearchSource[]) => void;
  closeSourcesPanel: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: readSidebarCollapsed(),
  webSearchEnabled: readWebSearchEnabled(),
  knowledgeEnabled: readKnowledgeEnabled(),
  knowledgePanelOpen: false,
  sourcesPanelOpen: false,
  sourcesPanelMessageId: null,
  sourcesPanelSources: [],
  mobileNavOpen: false,

  toggleSidebar() {
    const next = !get().sidebarCollapsed;
    localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed(v) {
    localStorage.setItem(SIDEBAR_KEY, v ? "1" : "0");
    set({ sidebarCollapsed: v });
  },

  setWebSearchEnabled(v) {
    localStorage.setItem(WEB_SEARCH_KEY, v ? "1" : "0");
    set({ webSearchEnabled: v });
  },

  toggleWebSearch() {
    const next = !get().webSearchEnabled;
    localStorage.setItem(WEB_SEARCH_KEY, next ? "1" : "0");
    set({ webSearchEnabled: next });
  },

  setKnowledgeEnabled(v) {
    localStorage.setItem(KNOWLEDGE_KEY, v ? "1" : "0");
    set({ knowledgeEnabled: v });
  },

  toggleKnowledge() {
    const next = !get().knowledgeEnabled;
    localStorage.setItem(KNOWLEDGE_KEY, next ? "1" : "0");
    set({ knowledgeEnabled: next });
  },

  setKnowledgePanelOpen(v) {
    set({ knowledgePanelOpen: v });
  },

  openSourcesPanel(messageId, sources) {
    set({
      sourcesPanelOpen: true,
      sourcesPanelMessageId: messageId,
      sourcesPanelSources: sources,
    });
  },

  closeSourcesPanel() {
    set({
      sourcesPanelOpen: false,
      sourcesPanelMessageId: null,
      sourcesPanelSources: [],
    });
  },

  openMobileNav() {
    set({ mobileNavOpen: true });
  },

  closeMobileNav() {
    set({ mobileNavOpen: false });
  },

  toggleMobileNav() {
    set({ mobileNavOpen: !get().mobileNavOpen });
  },
}));
