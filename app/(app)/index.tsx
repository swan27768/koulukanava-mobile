import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "../../src/auth/AuthContext";
import { api } from "../../src/lib/api";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();

  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      loadInitial();
    }, []),
  );

  async function loadInitial() {
    try {
      setLoading(true);

      const teamsRes = await api.get("/teams");
      const general = teamsRes.data.find((t: any) => t.isGeneral);
      if (!general) return;

      const res = await api.get(`/teams/${general.id}/posts?limit=10`);

      const enriched = res.data.items.map((p: any) => ({
        ...p,
        comments: [],
        commentsLoading: true,
        newComment: "",
      }));

      setPosts(enriched);
      setCursor(res.data.nextCursor);

      enriched.forEach((post: any) => {
        loadComments(post.id);
      });
    } catch (e) {
      console.log("LOAD ERROR", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!cursor || loadingMore) return;

    try {
      setLoadingMore(true);

      const teamsRes = await api.get("/teams");
      const general = teamsRes.data.find((t: any) => t.isGeneral);
      if (!general) return;

      const res = await api.get(
        `/teams/${general.id}/posts?cursor=${cursor}&limit=10`,
      );

      const enriched = res.data.items.map((p: any) => ({
        ...p,
        comments: [],
        commentsLoading: true,
        newComment: "",
      }));

      setPosts((prev) => [...prev, ...enriched]);
      setCursor(res.data.nextCursor);

      enriched.forEach((post: any) => {
        loadComments(post.id);
      });
    } catch (e) {
      console.log("LOAD MORE ERROR", e);
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadComments(postId: string) {
    try {
      const res = await api.get(`/posts/${postId}/comments`);

      // 🔒 Varmistetaan että comments on aina array
      const commentsArray = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ?? []);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: commentsArray, commentsLoading: false }
            : p,
        ),
      );
    } catch (e) {
      console.log("COMMENT LOAD ERROR", e);
    }
  }

  async function addComment(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (!post?.newComment.trim()) return;

    try {
      await api.post(`/posts/${postId}/comments`, {
        content: post.newComment,
      });

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, newComment: "" } : p)),
      );

      loadComments(postId);
    } catch (e) {
      console.log("COMMENT CREATE ERROR", e);
    }
  }
  async function deletePost(postId: string) {
    Alert.alert(
      "Poista viesti",
      "Haluatko varmasti poistaa tämän viestiketjun?",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
              await api.patch(`/teams/posts/${postId}/delete`);

              setPosts((prev) => prev.filter((p) => p.id !== postId));
            } catch (e) {
              console.log("POST DELETE ERROR", e);
            }
          },
        },
      ],
    );
  }

  function confirmDelete(commentId: string, postId: string) {
    Alert.alert(
      "Poista kommentti",
      "Haluatko varmasti poistaa tämän kommentin?",
      [
        {
          text: "Peruuta",
          style: "cancel",
        },
        {
          text: "Poista",
          style: "destructive",
          onPress: () => deleteComment(commentId, postId),
        },
      ],
      { cancelable: true },
    );
  }

  async function deleteComment(commentId: string, postId: string) {
    try {
      await api.patch(`/posts/comments/${commentId}/delete`);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: p.comments.filter((c: any) => c.id !== commentId),
              }
            : p,
        ),
      );
    } catch (e) {
      console.log("COMMENT DELETE ERROR", e);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        Koulukanava
      </Text>

      <Pressable
        onPress={() => router.push("/(app)/create")}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          marginBottom: 16,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>+ Uusi viesti</Text>
      </Pressable>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: "white",
              padding: 16,
              marginBottom: 12,
              borderRadius: 10,
            }}
          >
            {item.pinned && (
              <Text style={{ color: "#2563eb", fontWeight: "600" }}>
                📌 Kiinnitetty
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 6, flex: 1 }}>
                {item.content}
              </Text>

              {user?.role === "ADMIN" && (
                <Pressable
                  onPress={() => deletePost(item.id)}
                  style={{ marginLeft: 8 }}
                >
                  <Text style={{ color: "#dc2626", fontSize: 16 }}>🗑</Text>
                </Pressable>
              )}
            </View>

            <Text style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
              {item.author?.name ?? "Unknown"} · {item.comments?.length ?? 0}{" "}
              kommenttia
            </Text>

            {item.commentsLoading ? (
              <ActivityIndicator />
            ) : (
              (item.comments ?? []).map((c: any) => (
                <View
                  key={c.id}
                  style={{
                    marginBottom: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 13 }}>
                      {c.author?.name}
                    </Text>
                    <Text style={{ fontSize: 13 }}>{c.content}</Text>
                  </View>

                  {/* 🗑 ROSKAKORI */}
                  {(user?.role === "ADMIN" || user?.id === c.authorId) && (
                    <Pressable
                      onPress={() => confirmDelete(c.id, item.id)}
                      style={{
                        marginLeft: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                      }}
                    >
                      <Text style={{ fontSize: 16, color: "#dc2626" }}>🗑</Text>
                    </Pressable>
                  )}
                </View>
              ))
            )}

            <View style={{ flexDirection: "row", marginTop: 8 }}>
              <TextInput
                value={item.newComment}
                onChangeText={(text) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === item.id ? { ...p, newComment: text } : p,
                    ),
                  )
                }
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
                onPress={() => addComment(item.id)}
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
        )}
      />
    </View>
  );
}
