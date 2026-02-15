import { useEffect, useState } from "react";
import { createComment, deleteComment, fetchComments } from "./comments.api";

export function useComments(postId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchComments(postId);
      setComments(data);
    } finally {
      setLoading(false);
    }
  }

  async function add(content: string) {
    await createComment(postId, content);
    await load();
  }

  async function remove(commentId: string) {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }

  useEffect(() => {
    load();
  }, [postId]);

  return {
    comments,
    loading,
    addComment: add,
    deleteComment: remove,
    reload: load,
  };
}
