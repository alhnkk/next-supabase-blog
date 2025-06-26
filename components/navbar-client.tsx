"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function NavbarClient() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/"); // Ana sayfaya yönlendir
      router.refresh(); // Sayfayı yenile
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
    >
      Çıkış Yap
    </button>
  );
}
