import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostPagination } from "@/components/post-pagination";
import { Sidebar } from "@/components/sidebar";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  FileText,
  Eye,
  Heart,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  _count: {
    posts: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  introduction?: string;
  content: string;
  coverImage?: string;
  publishedAt?: string;
  createdAt: string;
  readingTime?: number;
  author?: {
    id: string;
    name: string;
    image?: string;
  };
  _count?: {
    views: number;
    likes: number;
    comments: number;
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const postsPerPage = 12;

  // Kategori bilgilerini al
  let category: Category | null = null;
  let apiError = "";
  try {
    const categoryRes = await fetch(
      `http://localhost:3000/api/categories/${slug}`,
      {
        cache: "no-store",
      }
    );
    if (categoryRes.ok) {
      category = await categoryRes.json();
    } else {
      const errorData = await categoryRes.text();
      apiError = `${categoryRes.status}: ${errorData}`;
      console.error("API Error:", apiError);
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    apiError = String(error);
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-bold text-3xl lg:text-4xl text-foreground">
                Kategori Bulunamadı
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                "{slug}" kategorisi bulunamadı veya mevcut değil.
              </p>
              {apiError && (
                <p className="text-red-500 text-sm">Debug: {apiError}</p>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/categories">Tüm Kategoriler</Link>
              </Button>
              <Button asChild>
                <Link href="/">Ana Sayfa</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kategori postlarını al
  let posts: Post[] = [];
  let totalPosts = 0;
  let totalPages = 0;

  try {
    const postsRes = await fetch(
      `http://localhost:3000/api/posts?categoryId=${category.id}&page=${currentPage}&limit=${postsPerPage}&isPublished=true`,
      { cache: "no-store" }
    );
    const { data, total } = await postsRes.json();

    totalPosts = total || 0;
    totalPages = Math.ceil(totalPosts / postsPerPage);

    posts = (data || []).map((post: Post) => ({
      ...post,
      readingTime: post.readingTime || calculateReadingTime(post.content || ""),
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    posts = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link
            href="/categories"
            className="hover:text-foreground transition-colors"
          >
            Kategoriler
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </div>

        {/* Category Header */}
        <div className="mb-12">
          <div
            className="rounded-2xl p-8 md:p-12 text-white relative overflow-hidden"
            style={{ backgroundColor: category.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20"></div>
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:bg-white/20"
                >
                  <Link href="/categories" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Kategoriler
                  </Link>
                </Button>
              </div>

              <h1 className="font-bold text-4xl lg:text-5xl mb-4">
                {category.name}
              </h1>

              {category.description && (
                <p className="text-white/90 text-lg leading-relaxed max-w-3xl mb-6">
                  {category.description}
                </p>
              )}

              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {totalPosts} yazı
                </Badge>
                <div className="flex items-center gap-1 text-white/80">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">
                    Sayfa {currentPage} / {totalPages || 1}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <main className="lg:col-span-3">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <div className="space-y-4">
                  <h2 className="font-bold text-2xl text-foreground">
                    Bu kategoride henüz yazı yok
                  </h2>
                  <p className="text-muted-foreground">
                    İlk yazıyı paylaşmak için admin panelini kullanabilirsiniz.
                  </p>
                </div>
                <Button asChild className="mt-6">
                  <Link
                    href="/admin/posts/new"
                    className="flex items-center gap-2"
                  >
                    Yazı Ekle
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {posts.map((post) => (
                    <article key={post.id} className="group">
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                        {/* Image */}
                        <div className="aspect-[16/10] overflow-hidden">
                          {post.coverImage ? (
                            <Link href={`/post/${post.slug}`}>
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                width={400}
                                height={250}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </Link>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <FileText className="w-16 h-16 opacity-20" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          <Link href={`/post/${post.slug}`}>
                            <h2 className="font-bold text-xl leading-tight text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                              {post.title}
                            </h2>
                          </Link>

                          <p className="text-slate-600 leading-relaxed line-clamp-3">
                            {post.excerpt ||
                              post.introduction ||
                              "Bu yazıda ilginç konular ele alınıyor..."}
                          </p>

                          {/* Meta Info */}
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
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
                              <Clock className="w-4 h-4" />
                              <span>{post.readingTime || 5} dk</span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{post._count?.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{post._count?.likes || 0}</span>
                              </div>
                            </div>

                            <Link href={`/post/${post.slug}`}>
                              <Button variant="outline" size="sm">
                                Oku
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                <PostPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalPosts={totalPosts}
                  postsPerPage={postsPerPage}
                />
              </>
            )}
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
