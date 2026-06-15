import { API_BASE_URL, buildApiHeaders } from "./client";

export interface VoiceCapabilities {
  asr: { available: boolean; model: string };
  translation: {
    available: boolean;
    backend: string;
    dedicated_model: string | null;
    interim_note: string;
  };
  tts: { available: boolean; model: string | null; status: string };
  supported_target_languages: ("sw" | "en")[];
  pipeline: string[];
}

export interface VoiceCompleteResult {
  sukuma_transcript: string;
  target_language: "sw" | "en";
  translated_query: string;
  assistant_reply_target: string;
  assistant_reply_sukuma: string;
  audio_base64: string | null;
  audio_mime: string | null;
  tts_status: string;
  model_key: string;
  routing_reason: string;
}

export async function getVoiceCapabilities(): Promise<VoiceCapabilities> {
  const resp = await fetch(`${API_BASE_URL}/api/voice/capabilities/`, {
    headers: buildApiHeaders(),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export interface VoiceTranscribeResult {
  text_sukuma: string;
  language: string;
}

export async function voiceTranscribe(
  audio: Blob,
  filename = "recording.webm",
): Promise<VoiceTranscribeResult> {
  const form = new FormData();
  form.append("audio", audio, filename);

  const resp = await fetch(`${API_BASE_URL}/api/voice/transcribe/`, {
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
      /* keep raw text */
    }
    throw new Error(detail || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export async function voiceComplete(
  audio: Blob,
  options: {
    modelKey: string;
    targetLanguage: "sw" | "en";
    webSearch?: boolean;
    filename?: string;
  },
): Promise<VoiceCompleteResult> {
  const form = new FormData();
  form.append("audio", audio, options.filename ?? "recording.webm");
  form.append("model_key", options.modelKey);
  form.append("target_language", options.targetLanguage);
  if (options.webSearch) form.append("web_search", "true");

  const resp = await fetch(`${API_BASE_URL}/api/voice/complete/`, {
    method: "POST",
    headers: buildApiHeaders(undefined, { omitContentType: true }),
    body: form,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `HTTP ${resp.status}`);
  }
  return resp.json();
}
