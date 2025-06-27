"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/auth-card";
import { Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Giriş başarısız");
      } else {
        console.log("✅ Login successful, redirecting to:", redirectUrl || "/");
        // Redirect parameter varsa oraya, yoksa ana sayfaya git
        window.location.href = redirectUrl || "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Giriş Yap"
      description="Devam etmek için giriş yapın."
      error={error}
      isLoading={isLoading}
      footerText="Hesabın yok mu?"
      footerLinkText="Kayıt Ol"
      footerLinkHref="/register"
    >
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-posta
          </Label>
          <div className="relative">
            <Mail className="input-icon" />
            <Input
              id="email"
              type="email"
              placeholder="ornek@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 input-with-icon"
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
            <Lock className="input-icon" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 input-with-icon"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11"
          variant={isLoading ? "outline" : "default"}
          disabled={isLoading}
        >
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
    </AuthCard>
  );
}
