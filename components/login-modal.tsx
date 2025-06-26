"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Globe, Apple, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister?: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onSwitchToRegister,
}: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email: loginData.email,
        password: loginData.password,
      });

      if (result.error) {
        setError(result.error.message || "Giriş başarısız");
      } else {
        // Modal'ı kapat - session hook otomatik olarak güncellenecek
        onOpenChange(false);
        // Form'u temizle
        setLoginData({ email: "", password: "" });
      }
    } catch (err) {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.social({ provider });
    } catch (err) {
      setError("Sosyal medya girişi başarısız");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md w-full p-0 overflow-hidden"
        overlayVariant="blur"
      >
        <div className="p-6">
          {/* Header */}
          <DialogHeader className="text-center space-y-4 mb-6">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full aspect-square object-cover border p-1 mx-auto border-b-blue-200"
            />
            <DialogTitle className="text-2xl font-bold">Giriş Yap</DialogTitle>
            <p className="text-gray-600 text-sm">
              Hesabınıza giriş yapın ve devam edin.
            </p>
          </DialogHeader>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
            >
              <Globe className="w-5 h-5 mr-2" />
              Google ile Giriş Yap
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300"
              disabled
            >
              <Apple className="w-5 h-5 mr-2" />
              Apple ile Giriş Yap
              <span className="ml-2 text-xs text-gray-400">(Yakında)</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">veya</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                E-posta
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Şifre
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="h-11 pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-amber-700 hover:text-amber-800 font-semibold hover:underline transition-colors"
              >
                Kayıt Ol
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
