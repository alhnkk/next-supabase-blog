import { Suspense } from "react";
import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { PostCard } from "@/components/post-card";
import { PostPagination } from "@/components/post-pagination";
import { Sidebar } from "@/components/sidebar";
import PostNotFound from "@/components/post-not-found";



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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Pagination parametreleri
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const postsPerPage = 8;

  let posts: any[] = [];
  let totalPosts = 0;
  let totalPages = 0;

  try {
    const res = await fetch(
      `https://next-supabase-blog-xi.vercel.app/api/posts?page=${currentPage}&limit=${postsPerPage}&isPublished=true`,
      {
        next: { revalidate: 0 }, // 30 dakika cache
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
        { next: { revalidate: 0 } }
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

  if (!Array.isArray(posts) || posts.length === 0) {
    return <PostNotFound />;
  }

  return (
    <div>
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
                      <PostCard key={post.id} post={post} variant="featured" />
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
                      Son Yazılar
                    </Badge>
                    <Separator className="flex-1 max-w-24" />
                  </div>
                <div className="space-y-16">
                  {recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} variant="recent" />
                  ))}
                </div>
              </section>

              {/* Pagination */}
              <div className="pt-8">
                <Suspense>
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
                <Suspense>
                  <Sidebar />
                </Suspense>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
