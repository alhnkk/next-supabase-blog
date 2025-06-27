import { PostCard } from "@/components/post-card";
import { Suspense, lazy } from "react";
import { SidebarSkeleton } from "@/components/ui/skeleton-loader";

const Sidebar = lazy(() =>
  import("@/components/sidebar").then((module) => ({ default: module.Sidebar }))
);

const PostPagination = lazy(() =>
  import("@/components/post-pagination").then((module) => ({
    default: module.PostPagination,
  }))
);
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  Clock,
  Calendar,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  MessageSquare,
} from "lucide-react";
import { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Ana Sayfa",
  description:
    "JURNALİZE'de en güncel yazıları keşfedin. Teknoloji, yaşam tarzı, kültür ve daha pek çok konuda kaliteli içerikler.",
  openGraph: {
    title: "JURNALİZE - En Güncel Blog Yazıları",
    description:
      "Teknoloji, yaşam tarzı, kültür ve daha pek çok konuda kaliteli içerikler keşfedin.",
    images: ["/og-home.jpg"],
  },
  alternates: {
    canonical: "/",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "JURNALİZE",
  alternateName: "JURNALİZE Blog Platform",
  description: "Modern blog ve içerik paylaşım platformu",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://journalize.vercel.app",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://journalize.vercel.app"
      }/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "JURNALİZE",
    logo: {
      "@type": "ImageObject",
      url: "/logo.png",
    },
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Pagination parametreleri
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const postsPerPage = 9;

  let posts: any[] = [];
  let totalPosts = 0;
  let totalPages = 0;

  try {
    const res = await fetch(
      `https://next-supabase-blog-xi.vercel.app/api/posts?page=${currentPage}&limit=${postsPerPage}&isPublished=true`,
      {
        next: { revalidate: 60 }, // 1 dakika cache
      }
    );
    const { data, total } = await res.json();

    totalPosts = total || 0;
    totalPages = Math.ceil(totalPosts / postsPerPage);

    // Okuma süresi hesaplamasını server tarafında yapmıyorsa client tarafında yapalım
    posts = (data || []).map((post: any) => ({
      ...post,
      readingTime: post.readingTime || calculateReadingTime(post.content || ""),
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    posts = [];
    totalPosts = 0;
    totalPages = 0;
  }

  // Hero post için ayrı mantık
  let heroPost = null;
  if (currentPage === 1) {
    // İlk sayfada: featured post veya ilk post
    heroPost = posts.find((post) => post.isFeatured) || posts[0];
  } else {
    // 2. sayfa ve sonrasında: en son paylaşılan post
    try {
      const heroRes = await fetch(
        `https://next-supabase-blog-xi.vercel.app/api/posts?page=1&limit=1&isPublished=true`,
        { next: { revalidate: 60 } }
      );
      const { data: heroData } = await heroRes.json();
      heroPost = heroData?.[0] || null;
      if (heroPost) {
        heroPost.readingTime =
          heroPost.readingTime || calculateReadingTime(heroPost.content || "");
      }
    } catch (error) {
      console.error("Error fetching hero post:", error);
      heroPost = null;
    }
  }

  // Featured posts (sadece ilk sayfada görünsün)
  const featuredPosts =
    currentPage === 1
      ? posts
          .filter((post) => post.isFeatured && post.id !== heroPost?.id)
          .slice(0, 3)
      : [];

  // Recent posts (hero ve featured posts hariç tüm postlar)
  const featuredPostIds = Array.isArray(featuredPosts)
    ? featuredPosts.map((post) => post.id)
    : [];
  const recentPosts = Array.isArray(posts)
    ? posts.filter(
        (post) => post.id !== heroPost?.id && !featuredPostIds.includes(post.id)
      )
    : [];

  // Trending posts (gerçek view sayılarına göre)
  const trendingPosts = Array.isArray(posts)
    ? posts
        .sort((a, b) => (b._count?.views || 0) - (a._count?.views || 0))
        .slice(0, 4)
    : [];

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="font-bold text-3xl lg:text-4xl text-foreground">
                Henüz Hiç Yazı Yok
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                İlk yazıyı eklemek için admin panelini kullanın ve içerik
                oluşturmaya başlayın.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="px-8 py-3 font-semibold shadow-lg"
            >
              <Link href="/admin" className="flex items-center gap-2">
                Admin Panel
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Critical Image Preload */}
      {heroPost?.coverImage && (
        <link
          rel="preload"
          as="image"
          href={heroPost.coverImage}
          imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          fetchPriority="high"
        />
      )}

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-8 space-y-12">
          {/* Hero Section */}
          {heroPost && (
            <section className="animate-in">
              <PostCard post={heroPost} variant="hero" />
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-3 space-y-12">
              {/* Editor's Picks - Featured Posts */}
              {Array.isArray(featuredPosts) && featuredPosts.length > 0 && (
                <section className="animate-in space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Öne Çıkanlar
                    </Badge>
                    <Separator className="flex-1 max-w-24" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {featuredPosts.map((post) => (
                      <article key={post.id} className="group">
                        {/* Image Container */}
                        <div className="aspect-[4/3] mb-6 overflow-hidden rounded-lg bg-slate-100">
                          {post.coverImage ? (
                            <Image
                              width={500}
                              height={500}
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              quality={85}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-3 bg-slate-300 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-8 h-8 text-slate-500"
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
                                <p className="text-slate-500 text-sm font-medium">
                                  Fotoğraf Yok
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <Link href={`/post/${post.slug}`}>
                            <h3 className="font-semibold text-lg leading-tight text-slate-800 group-hover:text-slate-600 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                            {post.excerpt ||
                              post.introduction ||
                              "Bu yazıda ilginç konular ele alınıyor..."}
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
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{post.readingTime || 5} dk okuma</span>
                            </div>
                          </div>

                          {/* Read More Button */}
                          <Link href={`/post/${post.slug}`} className="pt-2">
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                            >
                              DEVAMINI OKU
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Posts - Large Hero Cards */}
              <section className="animate-in space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Güncel İçerik
                  </Badge>
                  <Separator className="flex-1 w-full" />
                </div>

                <div className="space-y-16">
                  {recentPosts.map((post) => (
                    <article key={post.id} className="group">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                        {/* Content - Left Side */}
                        <div className="space-y-4 order-2 lg:order-1">
                          <Link href={`/post/${post.slug}`}>
                            <h2 className="font-bold text-2xl lg:text-3xl line-clamp-2 leading-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                              {post.title}
                            </h2>
                          </Link>
                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                            <span>
                              {new Date(
                                post.publishedAt || post.createdAt
                              ).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                            <span>•</span>
                            {post.category && (
                              <>
                                <Badge
                                  className="text-xs font-semibold border-0"
                                  style={{
                                    backgroundColor: post.category.color,
                                  }}
                                >
                                  {post.category.name}
                                </Badge>
                                <span>•</span>
                              </>
                            )}
                            <span>{post.readingTime || 5} dk okuma</span>
                          </div>

                          {/* Excerpt */}
                          <p className="text-slate-600 text-base leading-relaxed line-clamp-3">
                            {post.excerpt ||
                              post.introduction ||
                              "Bu yazıda güncel ve ilginç konular ele alınarak, okuyucuların düşünce dünyasını zenginleştiren içerikler sunuluyor. Yazının detaylarını keşfetmek için devamını okuyun."}
                          </p>

                          {/* Read More Button */}
                          <Link href={`/post/${post.slug}`} className="pt-2">
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                            >
                              DEVAMINI OKU
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        {/* Image - Right Side */}
                        <div className="order-1 lg:order-2">
                          <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 shadow-sm">
                            {post.coverImage ? (
                              <Link href={`/post/${post.slug}`}>
                                <Image
                                  width={500}
                                  height={500}
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </Link>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                <div className="w-24 h-24 opacity-20">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {/* Pagination */}
              <div className="pt-8">
                <Suspense
                  fallback={
                    <div className="h-16 animate-pulse bg-gray-100 rounded-lg" />
                  }
                >
                  <PostPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalPosts={totalPosts}
                    postsPerPage={postsPerPage}
                  />
                </Suspense>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <Suspense fallback={<SidebarSkeleton />}>
                  <Sidebar />
                </Suspense>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
