import { create } from "zustand";
import {
  counterpartKey,
  listModels,
  modelsForVariant,
  type ModelInfo,
  type ModelVariant,
  type ModelVariantsInfo,
} from "@/api/models";

interface ModelState {
  models: ModelInfo[];
  variants: ModelVariantsInfo | null;
  selectedKey: string | null;
  selectedVariant: ModelVariant;
  loadingList: boolean;
  load: () => Promise<void>;
  select: (key: string) => void;
  setVariant: (variant: ModelVariant) => void;
  visibleModels: () => ModelInfo[];
  currentModel: () => ModelInfo | undefined;
}

const STORAGE_KEY = "maisha.selected_model";
const VARIANT_KEY = "maisha.model_variant";
export const DEFAULT_MODEL_KEY = "gemma4-e4b-dpo";

function readStoredVariant(): ModelVariant {
  const stored = localStorage.getItem(VARIANT_KEY);
  return stored === "instruct" ? "instruct" : "dpo";
}

function resolveKeyForVariant(
  models: ModelInfo[],
  key: string | null,
  variant: ModelVariant,
  fallback: string | null,
): string | null {
  if (!models.length) return fallback;
  const base = key && models.some((m) => m.key === key) ? key : fallback;
  if (!base) return modelsForVariant(models, variant)[0]?.key ?? null;
  return counterpartKey(models, base, variant) ?? base;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  variants: null,
  selectedKey: localStorage.getItem(STORAGE_KEY),
  selectedVariant: readStoredVariant(),
  loadingList: false,

  async load() {
    if (get().models.length > 0) return;
    set({ loadingList: true });
    try {
      const resp = await listModels();
      const stored = readStoredVariant();
      const variant =
        stored === "instruct" || stored === "dpo" ? stored : resp.variants.default;

      const resolved = resolveKeyForVariant(
        resp.models,
        get().selectedKey,
        variant,
        resp.default ?? DEFAULT_MODEL_KEY,
      );

      set({
        models: resp.models,
        variants: resp.variants,
        selectedVariant: variant,
        selectedKey: resolved,
      });
      if (resolved) localStorage.setItem(STORAGE_KEY, resolved);
      localStorage.setItem(VARIANT_KEY, variant);
    } catch {
      set({ models: [], variants: null });
    } finally {
      set({ loadingList: false });
    }
  },

  select(key) {
    const model = get().models.find((m) => m.key === key);
    localStorage.setItem(STORAGE_KEY, key);
    set({
      selectedKey: key,
      selectedVariant: model?.variant ?? get().selectedVariant,
    });
    if (model?.variant) {
      localStorage.setItem(VARIANT_KEY, model.variant);
    }
  },

  setVariant(variant) {
    const { models, selectedKey } = get();
    localStorage.setItem(VARIANT_KEY, variant);
    const nextKey = resolveKeyForVariant(
      models,
      selectedKey,
      variant,
      models.find((m) => m.variant === variant)?.key ?? null,
    );
    if (nextKey) {
      localStorage.setItem(STORAGE_KEY, nextKey);
    }
    set({ selectedVariant: variant, selectedKey: nextKey });
  },

  visibleModels() {
    return modelsForVariant(get().models, get().selectedVariant);
  },

  currentModel() {
    const { models, selectedKey } = get();
    return models.find((m) => m.key === selectedKey);
  },
}));
