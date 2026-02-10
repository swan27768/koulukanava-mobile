import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getToken, setToken, clearToken } from "../storage/token";
import * as AuthApi from "../api/auth";

type User = {
  userId: number;
  email: string;
  role: "user" | "admin";
};

type AuthContextValue = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Käynnistyksessä: lataa token + käyttäjä
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const storedToken = await getToken();

        if (!mounted) return;

        // Ei tokenia → varmasti ulos + ei loading
        if (!storedToken) {
          setTokenState(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Token löytyy → aseta state ja hae /auth/me
        setTokenState(storedToken);

        const me = await AuthApi.fetchMe(); // 🔑 /auth/me
        if (!mounted) return;

        setUser(me);
      } catch (e) {
        // Token voi olla vanha/rikki → tyhjennä ja palaa login-tilaan
        await clearToken();
        if (mounted) {
          setTokenState(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,

      // 🔑 LOGIN
      signIn: async (email: string, password: string) => {
        // 1) login → token
        const res = await AuthApi.login(email, password);
        const accessToken = res.accessToken;

        // 2) tallenna token ja päivitä state
        await setToken(accessToken);
        setTokenState(accessToken);

        // 3) hae user
        try {
          const me = await AuthApi.fetchMe();
          setUser(me);
        } catch {
          // jos me epäonnistuu, token on käytännössä hyödytön → ulos
          await clearToken();
          setTokenState(null);
          setUser(null);
          throw new Error("Failed to fetch user profile");
        }
      },

      // 🚪 LOGOUT
      signOut: async () => {
        await clearToken();
        setTokenState(null);
        setUser(null);
      },
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
