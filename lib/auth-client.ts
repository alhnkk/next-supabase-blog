import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [adminClient()],
});

// ✅ Development modunda window'a ekle
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).authClient = authClient;
}
