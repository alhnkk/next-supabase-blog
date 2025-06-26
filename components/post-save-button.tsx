"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface PostSaveButtonProps {
  postSlug: string;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "default" | "ghost";
  showText?: boolean;
}

export function PostSaveButton({
  postSlug,
  size = "sm",
  variant = "outline",
  showText = true,
}: PostSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auth durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        setIsAuthenticated(!!session?.data?.user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Post'un kayıtlı olup olmadığını kontrol et
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await fetch(`/api/posts/${postSlug}/save`);
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Kayıt durumu kontrol edilemedi:", error);
      }
    };

    checkSavedStatus();
  }, [postSlug, isAuthenticated]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Kaydetmek için giriş yapmalısınız");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postSlug}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.action === "saved");
        toast.success(data.message);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Kaydetme işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Kaydetme işlemi sırasında bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isLoading ? Loader2 : isSaved ? BookmarkCheck : Bookmark;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSave}
      disabled={isLoading}
      className={`gap-2 ${
        isSaved
          ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
          : ""
      }`}
      title={
        isAuthenticated
          ? isSaved
            ? "Kayıtlardan çıkar"
            : "Kaydet"
          : "Kaydetmek için giriş yapın"
      }
    >
      <Icon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
      {showText && (isSaved ? "Kaydedildi" : "Kaydet")}
    </Button>
  );
}
