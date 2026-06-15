import { api } from "./client";

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
  const { data } = await api.get<ModelListResponse>("/api/models/");
  return data;
}

export function counterpartKey(
  models: ModelInfo[],
  key: string,
  variant: ModelVariant,
): string | null {
  const current = models.find((m) => m.key === key);
  if (!current) return null;
  if (current.variant === variant) return key;
  return (
    models.find((m) => m.base_key === current.base_key && m.variant === variant)?.key ??
    null
  );
}

export function modelsForVariant(models: ModelInfo[], variant: ModelVariant): ModelInfo[] {
  if (variant === "instruct") {
    return models.filter((m) => m.variant === "instruct");
  }
  const dpoModels = models.filter((m) => m.variant === "dpo");
  const instructOnly = models.filter(
    (m) => m.variant === "instruct" && !m.has_dpo,
  );
  return [...dpoModels, ...instructOnly];
}
