import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Tag } from "../store-utils";

interface TagState {
  tags: Tag[];
  selectedTag: Tag | null;
  isLoading: boolean;
  error: string | null;

  fetchTags: () => Promise<void>;
  fetchTag: (id: string) => Promise<void>;
  createTag: (tag: Partial<Tag>) => Promise<void>;
  updateTag: (id: string, tag: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  setSelectedTag: (tag: Tag | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useTagStore = create<TagState>()(
  devtools(
    (set, get) => ({
      tags: [],
      selectedTag: null,
      isLoading: false,
      error: null,

      fetchTags: async () => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const mockTags: Tag[] = [];
          set({ tags: mockTags, isLoading: false });
        } catch {
          set({ error: "Taglar yuklenirken hata olustu", isLoading: false });
        }
      },

      fetchTag: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const tag = get().tags.find((t) => t.id === id);
          set({ selectedTag: tag || null, isLoading: false });
        } catch {
          set({ error: "Tag yuklenirken hata olustu", isLoading: false });
        }
      },

      createTag: async (tagData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch {
          set({ error: "Tag olusturulurken hata olustu", isLoading: false });
        }
      },

      updateTag: async (id, tagData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ isLoading: false });
        } catch {
          set({ error: "Tag guncellenirken hata olustu", isLoading: false });
        }
      },

      deleteTag: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const tags = get().tags.filter((t) => t.id !== id);
          set({ tags, isLoading: false });
        } catch {
          set({ error: "Tag silinirken hata olustu", isLoading: false });
        }
      },

      setSelectedTag: (tag) => set({ selectedTag: tag }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: "tag-store" }
  )
);
