import { getToken } from "../storage/token";

const API_URL = "http://192.168.1.139:3000";

async function authHeaders() {
  const token = await getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const http = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      headers: await authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  },

  async post<T = any>(path: string, body: any): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    return res.json();
  },

  async delete(path: string): Promise<void> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: await authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  },
};
