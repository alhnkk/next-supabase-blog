import { User } from "./auth";

// Enums
export enum PostStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
  ARCHIVED = "ARCHIVED",
}

export enum PostType {
  ARTICLE = "ARTICLE",
  REVIEW = "REVIEW",
  INTERVIEW = "INTERVIEW",
  POETRY = "POETRY",
  SHORT_STORY = "SHORT_STORY",
  ESSAY = "ESSAY",
  OPINION = "OPINION",
  NEWS = "NEWS",
}

export enum LikeType {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

// Core entities
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  introduction?: string | null;
  content: string;
  conclusion?: string | null;
  coverImage?: string | null;
  gallery: string[];
  status: PostStatus;
  postType: PostType;
  type?: PostType;
  readingTime?: number | null;
  wordCount?: number | null;
  publishedAt?: string | Date | null;
  scheduledAt?: string | Date | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  ogDescription?: string | null;
  allowComments: boolean;
  allowLikes: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  isPublished?: boolean;
  authorId: string;
  categoryId: string;
  category?: Category;
  tags?: Tag[];
  author?:
    | Pick<User, "id" | "name" | "email" | "image">
    | {
        id: string;
        name?: string | null;
        email: string;
        image?: string | null;
      };
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: Pick<User, "id" | "name" | "email" | "image">;
  parentId?: string | null;
  replies?: Comment[];
  likeCount: number;
  dislikeCount: number;
  isActive: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Filter types
export interface BlogFilters {
  search: string;
  category: string | null;
  postType: PostType | null;
  tagIds: string[];
  isFeatured: boolean | null;
  sortBy: "createdAt" | "viewCount" | "likeCount" | "commentCount";
  sortOrder: "desc" | "asc";
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
