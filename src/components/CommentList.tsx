import { View, Text, ActivityIndicator, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import {
  fetchComments,
  deleteComment,
  Comment, // ✅ TÄMÄ PUUTTUI
} from "../../features/comments/comments.api";

import { timeAgo } from "../utils/time";
import { useAuth } from "../auth/AuthContext";

type Props = {
  postId: number;
  refreshKey?: number;
};

export function CommentList({ postId, refreshKey }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchComments(postId)
      .then((data) => {
        if (mounted) setComments(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [postId, refreshKey]);

  if (loading) {
    return <ActivityIndicator style={{ marginVertical: 8 }} />;
  }

  if (comments.length === 0) {
    return (
      <Text
        style={{
          fontSize: 13,
          color: "#6b7280",
          marginBottom: 8,
          fontStyle: "italic",
        }}
      >
        Ole ensimmäinen, joka kommentoi 👋
      </Text>
    );
  }

  return (
    <View style={{ marginBottom: 8 }}>
      {comments.map((c) => {
        const canDelete =
          user && (user.userId === c.user.id || user.role === "admin");

        return (
          <View
            key={c.id}
            style={{
              marginBottom: 8,
              padding: 8,
              backgroundColor: "#f9fafb",
              borderRadius: 8,
            }}
          >
            {/* YLÄRIVI */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 13 }}>
                {c.user.firstName}
              </Text>

              {canDelete && (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Poista kommentti",
                      "Haluatko varmasti poistaa tämän kommentin?",
                      [
                        { text: "Peruuta", style: "cancel" },
                        {
                          text: "Poista",
                          style: "destructive",
                          onPress: async () => {
                            try {
                              await deleteComment(postId, c.id);
                              setComments((prev) =>
                                prev.filter((x) => x.id !== c.id),
                              );
                            } catch {
                              Alert.alert(
                                "Virhe",
                                "Kommentin poisto epäonnistui",
                              );
                            }
                          },
                        },
                      ],
                    )
                  }
                >
                  <Text style={{ color: "#dc2626", fontSize: 14 }}>🗑</Text>
                </Pressable>
              )}
            </View>

            {/* SISÄLTÖ */}
            <Text style={{ fontSize: 13, lineHeight: 18 }}>{c.body}</Text>

            {/* AIKA */}
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {timeAgo(c.createdAt)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
