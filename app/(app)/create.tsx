import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { createPost } from "../../src/api/posts";

export default function CreatePost() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !body) {
      Alert.alert("Täytä kaikki kentät");
      return;
    }

    setLoading(true);
    try {
      await createPost({
        title,
        body,
        type: "help",
      });

      Alert.alert("Pyyntö luotu");
      router.replace("/(app)");
    } catch (err: any) {
      console.error("CREATE POST ERROR:", err);
      Alert.alert("Virhe", "Pyynnön luonti epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "white" }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Luo uusi pyyntö</Text>

      <TextInput
        placeholder="Otsikko"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <TextInput
        placeholder="Kuvaus"
        value={body}
        onChangeText={setBody}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 12,
          height: 120,
          marginBottom: 20,
          borderRadius: 6,
          textAlignVertical: "top",
        }}
      />

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 14,
          borderRadius: 6,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          {loading ? "Julkaistaan..." : "Julkaise"}
        </Text>
      </Pressable>
    </View>
  );
}
