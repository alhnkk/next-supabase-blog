"use client";

import { useState } from "react";
import { Eye, MessageCircle } from "lucide-react";
import { PostLikeButtons } from "./post-like-buttons";

interface DynamicPostStatsProps {
  postSlug: string;
  initialViews?: number;
  initialLikes?: number;
  initialDislikes?: number;
  comments?: number;
}

export function DynamicPostStats({
  postSlug,
  initialViews,
  initialLikes,
  initialDislikes = 0,
  comments,
}: DynamicPostStatsProps) {
  const [viewCount, setViewCount] = useState(initialViews || 0);

  const handleViewCountUpdate = (newCount: number) => {
    setViewCount(newCount);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1 text-gray-500">
        <Eye className="w-4 h-4" />
        <span className="text-sm">{(viewCount || 0).toLocaleString()}</span>
      </div>

      <PostLikeButtons
        postSlug={postSlug}
        initialLikeCount={initialLikes || 0}
        initialDislikeCount={initialDislikes || 0}
        size="sm"
      />

      <div className="flex items-center gap-1 text-gray-500">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">{(comments || 0).toLocaleString()}</span>
      </div>
    </div>
  );
}
