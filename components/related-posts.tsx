"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { calculateReadingTime } from "@/lib/utils/reading-time";

interface RelatedPostsProps {
  currentPostId: string;
  categoryId: string;
  categoryName?: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  content: string;
  readingTime?: number;
  category?: {
    name: string;
    color: string;
  };
}

export function RelatedPosts({
  currentPostId,
  categoryId,
  categoryName,
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      try {
        const response = await fetch(
          `/api/posts?categoryId=${categoryId}&limit=3&exclude=${currentPostId}&isPublished=true`
        );
        const { data } = await response.json();
        
        // Okuma süresi hesaplaması
        const postsWithReadingTime = (data || []).map((post: Post) => ({
          ...post,
          readingTime: post.readingTime || calculateReadingTime(post.content || ""),
        }));
        
        setRelatedPosts(postsWithReadingTime);
      } catch (error) {
        console.error("Error fetching related posts:", error);
        setRelatedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchRelatedPosts();
    } else {
      setLoading(false);
    }
  }, [currentPostId, categoryId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-24 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Benzer Yazılar</h2>
          {categoryName && (
            <Badge variant="secondary" className="px-3 py-1">
              {categoryName}
            </Badge>
          )}
        </div>

        <div className="space-y-8">
          {relatedPosts.map((post) => (
            <article key={post.id} className="group">
              <div className="flex gap-6">
                {/* Image */}
                <div className="w-32 h-24 flex-shrink-0">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    {post.coverImage ? (
                      <Link href={`/post/${post.slug}`}>
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          width={128}
                          height={96}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <div className="w-8 h-8 opacity-20">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <Link href={`/post/${post.slug}`}>
                    <h3 className="font-semibold text-lg leading-tight text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {post.excerpt || "Bu yazıda ilginç konular ele alınıyor..."}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(
                          post.publishedAt || post.createdAt
                        ).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readingTime || 5} dk</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View More Button */}
        {categoryId && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href={`/?category=${categoryId}`} className="flex items-center gap-2">
                Kategorideki Tüm Yazılar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
