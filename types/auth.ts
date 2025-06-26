// Auth related types
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  image?: string;
  role?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Auth session types
export interface Session {
  user: User;
  token?: string;
  expiresAt?: Date;
}

// Auth actions
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Helper types
export type UserRole = "admin" | "user";

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  username?: string;
}
