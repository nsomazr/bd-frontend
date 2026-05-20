import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

// Empty string => same-origin requests (e.g. /api/auth/login/). The Vite dev
// server proxies /api/* to the backend, and in production nginx serves the
// app and the API from the same host. Override with VITE_API_BASE_URL only if
// you need to point the SPA at a different origin (e.g. cross-origin staging).
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "";

const ACCESS_KEY = "maisha.access";
const REFRESH_KEY = "maisha.refresh";

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    const headers = config.headers as any;
    if (typeof headers?.set === "function") headers.set("Authorization", `Bearer ${token}`);
    else config.headers = { ...(headers ?? {}), Authorization: `Bearer ${token}` } as any;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return null;
  try {
    const resp = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, { refresh });
    const access = resp.data?.access as string | undefined;
    if (access) {
      tokenStorage.set(access);
      return access;
    }
    return null;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;
    refreshing = refreshing ?? refreshAccessToken();
    const newToken = await refreshing;
    refreshing = null;
    if (!newToken) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
      return Promise.reject(error);
    }
    original.headers = original.headers ?? ({} as any);
    (original.headers as any)["Authorization"] = `Bearer ${newToken}`;
    return api.request(original);
  },
);
