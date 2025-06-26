import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Comment } from "../store-utils";
import { toast } from "sonner";

interface CommentState {
  comments: Comment[];
  postComments: Comment[];
  selectedComment: Comment | null;
  isLoading: boolean;
  error: string | null;
  activePostId: string | null;

  fetchComments: () => Promise<void>;
  fetchCommentsByPost: (postId: string) => Promise<void>;
  addComment: (
    postId: string,
    content: string,
    parentId?: string
  ) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  toggleCommentLike: (id: string) => Promise<void>;
  setActivePostId: (postId: string | null) => void;
  getNestedComments: (parentId: string | null) => Comment[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCommentStore = create<CommentState>()(
  devtools(
    (set, get) => ({
      comments: [],
      postComments: [],
      selectedComment: null,
      isLoading: false,
      error: null,
      activePostId: null,

      fetchComments: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/comments");
          if (!response.ok) throw new Error("Yorumlar yüklenemedi");
          const data = await response.json();
          set({ comments: data.comments || [], isLoading: false });
        } catch (error) {
          console.error("Fetch comments error:", error);
          set({ error: "Yorumlar yüklenirken hata oluştu", isLoading: false });
        }
      },

      fetchCommentsByPost: async (postId) => {
        set({ isLoading: true, error: null, activePostId: postId });
        try {
          const response = await fetch(
            `/api/comments?postId=${postId}&limit=50`
          );
          if (!response.ok) throw new Error("Post yorumları yüklenemedi");

          const data = await response.json();
          const comments = data.comments || [];

          // Nested yapıya dönüştür
          const topLevelComments = comments.map((comment: any) => ({
            ...comment,
            replies: comment.replies || [],
          }));

          set({ postComments: topLevelComments, isLoading: false });
        } catch (error) {
          console.error("Fetch post comments error:", error);
          set({
            error: "Post yorumları yüklenirken hata oluştu",
            isLoading: false,
          });
        }
      },

      addComment: async (postId, content, parentId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/comments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content,
              postId,
              parentId,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Yorum eklenemedi");
          }

          const newComment = await response.json();

          // Yorumları yeniden yükle
          const { activePostId, fetchCommentsByPost } = get();
          if (activePostId) {
            await fetchCommentsByPost(activePostId);
          }

          toast.success("Yorum başarıyla eklendi");
          set({ isLoading: false });
        } catch (error: any) {
          console.error("Add comment error:", error);
          const errorMessage = error.message || "Yorum eklenirken hata oluştu";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      deleteComment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/comments/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Yorum silinemedi");
          }

          // Yorumları yeniden yükle
          const { activePostId, fetchCommentsByPost } = get();
          if (activePostId) {
            await fetchCommentsByPost(activePostId);
          }

          toast.success("Yorum başarıyla silindi");
          set({ isLoading: false });
        } catch (error: any) {
          console.error("Delete comment error:", error);
          const errorMessage = error.message || "Yorum silinirken hata oluştu";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      toggleCommentLike: async (id) => {
        try {
          const response = await fetch(`/api/comments/${id}/like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ type: "LIKE" }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Beğeni durumu değiştirilemedi");
          }

          const result = await response.json();

          // Yorumları yeniden yükle
          const { activePostId, fetchCommentsByPost } = get();
          if (activePostId) {
            await fetchCommentsByPost(activePostId);
          }
        } catch (error: any) {
          console.error("Toggle comment like error:", error);
          const errorMessage =
            error.message || "Beğeni durumu değiştirilirken hata oluştu";
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      setActivePostId: (postId) => {
        set({ activePostId: postId });
        if (postId) {
          get().fetchCommentsByPost(postId);
        }
      },

      getNestedComments: (parentId) => {
        const { postComments } = get();
        if (!parentId) return postComments.filter((c) => !c.parentId);
        return postComments.filter((c) => c.parentId === parentId);
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: "comment-store" }
  )
);
