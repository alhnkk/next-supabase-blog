import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Dynamic base URL based on environment
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Client-side: use current origin
    return window.location.origin;
  }

  // Server-side: use environment variable or fallback
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://next-supabase-blog-xi.vercel.app/"
  );
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [adminClient()],
});

// ✅ Development modunda window'a ekle
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).authClient = authClient;
}
