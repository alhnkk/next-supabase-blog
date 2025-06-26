"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  Search,
  Filter,
  Ban,
  Check,
  AlertTriangle,
  MessageSquareOff,
  User,
  Calendar,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckSquare,
  Square,
  MessageCircle,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface Comment {
  id: string;
  content: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  post: {
    id: string;
    title: string;
    slug: string;
    author: {
      name: string;
    };
  };
  _count: {
    likes: number;
    replies: number;
  };
  parent?: {
    id: string;
    content: string;
    author: {
      name: string;
    };
  };
}

interface CommentModerationProps {
  className?: string;
}

export function CommentModeration({ className }: CommentModerationProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [postFilter, setPostFilter] = useState("all");
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter options
  const [posts, setPosts] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    blocked: 0,
  });

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(postFilter !== "all" && { postId: postFilter }),
      });

      const response = await fetch(`/api/admin/comments?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setComments(result.data);
        setTotalPages(result.meta.totalPages);
        setTotalCount(result.meta.totalCount);
        setPosts(result.filters.posts);
        setAuthors(result.filters.authors);
        setStats(result.stats);
      } else {
        throw new Error(result.error || "Yorumlar alınamadı");
      }
    } catch (error) {
      console.error("Comments fetch error:", error);
      toast.error("Yorumlar yüklenirken hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage, searchTerm, statusFilter, postFilter]);

  const handleBulkAction = async (action: string) => {
    if (selectedComments.length === 0) {
      toast.error("Lütfen işlem yapmak için yorum seçin");
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch("/api/admin/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          commentIds: selectedComments,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setSelectedComments([]);
        fetchComments(); // Refresh list
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

  const handleDeleteComment = async (commentId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        fetchComments(); // Refresh list
      } else {
        throw new Error(result.error || "Silme başarısız");
      }
    } catch (error) {
      console.error("Comment delete error:", error);
      toast.error("Yorum silinirken hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusInfo = (comment: Comment) => {
    if (comment.isBlocked) {
      return {
        label: "Engellendi",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <Ban className="w-3 h-3" />,
      };
    } else if (comment.isActive) {
      return {
        label: "Aktif",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: <Check className="w-3 h-3" />,
      };
    } else {
      return {
        label: "Beklemede",
        className: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <Clock className="w-3 h-3" />,
      };
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const toggleAllComments = () => {
    setSelectedComments(prev =>
      prev.length === comments.length ? [] : comments.map(c => c.id)
    );
  };

  if (isLoading && comments.length === 0) {
    return <CommentModerationSkeleton className={className} />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Yorum Moderasyonu
          </h2>
          <p className="text-muted-foreground">
            Yorumları onaylayın, reddedin ve kullanıcıları yönetin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={fetchComments}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          <div className="text-sm text-slate-600">Toplam Yorum</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-800">{stats.active}</div>
          <div className="text-sm text-slate-600">Aktif</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-800">{stats.pending}</div>
          <div className="text-sm text-slate-600">Beklemede</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-800">{stats.blocked}</div>
          <div className="text-sm text-slate-600">Engellendi</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Yorum içeriği, yazar veya post ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="pending">Beklemede</SelectItem>
                <SelectItem value="blocked">Engellendi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={postFilter} onValueChange={setPostFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Post" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Postlar</SelectItem>
                {posts.map((post) => (
                  <SelectItem key={post.id} value={post.id}>
                    {post.title.length > 30 
                      ? `${post.title.substring(0, 30)}...` 
                      : post.title
                    } ({post._count.comments})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedComments.length} yorum seçildi
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedComments([])}
              >
                Seçimi Temizle
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("approve")}
                disabled={isUpdating}
              >
                <Check className="w-4 h-4 mr-1" />
                Onayla
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("block")}
                disabled={isUpdating}
              >
                <Ban className="w-4 h-4 mr-1" />
                Engelle
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isUpdating}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Yorumları Sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedComments.length} yorumu silmek istediğinizden emin misiniz?
                      Bu işlem geri alınamaz.
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

      {/* Comments List */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Table Header */}
          <div className="flex items-center gap-3 pb-3 border-b">
            <Checkbox
              checked={selectedComments.length === comments.length && comments.length > 0}
              onCheckedChange={toggleAllComments}
            />
            <span className="text-sm font-medium text-muted-foreground">
              Tümünü Seç
            </span>
          </div>

          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="border border-slate-200/60 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <div className="flex items-center gap-6">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Yorum bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || postFilter !== "all"
                  ? "Filtrelerinizi ayarlayarak daha fazla sonuç görebilirsiniz."
                  : "Henüz moderasyon bekleyen yorum bulunmuyor."}
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const statusInfo = getStatusInfo(comment);
              return (
                <div
                  key={comment.id}
                  className={cn(
                    "border border-slate-200/60 rounded-lg p-4 hover:bg-slate-50/50 transition-colors",
                    comment.isBlocked && "border-l-4 border-l-red-400",
                    !comment.isActive && !comment.isBlocked && "border-l-4 border-l-amber-400",
                    comment.isActive && !comment.isBlocked && "border-l-4 border-l-emerald-400"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Checkbox
                          checked={selectedComments.includes(comment.id)}
                          onCheckedChange={() => toggleCommentSelection(comment.id)}
                        />
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={comment.author.image} />
                            <AvatarFallback className="text-xs">
                              {comment.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {comment.author.name}
                          </span>
                        </div>
                        <Badge className={statusInfo.className}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Post: 
                          <Link 
                            href={`/post/${comment.post.slug}`}
                            className="ml-1 hover:underline font-medium"
                            target="_blank"
                          >
                            {comment.post.title}
                          </Link>
                          <span className="ml-2">
                            by {comment.post.author.name}
                          </span>
                        </p>
                        <p className="text-foreground leading-relaxed text-sm">
                          {comment.content}
                        </p>
                      </div>

                      {comment.parent && (
                        <div className="mb-3 p-2 bg-slate-50 rounded border-l-2 border-slate-300">
                          <p className="text-xs text-muted-foreground mb-1">
                            Yanıtladığı yorum:
                          </p>
                          <p className="text-sm text-slate-600">
                            "{comment.parent.content.substring(0, 100)}..."
                            <span className="font-medium ml-1">
                              - {comment.parent.author.name}
                            </span>
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(comment.createdAt).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{comment._count.likes}</span>
                        </div>
                        {comment._count.replies > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{comment._count.replies} yanıt</span>
                          </div>
                        )}
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
                          <Link href={`/post/${comment.post.slug}#comment-${comment.id}`} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            Görüntüle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {!comment.isActive && !comment.isBlocked && (
                          <DropdownMenuItem
                            onClick={() => handleBulkAction("approve")}
                            disabled={isUpdating}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Onayla
                          </DropdownMenuItem>
                        )}
                        {comment.isBlocked && (
                          <DropdownMenuItem
                            onClick={() => handleBulkAction("unblock")}
                            disabled={isUpdating}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Engelini Kaldır
                          </DropdownMenuItem>
                        )}
                        {!comment.isBlocked && (
                          <DropdownMenuItem
                            onClick={() => handleBulkAction("block")}
                            disabled={isUpdating}
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Engelle
                          </DropdownMenuItem>
                        )}
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
                              <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu yorumu silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteComment(comment.id)}
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
              );
            })
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
function CommentModerationSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-20" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
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
        </div>
      </Card>
    </div>
  );
}
