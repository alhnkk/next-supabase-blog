import { authClient } from "@/lib/auth-client";

// Better Auth Client hook'ları zaten kullanabileceğimiz için
// bu store'u basit bir wrapper olarak tutuyoruz

// User tipi Better Auth ile uyumlu
interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  isActive: boolean;
}

// Helper fonksiyonlar
export const useAuthStore = () => {
  const { data: session, isPending } = authClient.useSession();

  return {
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      username: session.user.email.split('@')[0], // Generate username from email
      role: (session.user as any).role,
      isActive: !(session.user as any).banned,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    } as User : null,
    isAuthenticated: !!session?.user,
    isLoading: isPending,

    // Better Auth metodları
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    signUp: authClient.signUp,
  };
};

// Helper function to check if user is admin
export const useIsAdmin = () => {
  const { user } = useAuthStore();
  return (user as { role?: string })?.role === "admin";
};
