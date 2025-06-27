import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
  Star,
  Pin,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { cn, getAccessibleBadgeStyles } from "@/lib/utils";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { memo, useMemo } from "react";

// Placeholder images removed - showing "Fotoğraf Yok" message instead

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
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isList = variant === "list";
  const isMagazineLarge = variant === "magazine-large";
  const isMagazineMedium = variant === "magazine-medium";
  const isMagazineWide = variant === "magazine-wide";
  const isMagazineSmall = variant === "magazine-small";
  const isMagazineHorizontal = variant === "magazine-horizontal";

  // Okuma süresini hesapla (veritabanından gelmiyorsa)
  const readingTime =
    post.readingTime || calculateReadingTime(post.content || "");

  // PERFORMANS: Badge stillerini memoize et
  const categoryBadgeStyles = useMemo(() => {
    return post.category ? getAccessibleBadgeStyles(post.category.color) : null;
  }, [post.category?.color]);

  if (isHero) {
    return (
      <Card
        className={cn(
          "relative h-[500px] lg:h-[600px] overflow-hidden group border-0 shadow-lg",
          className
        )}
      >
        {/* Background Image or Placeholder */}
        <div className="absolute inset-0">
          {post.coverImage ? (
            <>
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="100vw"
                priority
                quality={75}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-slate-400 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-slate-600"
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
                <p className="text-slate-600 text-lg font-medium">
                  Fotoğraf Yok
                </p>
              </div>
              {/* Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-end">
          {/* Category Badge */}
          {post.category && categoryBadgeStyles && (
            <Badge
              className="w-fit mb-4 text-sm font-semibold border-0 px-3 py-1"
              style={categoryBadgeStyles}
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

  // List variant - Horizontal layout like the image
  if (isList) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 bg-card mb-6",
          className
        )}
      >
        <div className="flex flex-col">
          {/* Large Image Section */}
          <div className="relative h-64 lg:h-80 overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                quality={75}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-500"
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
                  <p className="text-gray-500 text-sm font-medium">
                    Fotoğraf Yok
                  </p>
                </div>
              </div>
            )}

            {/* Category Badge - Bottom Left */}
            {post.category && categoryBadgeStyles && (
              <Badge
                className="absolute bottom-4 left-4 text-sm font-semibold border-0 shadow-lg px-3 py-1"
                style={categoryBadgeStyles}
              >
                {post.category.name}
              </Badge>
            )}

            {/* Reading Time - Bottom Right */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime || 5} min</span>
            </div>

            {/* Star Icon - Top Right */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-white flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-6 space-y-4">
            {/* Title */}
            <Link href={`/post/${post.slug}`} className="group/title">
              <h2 className="font-bold text-2xl lg:text-3xl line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-tight font-heading">
                {post.title}
              </h2>
            </Link>

            {/* Author & Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>by</span>
              {post.author?.id ? (
                <Link
                  href={`/user/${post.author.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {post.author?.name || "Will Lewis"}
                </Link>
              ) : (
                <span className="font-medium text-foreground">
                  {post.author?.name || "Will Lewis"}
                </span>
              )}
              <span>—</span>
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "5 Years Ago"}
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= 4
                        ? "text-orange-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">4.5/5</span>
            </div>

            {/* Excerpt */}
            <p className="text-muted-foreground leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
              <Button
                asChild
                variant="ghost"
                className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
              >
                <Link href={`/post/${post.slug}`}>— Continue Reading</Link>
              </Button>

              {post.viewCount && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{post.viewCount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (isMagazineLarge) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full bg-card",
          className
        )}
      >
        <div className="relative h-80 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-gray-500"
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
                <p className="text-gray-500 text-base font-medium">
                  Fotoğraf Yok
                </p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Category on image */}
          {post.category && categoryBadgeStyles && (
            <Badge
              className="absolute top-4 left-4 text-xs font-semibold border-0 shadow-lg"
              style={categoryBadgeStyles}
            >
              {post.category.name}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          <Link href={`/post/${post.slug}`} className="group/title">
            <h3 className="font-bold text-xl lg:text-2xl line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-tight font-heading">
              {post.title}
            </h3>
          </Link>

          <p className="text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              {post.author?.id ? (
                <Link
                  href={`/user/${post.author.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-8 h-8">
                    {post.author?.image && (
                      <AvatarImage
                        src={post.author.image}
                        alt={post.author.name}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {post.author?.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {post.author?.name || "Anonim"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{post.readingTime || 5} dk</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <>
                  <Avatar className="w-8 h-8">
                    {post.author?.image && (
                      <AvatarImage
                        src={post.author.image}
                        alt={post.author.name}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {post.author?.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {post.author?.name || "Anonim"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{post.readingTime || 5} dk</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <Link href={`/post/${post.slug}`}>Oku</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMagazineMedium) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 h-full bg-card",
          className
        )}
      >
        <div className="relative h-48 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 25vw"
              quality={85}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-gray-500"
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
                <p className="text-gray-500 text-sm font-medium">
                  Fotoğraf Yok
                </p>
              </div>
            </div>
          )}

          {post.category && categoryBadgeStyles && (
            <Badge
              className="absolute top-3 left-3 text-xs font-semibold border-0 shadow-md"
              style={categoryBadgeStyles}
            >
              {post.category.name}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <Link href={`/post/${post.slug}`} className="group/title">
            <h3 className="font-bold text-lg line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-snug font-heading">
              {post.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{post.readingTime || 3} dk</span>
            <Separator orientation="vertical" className="h-3" />
            {post.author?.id ? (
              <Link
                href={`/user/${post.author.id}`}
                className="hover:text-primary transition-colors"
              >
                {post.author?.name || "Anonim"}
              </Link>
            ) : (
              <span>{post.author?.name || "Anonim"}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMagazineWide) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 h-full bg-card",
          className
        )}
      >
        <div className="flex h-32 lg:h-40">
          <div className="relative w-2/5 overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 40vw, 20vw"
                quality={85}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-gray-500"
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
                  <p className="text-gray-500 text-xs font-medium">
                    Fotoğraf Yok
                  </p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            {post.category && categoryBadgeStyles && (
              <Badge
                className="w-fit text-xs font-semibold border-0 mb-2"
                style={categoryBadgeStyles}
              >
                {post.category.name}
              </Badge>
            )}

            <Link href={`/post/${post.slug}`} className="group/title flex-1">
              <h3 className="font-bold text-base lg:text-lg line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-snug font-heading">
                {post.title}
              </h3>
            </Link>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{post.readingTime || 3} dk</span>
              </div>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
              >
                <Link href={`/post/${post.slug}`}>Oku</Link>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  if (isMagazineSmall) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-500 h-full bg-card",
          className
        )}
      >
        <div className="relative h-32 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
              quality={85}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                <p className="text-gray-500 text-xs font-medium">
                  Fotoğraf Yok
                </p>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          <Link href={`/post/${post.slug}`} className="group/title">
            <h3 className="font-semibold text-sm line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-snug font-heading">
              {post.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readingTime || 2} dk</span>
            </div>
            {post.category && categoryBadgeStyles && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={categoryBadgeStyles}
              >
                {post.category.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMagazineHorizontal) {
    return (
      <Card
        className={cn(
          "group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-500 bg-card",
          className
        )}
      >
        <div className="flex h-24 lg:h-32">
          <div className="relative w-1/3 overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 33vw, 25vw"
                quality={85}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                  <p className="text-gray-500 text-xs font-medium">
                    Fotoğraf Yok
                  </p>
                </div>
              </div>
            )}
          </div>

          <CardContent className="flex-1 p-4 flex flex-col justify-center space-y-2">
            <div className="flex items-center gap-2 mb-1">
              {post.category && categoryBadgeStyles && (
                <Badge
                  className="text-xs font-semibold border-0"
                  style={categoryBadgeStyles}
                >
                  {post.category.name}
                </Badge>
              )}
            </div>

            <Link href={`/post/${post.slug}`} className="group/title">
              <h3 className="font-bold text-base lg:text-lg line-clamp-2 group-hover/title:text-primary transition-colors duration-300 leading-snug font-heading">
                {post.title}
              </h3>
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{post.author?.name || "Anonim"}</span>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime || 3} dk</span>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
              >
                <Link href={`/post/${post.slug}`}>Oku</Link>
              </Button>
            </div>
          </CardContent>
        </div>
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
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
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
        {post.category && categoryBadgeStyles && (
          <Badge
            className="absolute top-3 left-3 text-xs font-semibold border-0 shadow-lg"
            style={categoryBadgeStyles}
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
