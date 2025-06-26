import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Heart,
  UserPlus,
  FileText,
  Eye,
  Calendar,
  Bell,
  MoreHorizontal,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bildirimler - Admin Panel",
  description: "Site aktiviteleri ve bildirimleri yönetimi",
};

// Bildirim tiplerini tanımlayalım
interface NotificationData {
  id: string;
  type: "comment" | "like" | "user_register" | "post_published";
  title: string;
  description: string;
  content?: string | null;
  createdAt: Date;
  isRead: boolean;
  user?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  post?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  actionUrl?: string;
}

async function getNotifications() {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL ||
        "https://next-supabase-blog-xi.vercel.app/"
      }/api/admin/notifications?limit=50`,
      {
        cache: "no-store",
        headers: {
          Cookie: (await headers()).get("cookie") || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      data: [],
      summary: {
        total: 0,
        comments: 0,
        likes: 0,
        users: 0,
        posts: 0,
      },
    };
  }
}

function getNotificationIcon(type: NotificationData["type"]) {
  switch (type) {
    case "comment":
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "like":
      return <Heart className="w-4 h-4 text-red-500" />;
    case "user_register":
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case "post_published":
      return <FileText className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diff = now.getTime() - notificationDate.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Şimdi";
  if (minutes < 60) return `${minutes}dk önce`;
  if (hours < 24) return `${hours}sa önce`;
  if (days < 7) return `${days}g önce`;
  return notificationDate.toLocaleDateString("tr-TR");
}

export default async function AdminNotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Admin kontrolü
  if (session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const notificationsResponse = await getNotifications();
  const notifications: NotificationData[] = notificationsResponse.data || [];
  const summary = notificationsResponse.summary || {
    total: 0,
    comments: 0,
    likes: 0,
    users: 0,
    posts: 0,
  };

  // Bildirimleri tiplere göre grupla
  const commentNotifications = notifications.filter(
    (n) => n.type === "comment"
  );
  const likeNotifications = notifications.filter((n) => n.type === "like");
  const userNotifications = notifications.filter(
    (n) => n.type === "user_register"
  );
  const postNotifications = notifications.filter(
    (n) => n.type === "post_published"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bildirimler</h1>
          <p className="text-muted-foreground">
            Site aktivitelerini takip edin ve yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Check className="w-4 h-4 mr-2" />
            Tümünü Okundu İşaretle
          </Button>
          <Button variant="outline" size="sm">
            <X className="w-4 h-4 mr-2" />
            Tümünü Sil
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yorumlar</p>
                <p className="text-2xl font-bold">
                  {commentNotifications.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Beğeniler</p>
                <p className="text-2xl font-bold">{likeNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yeni Üyeler</p>
                <p className="text-2xl font-bold">{userNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gönderiler</p>
                <p className="text-2xl font-bold">{postNotifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Tümü ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Yorumlar ({commentNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Beğeniler ({likeNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Üyeler ({userNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Gönderiler ({postNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Bildirimler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      Henüz bildirim yok
                    </h3>
                    <p className="text-sm">
                      Site aktiviteleri burada görünecek
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {notification.user && (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={notification.user.image} />
                              <AvatarFallback className="text-xs">
                                {notification.user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {formatTimeAgo(notification.createdAt)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.description}
                        </p>

                        {notification.content && (
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded mb-2">
                            {notification.content}
                          </p>
                        )}

                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            Görüntüle
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Yorum Bildirimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz yorum bildirimi yok</p>
                  </div>
                ) : (
                  commentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <MessageSquare className="w-5 h-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        {notification.content && (
                          <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                            {notification.content}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="likes">
          <Card>
            <CardHeader>
              <CardTitle>Beğeni Bildirimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {likeNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz beğeni bildirimi yok</p>
                  </div>
                ) : (
                  likeNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <Heart className="w-5 h-5 text-red-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Üye Bildirimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz üye bildirimi yok</p>
                  </div>
                ) : (
                  userNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <UserPlus className="w-5 h-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Gönderi Bildirimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {postNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz gönderi bildirimi yok</p>
                  </div>
                ) : (
                  postNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <FileText className="w-5 h-5 text-purple-500 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Görüntüle →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
