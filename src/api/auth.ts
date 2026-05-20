import { api, tokenStorage } from "./client";

export interface User {
  id: number;
  email: string;
  name: string;
  display_name: string;
  date_joined: string;
  is_staff: boolean;
}

interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<AuthResponse>("/api/auth/login/", { email, password });
  tokenStorage.set(data.access, data.refresh);
  return data.user;
}

export async function register(email: string, password: string, name: string): Promise<User> {
  const { data } = await api.post<AuthResponse>("/api/auth/register/", { email, password, name });
  tokenStorage.set(data.access, data.refresh);
  return data.user;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/api/auth/me/");
  return data;
}

export function logout(): void {
  tokenStorage.clear();
}
