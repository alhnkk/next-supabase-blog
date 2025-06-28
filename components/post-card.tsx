import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Star, Pin, ArrowUpRight, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { memo } from "react";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    coverImage?: string;
    readingTime?: number;
    publishedAt?: string;
    viewCount?: number;
    author?: { id?: string; name?: string; image?: string };
    category?: { name: string; color: string };
    tags?: { id: string; name: string; color: string }[];
    isFeatured?: boolean;
    isPinned?: boolean;
    _count: {
      likes: number;
      comments: number;
      views: number;
    };
  };
  variant?:
    | "hero"
    | "featured"
    | "standard"
    | "compact"
    | "list"
    | "magazine-large"
    | "magazine-medium"
    | "magazine-wide"
    | "magazine-small"
    | "magazine-horizontal";
  className?: string;
}

// PERFORMANS: Memoized component
const PostCard = memo(function PostCard({
  post,
  variant = "standard",
  className,
}: PostCardProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  // Okuma süresini hesapla (veritabanından gelmiyorsa)
  const readingTime =
    post.readingTime || calculateReadingTime(post.content || "");

  if (isHero) {
    return (
      <Card
        className={cn(
          "relative h-[500px] lg:h-[600px] w-[1200px] overflow-hidden group border-0 shadow-lg",
          className
        )}
      >
        {/* Background Image or Placeholder */}
        <div className="absolute inset-0">
          {post.coverImage && (
            <>
              <Image
                src={post.coverImage}
                alt={post.title}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                quality={75}
                width={1200}
                height={600}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          )}
        </div>

        {/* Content */}
        <CardContent className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end">
          {/* Category Badge */}
          {post.category && (
            <Badge
              className="w-fit mb-4 text-sm font-semibold border-0 px-3 py-1"
              style={{ backgroundColor: post.category.color }}
            >
              {post.category.name}
            </Badge>
          )}

          {/* Title */}
          <Link href={`/post/${post.slug}`} className="group/title">
            <h1 className="text-white font-bold text-3xl lg:text-4xl xl:text-5xl leading-tight mb-4 group-hover/title:text-primary/90 transition-colors duration-300 font-heading">
              {post.title}
            </h1>
          </Link>

          {/* Excerpt */}
          <p className="text-white/90 text-lg lg:text-xl mb-6 line-clamp-2 leading-relaxed max-w-4xl">
            {post.excerpt}
          </p>

          {/* Meta & Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                      })
                    : "Bugün"}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-white/30" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} dk okuma</span>
              </div>
              {post.viewCount && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-4 bg-white/30"
                  />
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card",
        isCompact ? "h-[320px]" : "h-[400px]",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={435}
            height={320}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
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
              <p className="text-gray-500 text-xs font-medium">Fotoğraf Yok</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge on Image */}
        {post.category && (
          <Badge
            className="absolute top-3 left-3 text-xs font-semibold border-0 shadow-lg"
            style={{ backgroundColor: post.category.color }}
          >
            {post.category.name}
          </Badge>
        )}

        {/* Featured/Pinned Indicators */}
        {post.isFeatured && (
          <div className="absolute top-3 right-3">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        )}
        {post.isPinned && (
          <div className="absolute top-3 right-8">
            <Pin className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
        {/* Title */}
        <Link href={`/post/${post.slug}`} className="group/title">
          <h3
            className={cn(
              "font-bold line-clamp-2 mb-3 group-hover/title:text-primary transition-colors duration-300 leading-tight font-heading",
              isCompact ? "text-lg" : "text-xl"
            )}
          >
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {!isCompact && (
          <p className="text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Information */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })
                : "Bugün"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime || 3} dk</span>
          </div>
          {post.viewCount && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <span>{post.viewCount} görüntüleme</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              {post.author?.image && (
                <AvatarImage src={post.author.image} alt={post.author.name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {post.author?.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
              {post.author?.name || "Anonim"}
            </span>
          </div>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
          >
            <Link
              href={`/post/${post.slug}`}
              className="flex items-center gap-1"
            >
              Oku
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export { PostCard };
export default PostCard;
