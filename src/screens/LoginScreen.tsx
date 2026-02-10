import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useAuth } from "../auth/AuthContext";

export function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert(
        "Kirjautuminen epäonnistui",
        e?.message ?? "Tuntematon virhe",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Helppari</Text>

      <Text>Sähköposti</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Text>Salasana</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
      />

      <Button
        title={loading ? "Kirjaudutaan..." : "Kirjaudu"}
        onPress={onSubmit}
        disabled={loading}
      />
    </View>
  );
}
