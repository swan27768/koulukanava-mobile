import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../../src/lib/api";

export default function CreatePost() {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) {
      Alert.alert("Virhe", "Kirjoita viesti");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Hae GENERAL-tiimi
      const teamsRes = await api.get("/teams");
      const general = teamsRes.data.find((t: any) => t.isGeneral);

      if (!general) {
        Alert.alert("Virhe", "GENERAL-tiimiä ei löytynyt");
        return;
      }

      // 2️⃣ Julkaise viesti
      await api.post(`/teams/${general.id}/posts`, {
        content,
      });

      router.back(); // palaa feediin
    } catch (e) {
      console.log(e);
      Alert.alert("Virhe", "Julkaisu epäonnistui");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16 }}>
        Uusi viesti
      </Text>

      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Kirjoita tiedote..."
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 8,
          padding: 12,
          minHeight: 120,
          marginBottom: 16,
          textAlignVertical: "top",
        }}
      />

      <Pressable
        onPress={handleSubmit}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600" }}>Julkaise</Text>
        )}
      </Pressable>
    </View>
  );
}
