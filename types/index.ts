// Re-export all types from domain-specific files
export * from "./auth";
export * from "./blog";
export * from "./common";
// Supabase types disabled - export * from "./supabase";

// Type guards
export const isUser = (obj: any): obj is import("./auth").User => {
  return obj && typeof obj.id === "string" && typeof obj.email === "string";
};

export const isPost = (obj: any): obj is import("./blog").Post => {
  return obj && typeof obj.id === "string" && typeof obj.title === "string";
};
