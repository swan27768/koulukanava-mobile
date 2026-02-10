import { api } from "../lib/api";

export type LoginResponse = {
  accessToken: string;
};

export type MeResponse = {
  userId: number;
  email: string;
  role: "user" | "admin";
};

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });
  return res.data;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
}
