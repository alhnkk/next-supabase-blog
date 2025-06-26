// Re-export types for stores
export { PostType, PostStatus } from "@/types/blog";
export type { Post, Category, Tag, Comment } from "@/types/blog";
export type { User } from "@/types/auth";

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
