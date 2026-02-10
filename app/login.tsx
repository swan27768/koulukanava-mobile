import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

export default function Login() {
  const { token, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔑 Jos token on olemassa → suoraan appiin
  if (token) {
    return <Redirect href="/(app)" />;
  }

  const handleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (e: any) {
      console.log("LOGIN FAILED:", e);
      Alert.alert(
        "Kirjautuminen epäonnistui",
        e?.response?.data?.message ?? "Tarkista sähköposti ja salasana",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Kirjaudu</Text>

      <TextInput
        placeholder="Sähköposti"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
        }}
      />

      <TextInput
        placeholder="Salasana"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
        }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#9ca3af" : "#2563eb",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          {loading ? "Kirjaudutaan…" : "Kirjaudu"}
        </Text>
      </Pressable>
    </View>
  );
}
