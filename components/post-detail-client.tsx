"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { ViewTracker } from "@/components/view-tracker";
import { DynamicPostStats } from "@/components/dynamic-post-stats";
import { PostLikeButtons } from "@/components/post-like-buttons";
import { PostSaveButton } from "@/components/post-save-button";
import { PostShareButton } from "@/components/post-share-button";

// Lazy load heavy components
const CommentSection = lazy(() =>
  import("@/components/comments/comment-section").then((module) => ({
    default: module.CommentSection,
  }))
);

const CommentStats = lazy(() =>
  import("@/components/comments/comment-stats").then((module) => ({
    default: module.CommentStats,
  }))
);

const RelatedPosts = lazy(() =>
  import("@/components/related-posts").then((module) => ({
    default: module.RelatedPosts,
  }))
);
import {
  Calendar,
  Clock,
  User,
  Tag,
  Eye,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Tarih formatlama fonksiyonu
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PostDetailClientProps {
  post: any;
  slug: string;
  readingTime: number;
}

export function PostDetailClient({
  post,
  slug,
  readingTime,
}: PostDetailClientProps) {
  // Real-time stats state
  const [stats, setStats] = useState({
    likes: post._count?.likes || 0,
    views: post._count?.views || 0,
    comments: post._count?.comments || 0,
  });

  // Update stats when post data changes
  useEffect(() => {
    setStats({
      likes: post._count?.likes || 0,
      views: post._count?.views || 0,
      comments: post._count?.comments || 0,
    });
  }, [post._count?.likes, post._count?.views, post._count?.comments]);

  // Callback to update likes in real-time
  const handleLikeUpdate = (newLikeCount: number) => {
    setStats((prev) => ({ ...prev, likes: newLikeCount }));
  };

  return (
    <div className="w-full">
      {/* View Tracker */}
      <ViewTracker postSlug={slug} />

      {/* Hero Image */}
      {post.coverImage && (
        <div className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover object-center scale-105 transition-transform duration-700 ease-out"
            priority
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {/* Multi-layered Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto text-white">
              {/* Category Badge */}
              {post.category && (
                <Badge
                  variant="secondary"
                  className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <span className="mr-1 font-semibold">#</span>
                  {post.category.name}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-shadow-lg">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Article Card */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Article Header - Only show if no cover image */}
              {!post.coverImage && (
                <div className="p-8 md:p-12 border-b border-gray-100">
                  {/* Category Badge */}
                  {post.category && (
                    <Badge variant="secondary" className="mb-4">
                      {post.category.name}
                    </Badge>
                  )}

                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-gray-900">
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Article Meta */}
              <div className="p-8 md:p-12 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/user/${post.author?.id}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      {post.author?.image ? (
                        <Image
                          src={post.author.image}
                          alt={post.author.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                          quality={60}
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.author?.name}
                        </p>
                        <p className="text-sm text-gray-500">Yazar</p>
                      </div>
                    </Link>
                  </div>

                  <Separator orientation="vertical" className="h-12" />

                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                  </div>

                  {/* Reading Time */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {readingTime} dk okuma
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="ml-auto">
                    <DynamicPostStats
                      postSlug={slug}
                      initialViews={stats.views}
                      initialLikes={stats.likes}
                      comments={stats.comments}
                    />
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-6">
                    <span className="text-gray-500 font-semibold text-lg">
                      #
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((postTag: any) => (
                        <Badge
                          key={postTag.tag.id}
                          variant="outline"
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {postTag.tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <PostLikeButtons
                    postSlug={slug}
                    initialLikeCount={stats.likes}
                    size="default"
                    onLikeUpdate={handleLikeUpdate}
                  />
                  <PostShareButton
                    post={{
                      title: post.title,
                      slug: post.slug,
                      excerpt: post.excerpt,
                    }}
                    size="sm"
                    variant="outline"
                    showText={false}
                  />
                  <PostSaveButton
                    postSlug={slug}
                    size="sm"
                    variant="outline"
                    showText={false}
                  />
                </div>
              </div>

              {/* Article Content */}
              <div className="p-8 md:p-12">
                <div
                  className="prose prose-lg prose-gray prose-reading-optimized max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Article Footer */}
              <div className="p-8 md:p-12 border-t border-gray-100 bg-gray-50/50">
                {/* Author Bio */}
                <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
                  <Link
                    href={`/user/${post.author?.id}`}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {post.author?.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link
                      href={`/user/${post.author?.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-bold text-lg text-gray-900 mb-1">
                        {post.author?.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {post.author?.bio ||
                        "Bu yazar hakkında henüz bilgi bulunmuyor."}
                    </p>
                  </div>
                </div>

                {/* Action Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                    Makaleyi değerlendir ve paylaş
                  </h3>

                  {/* Main Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    {/* Like Buttons */}
                    <PostLikeButtons
                      postSlug={slug}
                      initialLikeCount={stats.likes}
                      size="default"
                      onLikeUpdate={handleLikeUpdate}
                    />

                    {/* Save Button */}
                    <PostSaveButton
                      postSlug={slug}
                      size="default"
                      variant="outline"
                      showText={true}
                    />

                    {/* Share Button */}
                    <PostShareButton
                      post={{
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                      }}
                      size="default"
                      variant="outline"
                      showText={true}
                    />
                  </div>

                  {/* Stats Display */}
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>
                        {(stats.views || 0).toLocaleString()} görüntülenme
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{(stats.likes || 0).toLocaleString()} beğeni</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {(stats.comments || 0).toLocaleString()} yorum
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Related Posts */}
            <div className="mt-8">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-48 bg-gray-200 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                }
              >
                <RelatedPosts
                  currentPostId={post.id}
                  categoryId={post.categoryId}
                  categoryName={post.category?.name}
                />
              </Suspense>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-gray-200 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                }
              >
                <CommentSection
                  postId={post.id}
                  allowComments={post.allowComments}
                />
              </Suspense>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8">
              <Sidebar />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
