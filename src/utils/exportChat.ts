import type { Conversation, Message } from "@/api/chat";

export type ChatExportFormat = "markdown" | "json";

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function safeFilename(title: string | undefined, id: string | null) {
  const base = (title || "maisha-chat").trim().slice(0, 60);
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = id ? id.slice(0, 8) : "draft";
  return `${slug || "maisha-chat"}-${suffix}`;
}

export function buildChatMarkdown(
  messages: Message[],
  meta?: { title?: string; modelKey?: string; exportedAt?: string },
): string {
  const lines: string[] = [
    `# ${meta?.title?.trim() || "Maisha Chat"}`,
    "",
    `- Exported: ${meta?.exportedAt ?? new Date().toISOString()}`,
  ];
  if (meta?.modelKey) lines.push(`- Model: ${meta.modelKey}`);
  lines.push("", "---", "");

  for (const m of messages) {
    const role = m.role === "user" ? "You" : "Maisha";
    lines.push(`## ${role}`, "");
    lines.push(m.content.trim(), "");
    if (m.web_sources?.length) {
      lines.push("### Web sources", "");
      m.web_sources.forEach((s, i) => {
        lines.push(`${i + 1}. [${s.title || s.url}](${s.url})`);
      });
      lines.push("");
    }
    if (m.rag_sources?.length) {
      lines.push("### Document sources", "");
      m.rag_sources.forEach((s, i) => {
        lines.push(`${i + 1}. ${s.title}${s.snippet ? ` — ${s.snippet}` : ""}`);
      });
      lines.push("");
    }
    lines.push("---", "");
  }
  return lines.join("\n").trim() + "\n";
}

export function buildChatJson(
  messages: Message[],
  meta?: {
    id?: string | null;
    title?: string;
    modelKey?: string;
    exportedAt?: string;
  },
) {
  return {
    exported_at: meta?.exportedAt ?? new Date().toISOString(),
    conversation: {
      id: meta?.id ?? null,
      title: meta?.title ?? null,
      model_key: meta?.modelKey ?? null,
    },
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      model_key: m.model_key,
      web_sources: m.web_sources ?? [],
      rag_sources: m.rag_sources ?? [],
      feedback_rating: m.feedback_rating ?? null,
      created_at: m.created_at,
    })),
  };
}

export function exportChat(
  messages: Message[],
  format: ChatExportFormat,
  meta?: {
    conversation?: Conversation | null;
    activeId?: string | null;
    modelKey?: string;
  },
) {
  if (messages.length === 0) return;

  const convo = meta?.conversation ?? null;
  const id = convo?.id ?? meta?.activeId ?? null;
  const title = convo?.title;
  const modelKey = convo?.model_key ?? meta?.modelKey;
  const exportedAt = new Date().toISOString();
  const filenameBase = safeFilename(title, id);

  if (format === "markdown") {
    downloadText(
      `${filenameBase}.md`,
      buildChatMarkdown(messages, { title, modelKey, exportedAt }),
      "text/markdown;charset=utf-8",
    );
    return;
  }

  downloadText(
    `${filenameBase}.json`,
    JSON.stringify(
      buildChatJson(messages, { id, title, modelKey, exportedAt }),
      null,
      2,
    ),
    "application/json;charset=utf-8",
  );
}
