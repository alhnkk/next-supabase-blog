"use client";

import { ReactNode, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Apple, Globe, AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSiteSettingsStore } from "@/lib/stores/site-settings-store";
import { useHydration } from "@/hooks/use-hydration";
import Link from "next/link";
import Image from "next/image";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  error?: string;
  isLoading?: boolean;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  description,
  children,
  error,
  isLoading = false,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  const isHydrated = useHydration();
  const { settings, fetchSettings } = useSiteSettingsStore();

  useEffect(() => {
    if (isHydrated) {
      fetchSettings();
    }
  }, [isHydrated, fetchSettings]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-100/10 via-orange-50/10 to-yellow-50/10 p-4">
      <div className="w-[500px]">
        <Card className="bg-white border">
          <CardHeader className="text-center space-y-1">
            <Image
              src={
                isHydrated && settings?.siteLogo
                  ? settings.siteLogo
                  : "/logo.svg"
              }
              alt={
                isHydrated && settings?.siteName
                  ? `${settings.siteName} Logo`
                  : "Blog Logo"
              }
              width={60}
              height={60}
              className="rounded-full aspect-square object-cover border p-1 mx-auto border-b-blue-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/logo.svg";
              }}
            />
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              <h3>{title}</h3>
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm sm:text-base">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-300"
                onClick={() => authClient.signIn.social({ provider: "google" })}
                disabled={isLoading}
              >
                <Globe className="w-5 h-5 mr-2" />
                Google ile {title}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-300"
                disabled
              >
                <Apple className="w-5 h-5 mr-2" />
                Apple ile {title}
                <span className="ml-2 text-xs text-gray-400">(Yakında)</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-400">veya</span>
              </div>
            </div>

            {/* Form Content */}
            {children}
          </CardContent>

          {/* Footer */}
          <CardFooter className="py-4 justify-center">
            <p className="text-sm text-gray-600">
              {footerText}{" "}
              <Link
                href={footerLinkHref}
                className="text-amber-700 hover:text-amber-800 font-semibold hover:underline transition-colors"
              >
                {footerLinkText}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
