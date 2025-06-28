"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  Crown,
  Star,
  Flame,
} from "lucide-react";
import { calculateReadingTime } from "@/lib/utils/reading-time";

interface Post {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  readingTime?: number;
  _count: {
    views: number;
  };
  category?: {
    name: string;
    color: string;
  };
}

export function MostRead() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostReadPosts = async () => {
      try {
        const res = await fetch("/api/posts/popular?limit=3");

        if (res.ok) {
          const response = await res.json();
          if (response.success && Array.isArray(response.data)) {
            setPosts(response.data);
          } else {
            console.error("API response format hatası:", response);
            setPosts([]);
          }
        } else {
          console.error("Most read posts API yanıtı başarısız");
          setPosts([]);
        }
      } catch (error) {
        console.error("Most read posts yüklenirken hata:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMostReadPosts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">En Çok Okunanlar</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">En Çok Okunanlar</h3>
        </div>
        <div className="text-center text-gray-500 py-6">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Henüz görüntülenen yazı bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">En Çok Okunanlar</h3>
      </div>

      <div className="space-y-3">
        {posts.map((post, index) => (
          <article key={post.id} className="group">
            <Link href={`/post/${post.slug}`} className="block">
              <div className="flex gap-3 items-center p-2 -m-2 rounded-lg hover:bg-gray-50 transition-colors">
                {/* Yuvarlak Fotoğraf */}
                <div className="relative w-12 h-12 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      className="object-cover aspect-square"
                      width={50}
                      height={50}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight mb-1">
                    {post.title}
                  </h4>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span className="font-medium">
                        {(post._count?.views || 0).toLocaleString()} okunma
                      </span>
                    </div>

                    {post.category && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600 font-medium">
                          {post.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ranking Number - Sadece sayı, arkaplan yok */}
                <div className="flex-shrink-0">
                  <span className="text-lg font-bold text-gray-400">
                    {index + 1}
                  </span>
                </div>
              </div>
            </Link>

            {/* Separator */}
            {index < posts.length - 1 && (
              <div className="h-px bg-gray-100 my-3" />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
