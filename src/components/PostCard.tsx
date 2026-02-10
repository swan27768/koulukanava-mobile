import { View, Text, Pressable, Alert } from "react-native";
import { timeAgo } from "../utils/time";
import { useAuth } from "../auth/AuthContext";
import { deletePost, Post } from "../api/posts";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";
import { useState } from "react";

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{post.title}</Text>

        {user?.userId === post.userId && (
          <Pressable
            onPress={() =>
              Alert.alert("Poista pyyntö", "Haluatko varmasti poistaa tämän?", [
                { text: "Peruuta", style: "cancel" },
                {
                  text: "Poista",
                  style: "destructive",
                  onPress: async () => {
                    await deletePost(post.id);
                  },
                },
              ])
            }
          >
            <Text style={{ fontSize: 16, color: "#dc2626" }}>🗑</Text>
          </Pressable>
        )}
      </View>

      {/* BODY */}
      <Text
        style={{
          color: "#374151",
          fontSize: 14,
          lineHeight: 20,
          marginBottom: 12,
        }}
      >
        {post.body}
      </Text>

      {/* META */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 12, color: "#6b7280" }}>
          {post.user.firstName} · {timeAgo(post.createdAt)}
        </Text>

        <View
          style={{
            backgroundColor: post.type === "offer" ? "#dcfce7" : "#e0f2fe",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: post.type === "offer" ? "#166534" : "#075985",
            }}
          >
            {post.type === "offer" ? "Tarjous" : "Pyyntö"}
          </Text>
        </View>
      </View>

      {/* COMMENTS */}
      <CommentList postId={post.id} refreshKey={refreshKey} />

      {/* COMMENT INPUT */}
      <CommentInput
        onSubmit={async (text) => {
          await createComment(post.id, text);
          setRefreshKey((k) => k + 1);
        }}
      />
    </View>
  );
}
