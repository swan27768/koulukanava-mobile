import * as SecureStore from "expo-secure-store";
import { api } from "@/lib/api";

type LoginResponse = {
  access_token: string;
};

export async function login(email: string, password: string): Promise<void> {
  const res = await api.post<LoginResponse>("/auth/login", {
    email,
    password,
  });

  const token = res.data.access_token;

  if (!token) {
    throw new Error("No access_token in response");
  }

  await SecureStore.setItemAsync("token", token);
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync("token");
}
