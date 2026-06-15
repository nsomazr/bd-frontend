import { api, API_BASE_URL, buildApiHeaders } from "./client";

export interface KnowledgeDocument {
  id: number;
  conversation_id: string | null;
  original_filename: string;
  content_type: string;
  file_size: number;
  status: "processing" | "ready" | "failed";
  chunk_count: number;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface RagSource {
  document_id: number;
  title: string;
  chunk_index: number;
  snippet: string;
  score?: number;
}

export interface KnowledgeMeta {
  max_files: number;
  max_file_bytes: number;
  max_total_bytes: number;
  file_count: number;
  total_bytes: number;
  files_remaining: number;
  bytes_remaining: number;
}

export async function fetchKnowledgeMeta(): Promise<KnowledgeMeta> {
  const { data } = await api.get<KnowledgeMeta>("/api/knowledge/meta/");
  return data;
}

export async function listKnowledgeDocuments(
  conversationId?: string | null,
): Promise<KnowledgeDocument[]> {
  const { data } = await api.get<KnowledgeDocument[]>("/api/knowledge/documents/", {
    params: conversationId ? { conversation_id: conversationId } : undefined,
  });
  return data;
}

export async function uploadKnowledgeDocument(
  file: File,
  conversationId?: string | null,
): Promise<KnowledgeDocument> {
  const form = new FormData();
  form.append("file", file);
  if (conversationId) form.append("conversation_id", conversationId);

  const resp = await fetch(`${API_BASE_URL}/api/knowledge/documents/`, {
    method: "POST",
    headers: buildApiHeaders(undefined, { omitContentType: true }),
    body: form,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    let detail = text;
    try {
      detail = JSON.parse(text)?.detail ?? text;
    } catch {
      /* keep raw */
    }
    throw new Error(detail || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function deleteKnowledgeDocument(documentId: number): Promise<void> {
  await api.delete(`/api/knowledge/documents/${documentId}/`);
}
