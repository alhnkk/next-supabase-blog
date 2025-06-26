import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Post } from "../store-utils";

interface PostState {
  posts: Post[];
  selectedPost: Post | null;
  featuredPosts: Post[];
  isLoading: boolean;
  error: string | null;
  
  fetchPosts: () => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (post: Partial<Post>) => Promise<void>;
  updatePost: (id: string, post: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  setSelectedPost: (post: Post | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePostStore = create<PostState>()(
  devtools(
    (set, get) => ({
      posts: [],
      selectedPost: null,
      featuredPosts: [],
      isLoading: false,
      error: null,

      fetchPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const mockPosts: Post[] = [];
          set({ posts: mockPosts, isLoading: false });
        } catch {
          set({ error: "Posts yuklenirken hata olustu", isLoading: false });
        }
      },

      fetchPost: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const post = get().posts.find(p => p.id === id);
          set({ selectedPost: post || null, isLoading: false });
        } catch {
          set({ error: "Post yuklenirken hata olustu", isLoading: false });
        }
      },

      createPost: async (postData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch {
          set({ error: "Post olusturulurken hata olustu", isLoading: false });
        }
      },

      updatePost: async (id, postData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch {
          set({ error: "Post guncellenirken hata olustu", isLoading: false });
        }
      },

      deletePost: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const posts = get().posts.filter(p => p.id !== id);
          set({ posts, isLoading: false });
        } catch {
          set({ error: "Post silinirken hata olustu", isLoading: false });
        }
      },

      setSelectedPost: (post) => set({ selectedPost: post }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: "post-store" }
  )
); 