"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  BookOpen,
  FileText,
  Clock,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Upload,
  Download,
  Newspaper,
  RefreshCw,
  Star,
  CheckSquare,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED" | "REVIEW" | "SCHEDULED";
  isFeatured: boolean;
  allowComments: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  _count: {
    views: number;
    likes: number;
    comments: number;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
  _count: {
    posts: number;
  };
}

interface Author {
  id: string;
  name: string;
  email: string;
  _count: {
    posts: number;
  };
}

interface PostsManagementProps {
  className?: string;
}

export function PostsManagement({ className }: PostsManagementProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter options
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  // Stats
  const [stats, setStats] = useState({
    DRAFT: 0,
    PUBLISHED: 0,
    REVIEW: 0,
    SCHEDULED: 0,
  });

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(authorFilter !== "all" && { author: authorFilter }),
        ...(featuredFilter !== "all" && { featured: featuredFilter }),
      });

      const response = await fetch(`/api/admin/posts?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setPosts(result.data);
        setTotalPages(result.meta.totalPages);
        setTotalCount(result.meta.totalCount);
        setCategories(result.filters.categories);
        setAuthors(result.filters.authors);
        setStats(result.stats);
      } else {
        throw new Error(result.error || "Post'lar alınamadı");
      }
    } catch (error) {
      console.error("Posts fetch error:", error);
      toast.error("Post'lar yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    categoryFilter,
    authorFilter,
    featuredFilter,
  ]);

  const handleBulkAction = async (action: string) => {
    if (selectedPosts.length === 0) {
      toast.error("Lütfen işlem yapmak için post seçin");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          postIds: selectedPosts,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setSelectedPosts([]);
        fetchPosts(); // Refresh list
      } else {
        throw new Error(result.error || "İşlem başarısız");
      }
    } catch (error) {
      console.error("Bulk action error:", error);
      toast.error("Toplu işlem sırasında hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchPosts(); // Refresh list
      } else {
        throw new Error(result.error || "Silme başarısız");
      }
    } catch (error) {
      console.error("Post delete error:", error);
      toast.error("Post silinirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: Post["status"]) => {
    const statusConfig = {
      PUBLISHED: {
        label: "Yayında",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      DRAFT: {
        label: "Taslak",
        className: "bg-slate-100 text-slate-800 border-slate-200",
      },
      REVIEW: {
        label: "İncelemede",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      },
      SCHEDULED: {
        label: "Programlı",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };
    return statusConfig[status];
  };

  const togglePostSelection = (postId: string) => {
    setSelectedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleAllPosts = () => {
    setSelectedPosts((prev) =>
      prev.length === posts.length ? [] : posts.map((p) => p.id)
    );
  };

  if (isLoading && posts.length === 0) {
    return <PostsManagementSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Post Yönetimi</h2>
          <p className="text-muted-foreground">
            Tüm gönderileri yönetin, düzenleyin ve yayınlayın
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={fetchPosts}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Yenile
          </Button>
          <Link href="/admin/posts/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Yeni Post
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{totalCount}</div>
          <div className="text-sm text-slate-600">Toplam Post</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-800">
            {stats.PUBLISHED}
          </div>
          <div className="text-sm text-slate-600">Yayında</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.DRAFT}</div>
          <div className="text-sm text-slate-600">Taslak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-800">
            {stats.REVIEW}
          </div>
          <div className="text-sm text-slate-600">İncelemede</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-800">
            {stats.SCHEDULED}
          </div>
          <div className="text-sm text-slate-600">Programlı</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-indigo-800">
            {posts
              .reduce((acc, post) => acc + post._count.views, 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Toplam Görüntülenme</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Post, yazar veya içerik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PUBLISHED">Yayında</SelectItem>
                <SelectItem value="DRAFT">Taslak</SelectItem>
                <SelectItem value="REVIEW">İncelemede</SelectItem>
                <SelectItem value="SCHEDULED">Programlı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category._count.posts})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Öne Çıkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Öne Çıkan</SelectItem>
                <SelectItem value="false">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedPosts.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedPosts.length} post seçildi
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPosts([])}
              >
                Seçimi Temizle
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("publish")}
                disabled={isUpdating}
              >
                Yayınla
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("draft")}
                disabled={isUpdating}
              >
                Taslağa Al
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("feature")}
                disabled={isUpdating}
              >
                Öne Çıkar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isUpdating}>
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Post'ları Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedPosts.length} post'u silmek istediğinizden emin
                      misiniz? Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleBulkAction("delete")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sil
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      )}

      {/* Posts Table */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <Checkbox
              checked={
                selectedPosts.length === posts.length && posts.length > 0
              }
              onCheckedChange={toggleAllPosts}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Tümünü Seç
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="border border-slate-200/60 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Post bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all"
                  ? "Filtrelerinizi ayarlayarak daha fazla sonuç görebilirsiniz."
                  : "İlk postunuzu oluşturmaya başlayın."}
              </p>
              <Link href="/admin/posts/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Post
                </Button>
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="border border-slate-200/60 rounded-lg p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox
                        checked={selectedPosts.includes(post.id)}
                        onCheckedChange={() => togglePostSelection(post.id)}
                      />
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <h3 className="font-semibold text-slate-800 truncate">
                          {post.title}
                        </h3>
                      </div>
                      {post.isFeatured && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <Star className="w-3 h-3 mr-1" />
                          Öne Çıkan
                        </Badge>
                      )}
                      <Badge className={getStatusBadge(post.status).className}>
                        {getStatusBadge(post.status).label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          backgroundColor: `${post.category.color}20`,
                          borderColor: post.category.color,
                          color: post.category.color,
                        }}
                      >
                        {post.category.name}
                      </Badge>
                    </div>

                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={post.author.image} />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "tr-TR"
                              )
                            : new Date(post.createdAt).toLocaleDateString(
                                "tr-TR"
                              )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post._count.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post._count.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{post._count.likes}</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/post/${post.slug}`} target="_blank">
                          <Eye className="w-4 h-4 mr-2" />
                          Görüntüle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/posts/${post.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          Düzenle
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {post.status !== "PUBLISHED" && (
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("publish")}
                          disabled={isUpdating}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Yayınla
                        </DropdownMenuItem>
                      )}
                      {post.status === "PUBLISHED" && (
                        <DropdownMenuItem
                          onClick={() => handleBulkAction("draft")}
                          disabled={isUpdating}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Taslağa Al
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() =>
                          handleBulkAction(
                            post.isFeatured ? "unfeature" : "feature"
                          )
                        }
                        disabled={isUpdating}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {post.isFeatured ? "Öne Çıkarmayı Kaldır" : "Öne Çıkar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Post'u Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{post.title}" post'unu silmek istediğinizden emin
                              misiniz? Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">
            Sayfa {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || isLoading}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

// Skeleton component for loading state
function PostsManagementSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 text-center">
            <Skeleton className="h-8 w-12 mx-auto mb-2" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </Card>
    </div>
  );
}
