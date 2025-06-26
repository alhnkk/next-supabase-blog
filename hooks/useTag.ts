import { useState, useCallback } from "react";
import { Tag } from "@/lib/types";

interface CreateTagData {
  name: string;
  slug: string;
  color?: string;
}

interface UpdateTagData {
  name?: string;
  slug?: string;
  color?: string;
}

export function useTag() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tags");
      if (!response.ok) {
        throw new Error("Etiketler yüklenirken hata oluştu");
      }
      const result = await response.json();
      setTags(result.success ? result.data : []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data: CreateTagData) => {
    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Etiket oluşturulurken hata oluştu");
      }
      const result = await response.json();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const update = useCallback(async (id: string, data: UpdateTagData) => {
    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Etiket güncellenirken hata oluştu");
      }
      const result = await response.json();
      return result;
    } catch (err) {
      throw err;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Etiket silinirken hata oluştu");
      }
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    getTags: fetchTags,
    create,
    update,
    remove,
  };
}
