import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Category } from "../store-utils";

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (category: Category | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
      categories: [],
      selectedCategory: null,
      isLoading: false,
      error: null,

      setCategories: (categories) => set({ categories }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    { name: "category-store" }
  )
);
