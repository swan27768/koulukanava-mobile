import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, Redirect } from "expo-router";

import { fetchMe, MeResponse } from "../../src/api/auth";
import { useAuth } from "../../src/auth/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { token, isLoading: authLoading, signOut } = useAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // ⏳ Odota auth-tilaa
  if (authLoading) {
    return null;
  }

  // 🔐 EI TOKENIA → LOGIN (älä renderöi mitään muuta)
  if (!token) {
    return <Redirect href="/login" />;
  }

  // 🔹 Hae käyttäjä VAIN jos token on olemassa
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetchMe();
        if (mounted) {
          setMe(res);
        }
      } catch (e) {
        console.error("FETCH ME ERROR:", e);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // ❌ tätä ei pitäisi enää tapahtua, mutta varmistus
  if (!me) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        Profiili
      </Text>

      <Text style={{ marginBottom: 8 }}>📧 {me.email}</Text>
      <Text style={{ marginBottom: 24 }}>👤 Rooli: {me.role}</Text>

      <Pressable
        onPress={async () => {
          await signOut();
          router.replace("/login");
        }}
        style={{
          backgroundColor: "#dc2626",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Kirjaudu ulos
        </Text>
      </Pressable>
    </View>
  );
}
