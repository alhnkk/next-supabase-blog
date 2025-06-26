// Common state interfaces
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Common actions
export interface LoadingActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  setHasMore: (hasMore: boolean) => void;
  resetPagination: () => void;
}

// Store slice types
export type LoadingSlice = LoadingState & LoadingActions;
export type PaginationSlice = PaginationState & PaginationActions;

// Filter interface
export interface FilterState<T> {
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
}

// API Error type
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Theme types
export type Theme = "light" | "dark" | "system";
