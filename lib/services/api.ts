import {
  Post,
  Category,
  Tag,
  PostType,
  PaginatedResponse,
  ApiError,
} from "@/types";
import { supabase } from "../supabaseClient";
import { calculateReadingTime } from "@/lib/utils/reading-time";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// API istek yapılandırması
const defaultHeaders = {
  "Content-Type": "application/json",
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: "Bir hata oluştu",
      status: response.status,
    };

    try {
      const data = await response.json();
      error.message = data.message || error.message;
    } catch {
      error.message = response.statusText;
    }

    throw error;
  }

  return response.json();
}

// Post API servisleri
export const PostService = {
  // Tüm postları getir
  getPosts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: PostType;
    categoryId?: string;
    tagIds?: string[];
    authorId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    isPinned?: boolean;
  }): Promise<PaginatedResponse<Post>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/posts?${queryParams.toString()}`,
      {
        headers: defaultHeaders,
      }
    );

    return handleResponse<PaginatedResponse<Post>>(response);
  },

  // Tekil post getir
  getPost: async (id: string): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      headers: defaultHeaders,
    });

    return handleResponse<Post>(response);
  },

  // Yeni post oluştur
  createPost: async (post: Partial<Post>): Promise<Post> => {
    const now = new Date();
    const isPublished = post.status === "PUBLISHED";
    const readingTime = post.content
      ? calculateReadingTime(post.content)
      : undefined;
    const postData = {
      ...post,
      publishedAt: isPublished ? now.toISOString() : null,
      readingTime,
    };
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(postData),
    });
    return handleResponse<Post>(response);
  },

  // Post güncelle
  updatePost: async (id: string, post: Partial<Post>): Promise<Post> => {
    const isPublished = post.status === "PUBLISHED";
    const readingTime = post.content
      ? calculateReadingTime(post.content)
      : undefined;
    const postData = {
      ...post,
      publishedAt: isPublished
        ? post.publishedAt || new Date().toISOString()
        : null,
      readingTime,
    };
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(postData),
    });
    return handleResponse<Post>(response);
  },

  // Post sil
  deletePost: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    return handleResponse<void>(response);
  },
};

// Kategori API servisleri
export const CategoryService = {
  // Tüm kategorileri getir
  getCategories: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      sortBy?: "name" | "createdAt" | "updatedAt";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<PaginatedResponse<Category>> => {
    const queryParams = new URLSearchParams();

    // Build query parameters
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(
      `${API_BASE_URL}/categories?${queryParams.toString()}`,
      {
        headers: defaultHeaders,
      }
    );

    const result = await handleResponse<any>(response);

    // Handle new API response format
    if (result.success) {
      return {
        data: result.data,
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      };
    } else {
      throw new Error(result.message || "Kategoriler yüklenirken hata oluştu");
    }
  },

  // Tekil kategori getir
  getCategory: async (id: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: defaultHeaders,
    });

    const result = await handleResponse<any>(response);

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || "Kategori yüklenirken hata oluştu");
    }
  },

  // Yeni kategori oluştur
  createCategory: async (category: Partial<Category>): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(category),
    });

    const result = await handleResponse<any>(response);

    if (result.success) {
      return result.data;
    } else {
      // Handle validation errors
      if (result.error === "VALIDATION_ERROR" && result.details) {
        const errorMessages = result.details
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      } else if (result.error === "SLUG_EXISTS") {
        throw new Error(result.message);
      } else {
        throw new Error(
          result.message || "Kategori oluşturulurken hata oluştu"
        );
      }
    }
  },

  // Kategori güncelle
  updateCategory: async (
    id: string,
    category: Partial<Category>
  ): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(category),
    });

    const result = await handleResponse<any>(response);

    if (result.success) {
      return result.data;
    } else {
      // Handle validation errors
      if (result.error === "VALIDATION_ERROR" && result.details) {
        const errorMessages = result.details
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      } else if (result.error === "SLUG_EXISTS") {
        throw new Error(result.message);
      } else if (result.error === "NOT_FOUND") {
        throw new Error("Kategori bulunamadı");
      } else {
        throw new Error(
          result.message || "Kategori güncellenirken hata oluştu"
        );
      }
    }
  },

  // Kategori sil
  deleteCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    const result = await handleResponse<any>(response);

    if (!result.success) {
      if (result.error === "NOT_FOUND") {
        throw new Error("Kategori bulunamadı");
      } else if (result.error === "CATEGORY_HAS_POSTS") {
        throw new Error(result.message);
      } else {
        throw new Error(result.message || "Kategori silinirken hata oluştu");
      }
    }
  },
};

// Tag API servisleri
export const TagService = {
  // Tüm tag'leri getir
  getTags: async (params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Tag>> => {
    const queryParams = new URLSearchParams(params as any);
    const response = await fetch(
      `${API_BASE_URL}/tags?${queryParams.toString()}`,
      {
        headers: defaultHeaders,
      }
    );

    return handleResponse<PaginatedResponse<Tag>>(response);
  },

  // Tekil tag getir
  getTag: async (id: string): Promise<Tag> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      headers: defaultHeaders,
    });

    return handleResponse<Tag>(response);
  },

  // Yeni tag oluştur
  createTag: async (tag: Partial<Tag>): Promise<Tag> => {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(tag),
    });

    return handleResponse<Tag>(response);
  },

  // Tag güncelle
  updateTag: async (id: string, tag: Partial<Tag>): Promise<Tag> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(tag),
    });

    return handleResponse<Tag>(response);
  },

  // Tag sil
  deleteTag: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });

    return handleResponse<void>(response);
  },
};

// Supabase Storage image upload
export async function uploadImageToSupabase(
  file: File,
  folder: string = "images"
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });
  if (error) throw error;
  // Public URL oluştur
  const { publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(fileName).data;
  return publicUrl;
}
