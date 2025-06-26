import { useCallback } from "react";
import { Post } from "../types";
import { usePostStore } from "../lib/stores/post-store";

export const usePost = (postId?: string) => {
  const {
    selectedPost,
    isLoading,
    error,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    setSelectedPost,
  } = usePostStore();

  // Seçili post'u getir
  const getPost = useCallback(async () => {
    if (!postId) return;
    await fetchPost(postId);
  }, [postId, fetchPost]);

  // Yeni post oluştur
  const create = useCallback(
    async (data: Partial<Post>) => {
      const post = await createPost(data);
      return post;
    },
    [createPost]
  );

  // Post güncelle
  const update = useCallback(
    async (data: Partial<Post>) => {
      if (!postId) return;
      const post = await updatePost(postId, data);
      return post;
    },
    [postId, updatePost]
  );

  // Post sil
  const remove = useCallback(async () => {
    if (!postId) return;
    await deletePost(postId);
    setSelectedPost(null);
  }, [postId, deletePost, setSelectedPost]);

  return {
    post: selectedPost,
    isLoading,
    error,
    getPost,
    create,
    update,
    remove,
  };
};
