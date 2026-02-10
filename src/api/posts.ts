import { api } from "../lib/api";

/* ---------- Types ---------- */

export type Post = {
  id: number;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  user: {
    firstName: string;
  };
};

export type PostsResponse = {
  items: Post[];
  nextCursor: string | null;
};

/* ---------- Fetch feed ---------- */

export async function fetchPosts(cursor?: string): Promise<PostsResponse> {
  const res = await api.get<PostsResponse>("/posts", {
    params: cursor ? { cursor } : undefined,
  });

  return res.data;
}

/* ---------- Create post ---------- */

export async function createPost(input: {
  title: string;
  body: string;
  type: string;
}): Promise<Post> {
  const res = await api.post<Post>("/posts", input);
  return res.data;
}

/* ---------- Delete post ---------- */

export async function deletePost(postId: number): Promise<void> {
  await api.delete(`/posts/${postId}`);
}
