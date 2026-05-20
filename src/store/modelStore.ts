import { create } from "zustand";
import { listModels, type ModelInfo } from "@/api/models";

interface ModelState {
  models: ModelInfo[];
  selectedKey: string | null;
  loadingList: boolean;
  load: () => Promise<void>;
  select: (key: string) => void;
}

const STORAGE_KEY = "maisha.selected_model";
export const DEFAULT_MODEL_KEY = "gemma4-e4b";

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  selectedKey: localStorage.getItem(STORAGE_KEY),
  loadingList: false,

  async load() {
    if (get().models.length > 0) return;
    set({ loadingList: true });
    try {
      const resp = await listModels();
      const current = get().selectedKey;
      // Only keep the persisted selectedKey if the backend still serves that model.
      const validCurrent =
        current && resp.models.some((m) => m.key === current) ? current : null;
      set({
        models: resp.models,
        selectedKey:
          validCurrent ?? resp.default ?? DEFAULT_MODEL_KEY ?? resp.models[0]?.key ?? null,
      });
    } catch {
      // Leave models empty; UI will render a friendly empty state.
      set({ models: [] });
    } finally {
      set({ loadingList: false });
    }
  },

  select(key) {
    localStorage.setItem(STORAGE_KEY, key);
    set({ selectedKey: key });
  },
}));
