import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Consistent base URL for both client and server
const getBaseURL = () => {
  // Development: localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Production: always use BETTER_AUTH_URL
  return (
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://next-supabase-blog-xi.vercel.app"
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
