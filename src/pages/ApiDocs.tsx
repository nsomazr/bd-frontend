import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileJson,
  ShieldCheck,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { HeaderControls } from "@/components/HeaderControls";
import { Markdown } from "@/components/Markdown";
import { API_BASE_URL } from "@/api/client";

type Tab = "guide" | "swagger" | "redoc";

const MOBILE_GUIDE = `
# Mobile API Docs

This page is intended for internal mobile app integration only.

## Base URL

- Production: \`https://api.maishachat.or.tz\`
- Local: \`http://127.0.0.1:8090\`

## Docs endpoints

- Swagger UI: \`/api/docs/swagger/\`
- ReDoc: \`/api/docs/redoc/\`
- Raw OpenAPI schema: \`/api/schema/\`

## Authentication model

### Guest sessions

Send a persistent device UUID in:

\`X-Visitor-Id: <uuid>\`

Create this once per install and reuse it on every request so anonymous chats and analytics remain linked.

### Authenticated sessions

After login/register, send:

\`Authorization: Bearer <access_token>\`

Keep sending \`X-Visitor-Id\` too.

## Main app flow

1. Generate and store a visitor UUID.
2. Call \`GET /api/models/\`.
3. Create a conversation with \`POST /api/conversations/\`.
4. Stream replies with \`POST /api/conversations/{id}/complete/\`.
5. Optionally regenerate and submit message feedback.
6. Use login/register only when account sync is needed.

## SSE endpoints

- \`POST /api/conversations/{public_id}/complete/\`
- \`POST /api/conversations/{public_id}/regenerate/\`
- \`POST /api/arena/battles/\`
- \`GET /api/arena/leaderboard/stream/\`

These emit events like \`start\`, \`model_ready\`, \`token\`, \`done\`, and \`error\`.

## Notes

- Conversation IDs are strings.
- Message IDs and arena battle IDs are integers.
- The backend auto-detects English vs Swahili and responds accordingly.
- GPU/backend failures are masked with user-friendly messages.
`;

function docsUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
          : "rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }
    >
      {children}
    </button>
  );
}

export default function ApiDocsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("guide");
  const swaggerUrl = useMemo(() => docsUrl("/api/docs/swagger/"), []);
  const redocUrl = useMemo(() => docsUrl("/api/docs/redoc/"), []);
  const schemaUrl = useMemo(() => docsUrl("/api/schema/"), []);

  return (
    <div className="flex h-full flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <Link to="/" aria-label="Maisha home">
              <BrandMark size="sm" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <ShieldCheck size={12} />
              Internal API Docs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={schemaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <FileJson size={14} />
              Schema
            </a>
            <HeaderControls />
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">
                Mobile Integration Docs
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={swaggerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <ExternalLink size={14} />
                Open Swagger
              </a>
              <a
                href={redocUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <BookOpen size={14} />
                Open ReDoc
              </a>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
            <TabButton active={tab === "guide"} onClick={() => setTab("guide")}>
              Guide
            </TabButton>
            <TabButton active={tab === "swagger"} onClick={() => setTab("swagger")}>
              Swagger
            </TabButton>
            <TabButton active={tab === "redoc"} onClick={() => setTab("redoc")}>
              ReDoc
            </TabButton>
          </div>

          {tab === "guide" && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <Markdown>{MOBILE_GUIDE}</Markdown>
            </div>
          )}

          {tab === "swagger" && (
            <iframe
              title="Swagger API docs"
              src={swaggerUrl}
              className="h-[80vh] w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800"
            />
          )}

          {tab === "redoc" && (
            <iframe
              title="ReDoc API docs"
              src={redocUrl}
              className="h-[80vh] w-full rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800"
            />
          )}
        </div>
      </main>
    </div>
  );
}
