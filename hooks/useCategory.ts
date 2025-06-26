import { useState, useCallback } from "react";
import { Category } from "@/lib/types";

interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export function useCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Önce cache'den kontrol et
      const cachedCategories = localStorage.getItem("categories_cache");
      if (cachedCategories) {
        const parsed = JSON.parse(cachedCategories);
        // 10 dakika cache süresi
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          setCategories(parsed.data);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Kategoriler yüklenirken hata oluştu");
      }
      const result = await response.json();
      const categoriesData = result.success ? result.data : [];
      setCategories(categoriesData);

      // Cache'le
      localStorage.setItem(
        "categories_cache",
        JSON.stringify({
          data: categoriesData,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateCategoryData) => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Kategori oluşturulurken hata oluştu");
      }
      const result = await response.json();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateCategoryData) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Kategori güncellenirken hata oluştu");
      }
      const result = await response.json();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Kategori silinirken hata oluştu");
      }
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    getCategories: fetchCategories,
    create,
    update,
    remove,
  };
}
