"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletterStore } from "@/lib/stores/newsletter-store";
import { useSiteSettingsStore } from "@/lib/stores/site-settings-store";
import { useHydration } from "@/hooks/use-hydration";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");
  const isHydrated = useHydration();
  const { settings, fetchSettings } = useSiteSettingsStore();
  const { subscribe, isLoading, message, messageType } = useNewsletterStore();

  useEffect(() => {
    if (isHydrated) {
      fetchSettings();
    }
  }, [isHydrated, fetchSettings]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Lütfen e-posta adresinizi girin");
      return;
    }
    await subscribe(email);
    setEmail("");
  };

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold">
              {isHydrated && settings?.siteName ? settings.siteName : "BLOG"}
            </Link>
            <p className="text-muted-foreground">
              {isHydrated && settings?.siteDescription
                ? settings.siteDescription
                : "Modern blog platformu"}
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div className="space-y-4">
            <h3 className="font-semibold">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/hakkimizda"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/yazarlar"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Yazarlar
                </Link>
              </li>
              <li>
                <Link
                  href="/iletisim"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Kategoriler */}
          <div className="space-y-4">
            <h3 className="font-semibold">Kategoriler</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kategori/edebiyat"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edebiyat
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/siir"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Şiir
                </Link>
              </li>
              <li>
                <Link
                  href="/kategori/roman"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Roman
                </Link>
              </li>
            </ul>
          </div>

          {/* Bülten */}
          <div className="space-y-4">
            <h3 className="font-semibold">Bültenimize Katılın</h3>
            <p className="text-muted-foreground text-sm">
              En yeni yazılarımızdan haberdar olmak için bültenimize abone olun.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background"
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Gönderiliyor..." : "Abone Ol"}
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Alt Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            {isHydrated && settings?.siteName ? settings.siteName : "Blog"}. Tüm
            hakları saklıdır.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/gizlilik"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kullanim-kosullari"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
