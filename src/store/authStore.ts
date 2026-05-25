import { create } from "zustand";
import * as authApi from "@/api/auth";
import { tokenStorage, visitorStorage } from "@/api/client";

interface AuthState {
  user: authApi.User | null;
  status: "idle" | "loading" | "guest" | "authenticated";
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  error: null,

  async bootstrap() {
    visitorStorage.ensure();
    if (!tokenStorage.getAccess()) {
      set({ user: null, status: "guest", error: null });
      return;
    }
    set({ status: "loading" });
    try {
      const user = await authApi.me();
      set({ user, status: "authenticated", error: null });
    } catch {
      tokenStorage.clear();
      set({ user: null, status: "guest", error: null });
    }
  },

  async login(email, password) {
    set({ status: "loading", error: null });
    try {
      const user = await authApi.login(email, password);
      set({ user, status: "authenticated" });
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ??
        e?.response?.data?.non_field_errors?.[0] ??
        "Login failed. Check your credentials.";
      set({ status: "guest", error: msg });
      throw e;
    }
  },

  async register(email, password, name) {
    set({ status: "loading", error: null });
    try {
      const user = await authApi.register(email, password, name);
      set({ user, status: "authenticated" });
    } catch (e: any) {
      const data = e?.response?.data;
      const msg =
        data?.detail ??
        data?.email?.[0] ??
        data?.password?.[0] ??
        "Registration failed.";
      set({ status: "guest", error: msg });
      throw e;
    }
  },

  logout() {
    authApi.logout();
    set({ user: null, status: "guest", error: null });
  },
}));
