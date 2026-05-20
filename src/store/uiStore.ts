import { create } from "zustand";

const KEY = "maisha.sidebar_collapsed";

function readInitial(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: readInitial(),
  mobileNavOpen: false,

  toggleSidebar() {
    const next = !get().sidebarCollapsed;
    localStorage.setItem(KEY, next ? "1" : "0");
    set({ sidebarCollapsed: next });
  },

  setSidebarCollapsed(v) {
    localStorage.setItem(KEY, v ? "1" : "0");
    set({ sidebarCollapsed: v });
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
