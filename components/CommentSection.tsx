import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { api } from "../lib/api";

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      setComments(res.data);
    } catch (e) {
      console.log("COMMENT LOAD ERROR", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, { content });

      setContent("");
      loadComments(); // päivitä vain tämä postaus
    } catch (e) {
      console.log("COMMENT CREATE ERROR", e);
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 8 }} />;
  }

  return (
    <View style={{ marginTop: 12 }}>
      {comments.map((c) => (
        <View key={c.id} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600" }}>
            {c.author?.name}
          </Text>
          <Text style={{ fontSize: 13 }}>{c.content}</Text>
        </View>
      ))}

      <View style={{ flexDirection: "row", marginTop: 8 }}>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Kommentoi..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 8,
            padding: 8,
          }}
        />
        <Pressable
          onPress={handleSubmit}
          style={{
            marginLeft: 8,
            backgroundColor: "#2563eb",
            paddingHorizontal: 12,
            justifyContent: "center",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white" }}>Lähetä</Text>
        </Pressable>
      </View>
    </View>
  );
}
