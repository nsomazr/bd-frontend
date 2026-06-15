# bd-frontend: Maisha Chat UI

React + Vite + TypeScript + Tailwind frontend for **Maisha Chat**, a
ChatGPT-like blood-donation assistant.

- Listens on port **3090** locally.
- Public URL: **https://maishachat.or.tz**.
- Talks to the Django backend at `VITE_API_BASE_URL` (default `http://localhost:8090`,
  production `https://api.maishachat.or.tz`).

## Features

- Email / password auth (JWT) with silent refresh.
- Sidebar with conversation history, "New chat" and delete.
- Model dropdown with **Instruct (SFT)** vs **DPO aligned** switch, populated from `/api/models/`.
- ChatGPT-style streaming via SSE (`fetch` + `ReadableStream`).
- Markdown rendering with `react-markdown` + `rehype-highlight` for code blocks.
- Light & dark themes (toggle in the profile menu).
- Blood-red brand accent (`#dc2626`).

## Setup

1. Copy the env template:
   ```bash
   cp .env.example .env
   ```
2. Install deps + run dev server:
   ```bash
   ./start.sh
   ```
   Vite serves at `http://0.0.0.0:3090`.

## Production deploy (PM2 + `serve`)

```bash
./deploy.sh
```

This script:

1. `npm ci` (or `npm install` if no lockfile).
2. `npm run build` with `VITE_API_BASE_URL=https://api.maishachat.or.tz`.
3. `pm2 startOrReload ecosystem.config.cjs` serves `dist/` on `127.0.0.1:3090`
   in single-page-app mode.

Front-facing nginx should forward `https://maishachat.or.tz` -> `127.0.0.1:3090`.

## Project layout

```
src/
├── api/         REST client (axios + JWT refresh), chat SSE consumer
├── store/       Zustand stores: authStore, modelStore, chatStore
├── components/  Sidebar, ChatWindow, MessageBubble, ModelDropdown, ChatInput, ProfileMenu, Markdown
├── pages/       Login, Signup, Chat
├── styles/      Tailwind entry + markdown / scrollbar overrides
└── App.tsx      Router with ProtectedRoute
```

## Models in the dropdown

`GET /api/models/` returns instruct and DPO-aligned variants:

- **Gemma 4 E4B** — instruct + DPO
- **Qwen 3.5 4B** — instruct + DPO
- **Llama 3.2 3B** — instruct + DPO

The dropdown toggle switches variant family-wide (e.g. Gemma instruct ↔ Gemma DPO).
Selection is persisted to `localStorage` (`maisha.selected_model`, `maisha.model_variant`).
