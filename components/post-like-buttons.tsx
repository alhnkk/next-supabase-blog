"use client";

import { useState, useEffect } from "react";
import { Heart, ThumbsDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostLikeButtonsProps {
  postSlug: string;
  initialLikeCount?: number;
  initialDislikeCount?: number;
  className?: string;
  size?: "sm" | "default" | "lg";
  onLikeUpdate?: (likeCount: number) => void;
}

export function PostLikeButtons({
  postSlug,
  initialLikeCount = 0,
  initialDislikeCount = 0,
  className,
  size = "default",
  onLikeUpdate,
}: PostLikeButtonsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sayfa yüklendiğinde mevcut durumu al
  useEffect(() => {
    if (!postSlug) {
      setIsInitialized(true);
      return;
    }

    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postSlug}/like`);
        if (response.ok) {
          const data = await response.json();
          setLikeCount(data.likeCount || 0);
          setDislikeCount(data.dislikeCount || 0);
          setUserReaction(data.userReaction || null);
        }
      } catch (error) {
        console.error("Beğeni durumu yüklenirken hata:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchLikeStatus();
  }, [postSlug]);

  const handleLike = async (type: "LIKE" | "DISLIKE") => {
    if (isLoading || !postSlug) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert("Beğenmek için giriş yapmalısınız");
        } else {
          alert(data.error || "Bir hata oluştu");
        }
        return;
      }

      if (data.success) {
        setLikeCount(data.likeCount || 0);
        setDislikeCount(data.dislikeCount || 0);
        setUserReaction(data.userReaction || null);

        // Notify parent component about like count update
        if (onLikeUpdate) {
          onLikeUpdate(data.likeCount || 0);
        }
      }
    } catch (error) {
      console.error("Beğeni işlemi hatası:", error);
      alert("Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";
  const iconSize =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  if (!isInitialized) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-20 h-9 bg-gray-200 animate-pulse rounded" />
        <div className="w-20 h-9 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Like Button */}
      <Button
        variant={userReaction === "LIKE" ? "default" : "outline"}
        size={buttonSize}
        onClick={() => handleLike("LIKE")}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200 gap-2",
          userReaction === "LIKE" && "bg-red-500 hover:bg-red-600 text-white"
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSize, "animate-spin")} />
        ) : (
          <Heart
            className={cn(iconSize, userReaction === "LIKE" && "fill-current")}
          />
        )}
        <span className="font-medium">{(likeCount || 0).toLocaleString()}</span>
      </Button>

      {/* Dislike Button */}
      <Button
        variant={userReaction === "DISLIKE" ? "default" : "outline"}
        size={buttonSize}
        onClick={() => handleLike("DISLIKE")}
        disabled={isLoading}
        className={cn(
          "transition-all duration-200 gap-2",
          userReaction === "DISLIKE" &&
            "bg-gray-600 hover:bg-gray-700 text-white"
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSize, "animate-spin")} />
        ) : (
          <ThumbsDown
            className={cn(
              iconSize,
              userReaction === "DISLIKE" && "fill-current"
            )}
          />
        )}
        <span className="font-medium">
          {(dislikeCount || 0).toLocaleString()}
        </span>
      </Button>
    </div>
  );
}
