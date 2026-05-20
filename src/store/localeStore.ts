import { create } from "zustand";
import type { Lang } from "@/i18n/translations";

const STORAGE_KEY = "maisha.lang";

function readInitial(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "sw") return stored;
  return "en";
}

function persistLang(lang: Lang) {
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
}

interface LocaleState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  lang: readInitial(),
  setLang(lang) {
    persistLang(lang);
    set({ lang });
  },
  toggleLang() {
    const next: Lang = get().lang === "en" ? "sw" : "en";
    persistLang(next);
    set({ lang: next });
  },
}));

// Sync html lang on first import (before React mounts).
if (typeof document !== "undefined") {
  persistLang(useLocaleStore.getState().lang);
}
