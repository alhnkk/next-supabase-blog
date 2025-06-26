"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  User,
  Settings,
  Bell,
  Shield,
  Edit3,
  Save,
  Camera,
  Mail,
  Calendar,
  FileText,
  Heart,
  Bookmark,
  MessageCircle,
  Eye,
  TrendingUp,
  Award,
  MessageSquare,
  ArrowLeftIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username?: string;
  image?: string;
  bio?: string;
  createdAt: string;
  emailVerified?: boolean;
  _count?: {
    posts: number;
    comments: number;
    likes: number;
    savedPosts: number;
  };
  provider: string;
  hasPassword: boolean;
}

interface UserStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  postsThisMonth: number;
  engagementRate: number;
  popularPost?: {
    title: string;
    views: number;
    slug: string;
  };
}

interface ActivityData {
  savedPosts: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    author: {
      name: string;
      username?: string;
    };
    coverImage?: string;
    _count: {
      likes: number;
      comments: number;
      views: number;
    };
  }>;
  likedPosts: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: string;
    author: {
      name: string;
      username?: string;
    };
    coverImage?: string;
    _count: {
      likes: number;
      comments: number;
      views: number;
    };
  }>;
  userComments: Array<{
    id: string;
    content: string;
    createdAt: string;
    post: {
      id: string;
      title: string;
      slug: string;
    };
  }>;
}

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    email: "",
  });

  // Settings states
  const [settings, setSettings] = useState({
    language: "tr",
    timezone: "Europe/Istanbul",
    theme: "light",
    postsPerPage: 10,
    showProfileStats: true,
    profilePublic: true,
    showEmail: false,
    showActivity: true,
  });

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch session manually
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/get-session");
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error("Session fetch error:", error);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile();
      fetchUserStats();
      fetchActivityData();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/user/${session.user.id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          name: userData.name || "",
          username: userData.username || "",
          bio: userData.bio || "",
          email: userData.email || "",
        });
      } else {
        setError("Kullanıcı bilgileri alınamadı.");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/user/${session.user.id}/stats`);
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchActivityData = async () => {
    if (!session?.user?.id) return;

    try {
      const [savedResponse, likedResponse, commentsResponse] =
        await Promise.all([
          fetch(`/api/user/${session.user.id}/saved`),
          fetch(`/api/user/${session.user.id}/likes`),
          fetch(`/api/user/${session.user.id}/comments`),
        ]);

      const savedPosts = savedResponse.ok ? await savedResponse.json() : [];
      const likedPosts = likedResponse.ok ? await likedResponse.json() : [];
      const userComments = commentsResponse.ok
        ? await commentsResponse.json()
        : [];

      setActivityData({
        savedPosts,
        likedPosts,
        userComments,
      });
    } catch (err) {
      console.error("Activity data fetch error:", err);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        toast.success("Profil başarıyla güncellendi!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Profil güncellenemedi.");
        toast.error("Profil güncellenemedi!");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Bir hata oluştu.");
      toast.error("Bir hata oluştu!");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword ||
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      toast.error("Şifreler eşleşmiyor veya boş bırakıldı");
      return;
    }

    if (user?.hasPassword && !passwordForm.currentPassword) {
      toast.error("Mevcut şifrenizi girin");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      if (response.ok) {
        toast.success("Şifre başarıyla güncellendi!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        // Update user state to reflect that they now have a password
        if (user) {
          setUser({ ...user, hasPassword: true });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Şifre güncellenemedi!");
      }
    } catch (err) {
      console.error("Password update error:", err);
      toast.error("Bir hata oluştu!");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Update user image
        const updateResponse = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: url }),
        });

        if (updateResponse.ok) {
          const updatedUser = await updateResponse.json();
          setUser(updatedUser);
          toast.success("Profil fotoğrafı güncellendi!");
        }
      } else {
        toast.error("Fotoğraf yüklenemedi!");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Bir hata oluştu!");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (sessionLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Oturum Gerekli</h1>
          <p className="text-muted-foreground mt-2">
            Bu sayfayı görüntülemek için giriş yapmalısınız.
          </p>
          <Button asChild className="mt-4">
            <Link href="/login">Giriş Yap</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back to home page */}
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Ana Sayfaya Dön
      </Link>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Profilim</h1>
          <p className="text-muted-foreground">
            Hesap bilgilerinizi ve ayarlarınızı yönetin
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Aktivite
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Ayarlar
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Güvenlik
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Info */}
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Profil Bilgileri
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(!editing)}
                        >
                          {editing ? "İptal" : "Düzenle"}
                          <Edit3 className="w-4 h-4 ml-2" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Profile Picture */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <Avatar className="w-24 h-24">
                            <AvatarImage src={user?.image} alt={user?.name} />
                            <AvatarFallback className="text-2xl">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {editing && (
                            <label
                              htmlFor="image-upload"
                              className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                            >
                              <Camera className="w-4 h-4" />
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Ad Soyad</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            disabled={!editing}
                          />
                        </div>

                        <div>
                          <Label htmlFor="username">Kullanıcı Adı</Label>
                          <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                username: e.target.value,
                              })
                            }
                            disabled={!editing}
                            placeholder="@kullaniciadi"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">E-posta</Label>
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            disabled={!editing}
                            type="email"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bio">Hakkımda</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                              setFormData({ ...formData, bio: e.target.value })
                            }
                            disabled={!editing}
                            placeholder="Kendinizi tanıtın..."
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Save Button */}
                      {editing && (
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                        </Button>
                      )}

                      {error && (
                        <p className="text-red-500 text-sm text-center">
                          {error}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Sidebar */}
                <div className="space-y-6">
                  {/* Basic Info Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="secondary">
                            {user?.emailVerified
                              ? "Doğrulanmış"
                              : "Doğrulanmamış"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {user?.createdAt && formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Stats */}
                  {user?._count && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Aktivite</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Postlar</span>
                          </div>
                          <Badge>{user._count.posts}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Yorumlar</span>
                          </div>
                          <Badge>{user._count.comments}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm">Beğeniler</span>
                          </div>
                          <Badge>{user._count.likes}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bookmark className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">Kaydedilenler</span>
                          </div>
                          <Badge>{user._count.savedPosts}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Performance Stats */}
                  {stats && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">İstatistikler</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Toplam Görüntüleme</span>
                          </div>
                          <Badge>{stats.totalViews}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Etkileşim Oranı</span>
                          </div>
                          <Badge>{stats.engagementRate}%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">Bu Ay Post</span>
                          </div>
                          <Badge>{stats.postsThisMonth}</Badge>
                        </div>
                        {stats.popularPost && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">
                              En Popüler Post
                            </p>
                            <Link
                              href={`/post/${stats.popularPost.slug}`}
                              className="text-sm font-medium hover:underline line-clamp-2"
                            >
                              {stats.popularPost.title}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-1">
                              {stats.popularPost.views} görüntüleme
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="space-y-6">
              <Tabs defaultValue="saved" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="saved">Kaydettiklerim</TabsTrigger>
                  <TabsTrigger value="liked">Beğendiklerim</TabsTrigger>
                  <TabsTrigger value="comments">Yorumlarım</TabsTrigger>
                </TabsList>

                {/* Saved Posts */}
                <TabsContent value="saved">
                  <Card>
                    <CardHeader>
                      <CardTitle>Kaydedilen Postlar</CardTitle>
                      <p className="text-muted-foreground">
                        Kaydettiğiniz yazılar
                      </p>
                    </CardHeader>
                    <CardContent>
                      {activityData?.savedPosts &&
                      activityData.savedPosts.length > 0 ? (
                        <div className="space-y-4">
                          {activityData.savedPosts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                            >
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/post/${post.slug}`}
                                  className="font-medium hover:underline line-clamp-2"
                                >
                                  {post.title}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {post.author.name} •{" "}
                                  {formatDate(post.createdAt)}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {post._count.views}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {post._count.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {post._count.comments}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">
                            Henüz kaydetilen post yok
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Beğendiğiniz yazıları kaydetmek için post
                            sayfalarındaki kaydet butonunu kullanın.
                          </p>
                          <Button asChild>
                            <Link href="/">Postları Keşfet</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Liked Posts */}
                <TabsContent value="liked">
                  <Card>
                    <CardHeader>
                      <CardTitle>Beğenilen Postlar</CardTitle>
                      <p className="text-muted-foreground">
                        Beğendiğiniz yazılar
                      </p>
                    </CardHeader>
                    <CardContent>
                      {activityData?.likedPosts &&
                      activityData.likedPosts.length > 0 ? (
                        <div className="space-y-4">
                          {activityData.likedPosts.map((post) => (
                            <div
                              key={post.id}
                              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                            >
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/post/${post.slug}`}
                                  className="font-medium hover:underline line-clamp-2"
                                >
                                  {post.title}
                                </Link>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {post.author.name} •{" "}
                                  {formatDate(post.createdAt)}
                                </p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {post._count.views}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {post._count.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {post._count.comments}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">
                            Henüz beğenilen post yok
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Beğendiğiniz yazıları görüntülemek için post
                            sayfalarındaki beğen butonunu kullanın.
                          </p>
                          <Button asChild>
                            <Link href="/">Postları Keşfet</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* User Comments */}
                <TabsContent value="comments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Yorumlarım</CardTitle>
                      <p className="text-muted-foreground">
                        Yaptığınız yorumlar
                      </p>
                    </CardHeader>
                    <CardContent>
                      {activityData?.userComments &&
                      activityData.userComments.length > 0 ? (
                        <div className="space-y-4">
                          {activityData.userComments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-4 border rounded-lg hover:bg-muted/50"
                            >
                              <div className="space-y-3">
                                <div>
                                  <Link
                                    href={`/post/${comment.post.slug}`}
                                    className="font-medium hover:underline"
                                  >
                                    {comment.post.title}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  <p className="text-sm">{comment.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">
                            Henüz yorum yok
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Yaptığınız yorumları görüntülemek için yazılara
                            yorum yapmaya başlayın.
                          </p>
                          <Button asChild>
                            <Link href="/">Postları Keşfet</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Hesap Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Görünüm Ayarları</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Dil</Label>
                        <p className="text-sm text-gray-600">
                          Arayüz dili seçiniz
                        </p>
                      </div>
                      <Select
                        value={settings.language}
                        onValueChange={(value) =>
                          setSettings({ ...settings, language: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tr">Türkçe</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Zaman Dilimi</Label>
                        <p className="text-sm text-gray-600">
                          Tarih ve saat formatı
                        </p>
                      </div>
                      <Select
                        value={settings.timezone}
                        onValueChange={(value) =>
                          setSettings({ ...settings, timezone: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Istanbul">
                            İstanbul (UTC+3)
                          </SelectItem>
                          <SelectItem value="UTC">UTC (UTC+0)</SelectItem>
                          <SelectItem value="America/New_York">
                            New York (UTC-5)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Londra (UTC+0)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Tema</Label>
                        <p className="text-sm text-gray-600">
                          Arayüz teması seçiniz
                        </p>
                      </div>
                      <Select
                        value={settings.theme}
                        onValueChange={(value) =>
                          setSettings({ ...settings, theme: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Açık Tema</SelectItem>
                          <SelectItem value="dark">Koyu Tema</SelectItem>
                          <SelectItem value="system">Sistem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sayfa Başına Post</Label>
                        <p className="text-sm text-gray-600">
                          Listelerde gösterilecek post sayısı
                        </p>
                      </div>
                      <Select
                        value={settings.postsPerPage.toString()}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            postsPerPage: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Gizlilik</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profili Herkese Açık</Label>
                        <p className="text-sm text-gray-600">
                          Profilinizi herkes görebilir
                        </p>
                      </div>
                      <Switch
                        checked={settings.profilePublic}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, profilePublic: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>E-posta Adresini Göster</Label>
                        <p className="text-sm text-gray-600">
                          E-posta adresiniz profilinizde görünür
                        </p>
                      </div>
                      <Switch
                        checked={settings.showEmail}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showEmail: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Profil İstatistiklerini Göster</Label>
                        <p className="text-sm text-gray-600">
                          Post, yorum, beğeni sayılarını göster
                        </p>
                      </div>
                      <Switch
                        checked={settings.showProfileStats}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            showProfileStats: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Aktivite Geçmişini Göster</Label>
                        <p className="text-sm text-gray-600">
                          Son aktiviteleriniz profilinizde görünür
                        </p>
                      </div>
                      <Switch
                        checked={settings.showActivity}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showActivity: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full">Ayarları Kaydet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Güvenlik Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Check if user signed in with a provider */}
                {user?.provider && !user?.hasPassword && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">
                          Şifre Oluşturun
                        </h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {user.provider} ile giriş yaptınız. Hesabınızın
                          güvenliği için bir şifre oluşturmanızı öneririz. Bu
                          sayede e-posta/şifre ile de giriş yapabilirsiniz.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {user?.provider && !user?.hasPassword
                      ? "Şifre Oluştur"
                      : "Şifre Değiştir"}
                  </h3>

                  {/* Only show current password field if user has a password */}
                  {user?.hasPassword && (
                    <div>
                      <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                      <Input
                        type="password"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Mevcut şifrenizi girin"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="newPassword">
                      {user?.provider && !user?.hasPassword
                        ? "Yeni Şifre"
                        : "Yeni Şifre"}
                    </Label>
                    <Input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="En az 8 karakter"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir
                      büyük harf, bir küçük harf ve bir rakam içermelidir.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Şifrenizi tekrar girin"
                    />
                  </div>

                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      changingPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !==
                        passwordForm.confirmPassword ||
                      (user?.hasPassword && !passwordForm.currentPassword)
                    }
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {changingPassword
                      ? "İşlem Yapılıyor..."
                      : user?.provider && !user?.hasPassword
                      ? "Şifre Oluştur"
                      : "Şifre Değiştir"}
                  </Button>
                </div>

                <Separator />

                {/* Account Actions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600">
                    Tehlikeli Bölge
                  </h3>

                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-red-800">
                          Hesap Silme
                        </h4>
                        <p className="text-sm text-red-700">
                          Hesabınızı silmek istiyorsanız, admin onayı gerekir.
                          Bu işlem geri alınamaz.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem admin onayı gerektirir."
                            )
                          ) {
                            // TODO: Implement account deletion request
                            alert(
                              "Hesap silme talebiniz admin onayına gönderildi."
                            );
                          }
                        }}
                      >
                        Hesap Silme Talebi Gönder
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
