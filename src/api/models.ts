import { api } from "./client";
import { asArray } from "@/utils/array";

export type ModelVariant = "instruct" | "dpo";

export interface ModelInfo {
  key: string;
  label: string;
  description: string;
  family: string;
  variant: ModelVariant;
  base_key: string;
  variant_label: string;
  variant_description: string;
  has_dpo: boolean;
}

export interface ModelVariantsInfo {
  instruct: string;
  dpo: string;
  instruct_description: string;
  dpo_description: string;
  default: ModelVariant;
}

export interface ModelListResponse {
  models: ModelInfo[];
  variants: ModelVariantsInfo;
  default: string;
  current: string | null;
}

export async function listModels(): Promise<ModelListResponse> {
  const { data } = await api.get<ModelListResponse | ModelInfo[]>("/api/models/");
  const payload = data as ModelListResponse & { results?: ModelInfo[] };
  const models = Array.isArray(data)
    ? data
    : asArray<ModelInfo>(payload?.models ?? payload?.results);
  return {
    models,
    variants: payload?.variants ?? {
      instruct: "Instruct (SFT)",
      dpo: "DPO aligned",
      instruct_description: "",
      dpo_description: "",
      default: "dpo",
    },
    default: payload?.default ?? models[0]?.key ?? "gemma4-e4b-dpo",
    current: payload?.current ?? null,
  };
}

export function counterpartKey(
  models: ModelInfo[],
  key: string,
  variant: ModelVariant,
): string | null {
  const list = asArray<ModelInfo>(models);
  const current = list.find((m) => m.key === key);
  if (!current) return null;
  if (current.variant === variant) return key;
  return (
    list.find((m) => m.base_key === current.base_key && m.variant === variant)?.key ??
    null
  );
}

export function modelsForVariant(models: ModelInfo[], variant: ModelVariant): ModelInfo[] {
  const list = asArray<ModelInfo>(models);
  if (variant === "instruct") {
    return list.filter((m) => m.variant === "instruct");
  }
  const dpoModels = list.filter((m) => m.variant === "dpo");
  const instructOnly = list.filter(
    (m) => m.variant === "instruct" && !m.has_dpo,
  );
  return [...dpoModels, ...instructOnly];
}
