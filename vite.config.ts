import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Backend target the dev server proxies to. Override with VITE_API_PROXY_TARGET
// or BACKEND_URL if your backend lives somewhere other than localhost:8090.
const PROXY_TARGET =
  process.env.VITE_API_PROXY_TARGET ||
  process.env.BACKEND_URL ||
  "http://127.0.0.1:8090";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_PROXY_TARGET || env.BACKEND_URL || PROXY_TARGET;
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3090,
      strictPort: true,
      proxy: {
        // Browser hits the Vite dev server only; Vite forwards /api/* to the
        // Django backend so the user never has to think about hostnames.
        "/api": {
          target,
          changeOrigin: true,
          // SSE: don't buffer events on the proxy.
          configure: (proxy) => {
            proxy.on("proxyRes", (proxyRes) => {
              proxyRes.headers["x-accel-buffering"] = "no";
            });
          },
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 3090,
      strictPort: true,
    },
  };
});
