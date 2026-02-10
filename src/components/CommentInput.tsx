import { View, TextInput, Pressable, Text, Keyboard } from "react-native";
import { useState } from "react";

type Props = {
  onSubmit: (text: string) => Promise<void>;
};

export function CommentInput({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const value = text.trim();
    if (!value || loading) return;

    try {
      setLoading(true);
      await onSubmit(value);
      setText("");
      Keyboard.dismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        marginTop: 12,
        borderTopWidth: 1,
        borderColor: "#e5e7eb",
        paddingTop: 8,
      }}
    >
      <TextInput
        placeholder="Kirjoita kommentti…"
        value={text}
        onChangeText={setText}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          padding: 10,
          minHeight: 40,
          maxHeight: 120,
          marginBottom: 8,
        }}
      />

      <Pressable
        onPress={handleSend}
        disabled={loading || !text.trim()}
        style={{
          alignSelf: "flex-end",
          backgroundColor: loading || !text.trim() ? "#9ca3af" : "#2563eb",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loading ? "Lähetetään…" : "Lähetä"}
        </Text>
      </Pressable>
    </View>
  );
}
