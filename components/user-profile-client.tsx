"use client";

import { useState, useEffect } from "react";
import { PostCard } from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  FileText,
  Heart,
  Bookmark,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  UserProfileTooltip,
  UserNameWithTooltip,
  UserAvatarWithTooltip,
} from "@/components/user-profile-tooltip";

interface UserProfile {
  id: string;
  name: string;
  username?: string;
  image?: string;
  bio?: string;
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
    likes: number;
    savedPosts: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  _count: {
    comments: number;
    likes: number;
    views: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    publishedAt?: string;
    author: {
      id: string;
      name: string;
      image?: string;
    };
    category: {
      id: string;
      name: string;
      color: string;
    };
    _count: {
      comments: number;
      likes: number;
      views: number;
    };
  };
  _count: {
    likes: number;
    replies: number;
  };
}

interface UserProfileClientProps {
  initialUser?: UserProfile;
  userId: string;
}

export function UserProfileClient({
  initialUser,
  userId,
}: UserProfileClientProps) {
  const [user, setUser] = useState<UserProfile | null>(initialUser || null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [activeTab, setActiveTab] = useState("posts");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTabLoading, setIsTabLoading] = useState(false);

  // User bilgilerini yükle
  useEffect(() => {
    if (!initialUser) {
      fetchUserProfile();
    }
  }, [initialUser, userId]);

  // Tab değiştiğinde ilgili veriyi yükle
  useEffect(() => {
    if (user && activeTab) {
      fetchTabData(activeTab, 1);
    }
  }, [user, activeTab]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        toast.error("Kullanıcı bilgileri yüklenemedi");
      }
    } catch (_error) {
      console.error("User profile fetch error:", _error);
      toast.error("Bir hata oluştu");
    }
  };

  const fetchTabData = async (tab: string, page: number) => {
    setIsTabLoading(true);
    setCurrentPage(page);

    try {
      let endpoint = "";
      switch (tab) {
        case "posts":
          endpoint = `/api/user/${userId}/posts?page=${page}&limit=6`;
          break;
        case "likes":
          endpoint = `/api/user/${userId}/likes?page=${page}&limit=6`;
          break;
        case "saved":
          endpoint = `/api/user/${userId}/saved?page=${page}&limit=6`;
          break;
        case "comments":
          endpoint = `/api/user/${userId}/comments?page=${page}&limit=6`;
          break;
        default:
          return;
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();

        switch (tab) {
          case "posts":
            setPosts(data.data);
            break;
          case "likes":
            setLikedPosts(data.data);
            break;
          case "saved":
            setSavedPosts(data.data);
            break;
          case "comments":
            setComments(data.data);
            break;
        }

        setTotalPages(data.pagination.pages);
      } else if (response.status === 403 && tab === "saved") {
        // Kaydetme verileri private
        setSavedPosts([]);
        setTotalPages(0);
      } else {
        toast.error("Veriler yüklenemedi");
      }
    } catch (error) {
      console.error("Tab data fetch error:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setIsTabLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePageChange = (page: number) => {
    fetchTabData(activeTab, page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderPosts = (postList: Post[]) => {
    if (!Array.isArray(postList) || postList.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz post yok
          </h3>
          <p className="text-gray-600">
            Bu kategoride henüz hiçbir içerik bulunmuyor.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {postList.map((post) => (
          <PostCard key={post.id} post={post} variant="compact" />
        ))}
      </div>
    );
  };

  const renderComments = () => {
    if (!Array.isArray(comments) || comments.length === 0) {
      return (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz yorum yok
          </h3>
          <p className="text-gray-600">
            Bu kullanıcı henüz hiçbir yorumda bulunmamış.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {comment.post.coverImage ? (
                    <img
                      src={comment.post.coverImage}
                      alt={comment.post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/post/${comment.post.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
                  >
                    {comment.post.title}
                  </Link>

                  <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {comment._count.likes}
                    </span>
                    {comment._count.replies > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {comment._count.replies} yanıt
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isTabLoading}
        >
          <ChevronLeft className="w-4 h-4" />
          Önceki
        </Button>

        <span className="text-sm text-gray-600 px-4">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isTabLoading}
        >
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-2xl lg:text-3xl">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {user.name}
                    </h1>
                    {user.username && (
                      <p className="text-gray-600 mt-1">@{user.username}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 mt-4 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(user.createdAt)} tarihinde katıldı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <Separator className="my-6" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user._count.posts}
                </div>
                <div className="text-sm text-gray-600">Post</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user._count.likes}
                </div>
                <div className="text-sm text-gray-600">Beğeni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user._count.comments}
                </div>
                <div className="text-sm text-gray-600">Yorum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user._count.savedPosts}
                </div>
                <div className="text-sm text-gray-600">Kayıt</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Postlar
                </TabsTrigger>
                <TabsTrigger value="likes" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Beğeniler
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  Kaydedilenler
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Yorumlar
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                {isTabLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index}>
                        <CardContent className="p-6">
                          <Skeleton className="w-full h-48 mb-4" />
                          <Skeleton className="w-3/4 h-6 mb-2" />
                          <Skeleton className="w-full h-4 mb-2" />
                          <Skeleton className="w-1/2 h-4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    <TabsContent value="posts" className="mt-0">
                      {renderPosts(posts)}
                    </TabsContent>

                    <TabsContent value="likes" className="mt-0">
                      {renderPosts(likedPosts)}
                    </TabsContent>

                    <TabsContent value="saved" className="mt-0">
                      {renderPosts(savedPosts)}
                    </TabsContent>

                    <TabsContent value="comments" className="mt-0">
                      {renderComments()}
                    </TabsContent>
                  </>
                )}

                {renderPagination()}
              </div>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
