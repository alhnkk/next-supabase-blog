import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export function useBannedUserDetection() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Eğer zaten banned sayfasındaysak kontrol etme
    if (pathname === "/banned") {
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkBannedStatus = async () => {
      try {
        const session = await authClient.getSession();
        
        if (session?.data?.user) {
          const user = session.data.user as any;
          
          // ✅ Banned user kontrolü
          if (user.banned) {
            console.log("🚫 Banned user detected, redirecting to /banned...");
            router.push("/banned");
            
            // Interval'ı temizle
            if (intervalId) {
              clearInterval(intervalId);
            }
          }
        }
      } catch (error) {
        console.error("Banned user check error:", error);
      }
    };

    // İlk kontrol
    checkBannedStatus();
    
    // Her 10 saniyede bir kontrol et
    intervalId = setInterval(checkBannedStatus, 10000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [router, pathname]);
}
