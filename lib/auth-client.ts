import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "https://next-supabase-blog-xi.vercel.app/",
  plugins: [adminClient()],
});

// ✅ Development modunda window'a ekle
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).authClient = authClient;
}
