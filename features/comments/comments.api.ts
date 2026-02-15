import { api } from "../../lib/api";

export async function fetchComments(postId: string) {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
}

export async function createComment(postId: string, content: string) {
  const res = await api.post(`/posts/${postId}/comments`, { content });
  return res.data;
}

export async function deleteComment(commentId: string) {
  const res = await api.patch(`/posts/comments/${commentId}/delete`);
  return res.data;
}
