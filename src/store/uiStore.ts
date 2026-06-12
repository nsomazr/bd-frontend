import { create } from "zustand";

const SIDEBAR_KEY = "maisha.sidebar_collapsed";
const WEB_SEARCH_KEY = "maisha.web_search";

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_KEY) === "1";
}

function readWebSearchEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(WEB_SEARCH_KEY) === "1";
}

interface UiState {
  sidebarCollapsed: boolean;
  webSearchEnabled: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setWebSearchEnabled: (v: boolean) => void;
  toggleWebSearch: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: readSidebarCollapsed(),
  webSearchEnabled: readWebSearchEnabled(),
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
