import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Post } from "../store-utils";

interface BlogState {
  posts: Post[];
  featuredPosts: Post[];
  isLoading: boolean;
  error: string | null;
  
  setPosts: (posts: Post[]) => void;
  setFeaturedPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>()(
  devtools(
    (set) => ({
      posts: [],
      featuredPosts: [],
      isLoading: false,
      error: null,

      setPosts: (posts) => set({ posts }),
      setFeaturedPosts: (posts) => set({ featuredPosts: posts }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: "blog-store" }
  )
); 