"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ban, Clock, Mail, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BanInfo {
  banReason?: string;
  banExpires?: string;
  name?: string;
  email?: string;
}

export default function BannedPage() {
  const [banInfo, setBanInfo] = useState<BanInfo>({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const session = await authClient.getSession();

        if (!session?.data?.user) {
          // Session yoksa login'e yönlendir
          router.push("/login");
          return;
        }

        const user = session.data.user as any;

        if (!user.banned) {
          // Banned değilse ana sayfaya yönlendir
          router.push("/");
          return;
        }

        // Ban bilgilerini al
        setBanInfo({
          banReason: user.banReason || "Kuralları ihlal etti",
          banExpires: user.banExpires,
          name: user.name,
          email: user.email,
        });
      } catch (error) {
        console.error("Ban status check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkBanStatus();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formatBanExpiry = (banExpires?: string) => {
    if (!banExpires) return "Kalıcı olarak";

    const expiryDate = new Date(banExpires);
    const now = new Date();

    if (expiryDate <= now) {
      return "Süresi dolmuş";
    }

    return `${expiryDate.toLocaleDateString("tr-TR")} tarihine kadar`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">Kontrol ediliyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Ban className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Hesap Askıya Alındı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <Ban className="h-4 w-4" />
            <AlertDescription className="text-sm leading-relaxed">
              <strong>{banInfo.name || "Kullanıcı"}</strong>, hesabınız{" "}
              <strong>{banInfo.banReason}</strong> sebebiyle{" "}
              <strong>{formatBanExpiry(banInfo.banExpires)}</strong> banlandı.
            </AlertDescription>
          </Alert>

          {banInfo.banExpires && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Ban süresi: {formatBanExpiry(banInfo.banExpires)}</span>
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Sorularınız için aşağıdaki e-posta adresi ile iletişime
              geçebilirsiniz:
            </p>

            <div className="flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-600" />
              <a
                href={`mailto:${
                  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                  "support@journalize.com"
                }`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
                  "support@journalize.com"}
              </a>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ban süresi dolduğunda tekrar giriş yapabilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
