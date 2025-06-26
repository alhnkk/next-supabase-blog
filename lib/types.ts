export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  bio?: string;
  avatar?: string;
  isAdmin: boolean;
  isActive: boolean;
  postCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
  createdAt: string;
  updatedAt: string;
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
  type: PostType;
  readingTime?: number | null;
  wordCount?: number | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  ogDescription?: string | null;
  allowComments: boolean;
  allowLikes: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  authorId: string;
  categoryId: string;
  category?: Category;
  tags?: Tag[];
  author?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: User;
  parentId?: string;
  children?: Comment[];
  likeCount: number;
  dislikeCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  resetPagination: () => void;
}

export interface FilterState<T> {
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  resetFilters: () => void;
}
