import { api } from "../../src/lib/api";

/* ---------- Types ---------- */

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  user: {
    id: number;
    firstName: string;
  };
};

/* ---------- Fetch comments ---------- */

export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
}

/* ---------- Create comment ---------- */

export async function createComment(postId: number, body: string) {
  return api.post(`/posts/${postId}/comments`, { body });
}

/* ---------- Delete comment ---------- */

export async function deleteComment(
  postId: number,
  commentId: number,
): Promise<void> {
  await api.delete(`/posts/${postId}/comments/${commentId}`);
}
