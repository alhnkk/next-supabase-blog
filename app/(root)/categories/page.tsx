import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, FileText, ArrowRight, Grid3X3 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  _count: {
    posts: number;
  };
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    coverImage?: string;
    publishedAt?: string;
    createdAt: string;
  }>;
}

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const res = await fetch(
      `http://localhost:3000/api/categories?includePosts=true`,
      {
        cache: "no-store",
      }
    );
    const response = await res.json();
    categories = response.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    categories = [];
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-bold text-3xl lg:text-4xl text-foreground">
                Henüz Kategori Yok
              </h1>
              <p className="text-muted-foreground text-lg mx-auto">
                İlk kategoriyi eklemek için admin panelini kullanın.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="px-8 py-3 font-semibold shadow-lg"
            >
              <Link
                href="/admin/categories"
                className="flex items-center gap-2"
              >
                Kategori Ekle
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-3">
            <h1 className="font-bold text-4xl lg:text-5xl text-foreground">
              Kategoriler
            </h1>
            <p className="text-muted-foreground text-lg mx-auto">
              İlgi alanınıza göre yazıları keşfedin. Her kategoride size uygun
              içerikler sizi bekliyor.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Grid3X3 className="w-4 h-4" />
              <span>{categories.length} kategori</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>
                {categories.reduce((sum, cat) => sum + cat._count.posts, 0)}{" "}
                yazı
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <article key={category.id} className="group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                {/* Category Header */}
                <div
                  className="p-6 text-white relative overflow-hidden"
                  style={{ backgroundColor: category.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20"></div>
                  <div className="relative">
                    <h2 className="font-bold text-2xl mb-2">{category.name}</h2>
                    {category.description && (
                      <p className="text-white/90 text-sm leading-relaxed">
                        {category.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30"
                      >
                        {category._count.posts} yazı
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Recent Posts Preview */}
                {category.posts && category.posts.length > 0 && (
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4 text-gray-900">
                      Son Yazılar
                    </h3>
                    <div className="space-y-4">
                      {category.posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="group/post">
                          <Link href={`/post/${post.slug}`}>
                            <div className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              {/* Thumbnail */}
                              <div className="w-16 h-12 flex-shrink-0">
                                {post.coverImage ? (
                                  <Image
                                    src={post.coverImage}
                                    alt={post.title}
                                    width={64}
                                    height={48}
                                    className="w-full h-full object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 group-hover/post:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                  {post.title}
                                </h4>
                                <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {new Date(
                                      post.publishedAt || post.createdAt
                                    ).toLocaleDateString("tr-TR", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Footer */}
                <div className="px-6 pb-6">
                  <Separator className="mb-4" />
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-gray-50"
                  >
                    <Link
                      href={`/categories/${category.slug}`}
                      className="flex items-center justify-center gap-2"
                    >
                      Tüm Yazıları Gör
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Popular Categories Section */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="font-bold text-2xl text-foreground mb-2">
              En Popüler Kategoriler
            </h2>
            <p className="text-muted-foreground">
              En çok yazı içeren kategoriler
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories
              .sort((a, b) => b._count.posts - a._count.posts)
              .slice(0, 8)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <div className="text-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {category._count.posts} yazı
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
