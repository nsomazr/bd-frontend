import { api } from "./client";

export interface ModelInfo {
  key: string;
  label: string;
  description: string;
  family: string;
}

export interface ModelListResponse {
  models: ModelInfo[];
  default: string;
  current: string | null;
}

export async function listModels(): Promise<ModelListResponse> {
  const { data } = await api.get<ModelListResponse>("/api/models/");
  return data;
}
