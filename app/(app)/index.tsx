import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";

import { fetchPosts, deletePost, Post } from "../../src/api/posts";
import { timeAgo } from "../../src/utils/time";
import { useAuth } from "../../src/auth/AuthContext";

import { CommentInput } from "../../src/components/CommentInput";
import { CommentList } from "../../src/components/CommentList";

import { createComment } from "../../features/comments/comments.api";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔑 refreshKey PER POST
  const [commentRefreshKey, setCommentRefreshKey] = useState<
    Record<number, number>
  >({});

  /** 🔄 Lataa feed alusta */
  const reloadFeed = useCallback(async () => {
    try {
      setInitialLoading(true);
      setCursor(null);

      const res = await fetchPosts(undefined);
      setPosts(res.items);
      setCursor(res.nextCursor);
    } catch (e) {
      console.error("RELOAD FEED ERROR:", e);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  /** 🔄 Pull-to-refresh */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await reloadFeed();
    setRefreshing(false);
  }, [reloadFeed]);

  /** 📥 Pagination */
  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;

    setLoading(true);
    try {
      const res = await fetchPosts(cursor);

      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newItems = res.items.filter((p) => !ids.has(p.id));
        return [...prev, ...newItems];
      });

      setCursor(res.nextCursor);
    } catch (e) {
      console.error("FETCH POSTS ERROR:", e);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading]);

  /** 🚀 Ensimmäinen lataus */
  useEffect(() => {
    reloadFeed();
  }, [reloadFeed]);

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ===== HEADER (A3.1) ===== */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: "#f9fafb",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            marginBottom: 12,
          }}
        >
          Naapuriapu
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <Pressable
            onPress={() => router.push("/(app)/create")}
            style={{
              flex: 1,
              backgroundColor: "#2563eb",
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              + Uusi pyyntö
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/(app)/profile")}
            style={{
              paddingHorizontal: 14,
              justifyContent: "center",
              borderRadius: 8,
              backgroundColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 18 }}>👤</Text>
          </Pressable>
        </View>
      </View>
      {/* ===== HEADER END ===== */}

      {posts.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Tämä tila herää eloon, kun joku aloittaa.
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#6b7280",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Ole ensimmäinen ja julkaise viesti naapurustolle.
          </Text>

          <Pressable
            onPress={() => router.push("/(app)/create")}
            style={{
              backgroundColor: "#2563eb",
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Julkaise ensimmäinen viesti
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          extraData={commentRefreshKey}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ paddingBottom: 120 }}
          ListFooterComponent={
            loading ? <ActivityIndicator style={{ margin: 16 }} /> : null
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "white",
                marginHorizontal: 16,
                marginBottom: 16,
                padding: 16,
                borderRadius: 12,
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* OTSIKKO + ROSKAKORI */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.title}
                </Text>

                {user?.userId === item.userId && (
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Poista pyyntö",
                        "Haluatko varmasti poistaa tämän?",
                        [
                          { text: "Peruuta", style: "cancel" },
                          {
                            text: "Poista",
                            style: "destructive",
                            onPress: async () => {
                              await deletePost(item.id);
                              setPosts((prev) =>
                                prev.filter((p) => p.id !== item.id),
                              );
                            },
                          },
                        ],
                      )
                    }
                  >
                    <Text style={{ fontSize: 16, color: "#dc2626" }}>🗑</Text>
                  </Pressable>
                )}
              </View>

              {/* SISÄLTÖ */}
              <Text style={{ color: "#374151", marginBottom: 12 }}>
                {item.body}
              </Text>

              {/* META */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  {item.user.firstName} · {timeAgo(item.createdAt)}
                </Text>

                <View
                  style={{
                    backgroundColor:
                      item.type === "offer" ? "#dcfce7" : "#e0f2fe",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: item.type === "offer" ? "#166534" : "#075985",
                      fontWeight: "600",
                    }}
                  >
                    {item.type === "offer" ? "Tarjous" : "Pyyntö"}
                  </Text>
                </View>
              </View>

              {/* 💬 KOMMENTIT */}
              <CommentList
                key={`${item.id}-${commentRefreshKey[item.id] ?? 0}`}
                postId={item.id}
                refreshKey={commentRefreshKey[item.id]}
                onDeleted={() => {
                  setCommentRefreshKey((prev) => ({
                    ...prev,
                    [item.id]: (prev[item.id] ?? 0) + 1,
                  }));
                }}
              />

              {/* ✍️ KIRJOITA KOMMENTTI */}
              <CommentInput
                onSubmit={async (text) => {
                  try {
                    await createComment(item.id, text);

                    setCommentRefreshKey((prev) => ({
                      ...prev,
                      [item.id]: (prev[item.id] ?? 0) + 1,
                    }));
                  } catch {
                    Alert.alert("Virhe", "Kommentin lähetys epäonnistui");
                  }
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
