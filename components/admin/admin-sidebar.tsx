"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Tag,
  Folder,
  Shield,
  ChevronRight,
  ChevronDown,
  Home,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Monitor,
  Heart,
  UserPlus,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface AdminSidebarProps {
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
  };
  className?: string;
}

const mainNavItems = [
  {
    title: "Ana Sayfa",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Bildirimler",
    href: "/admin/notifications",
    icon: Bell,
    badge: null,
  },
  {
    title: "Analitik",
    href: "/admin/analytics",
    icon: BarChart3,
    badge: "Pro",
  },
];

const contentNavItems = [
  {
    title: "Gönderiler",
    href: "/admin/posts",
    icon: FileText,
    badge: null,
  },
  {
    title: "Yorumlar",
    href: "/admin/comments",
    icon: MessageSquare,
    badge: null,
  },
  {
    title: "Kategoriler",
    href: "/admin/categories",
    icon: Folder,
    badge: null,
  },
  {
    title: "Etiketler",
    href: "/admin/tags",
    icon: Tag,
    badge: null,
  },
];

const userNavItems = [
  {
    title: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
    badge: null,
  },
];

const systemNavItems = [
  {
    title: "Ayarlar",
    href: "/admin/settings",
    icon: Settings,
    badge: null,
  },
];

function NavItem({ item, isCollapsed }: { item: any; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant={isActive ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10 relative",
                isActive && "bg-primary text-primary-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      asChild
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-10 px-3",
        isActive && "bg-primary text-primary-foreground"
      )}
    >
      <Link href={item.href} className="flex items-center gap-3">
        <item.icon className="h-5 w-5" />
        <span className="flex-1 text-left">{item.title}</span>
        {item.badge && (
          <Badge
            variant={isActive ? "outline" : "secondary"}
            className="text-xs"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    </Button>
  );
}

function CollapsibleNavSection({
  title,
  icon: Icon,
  items,
  isCollapsed,
}: {
  title: string;
  icon: any;
  items: any[];
  isCollapsed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hasActiveItem = items.some((item) => pathname === item.href);

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={hasActiveItem ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10",
                hasActiveItem && "bg-primary text-primary-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <div className="space-y-1">
              <div className="font-medium">{title}</div>
              {items.map((item) => (
                <div key={item.title} className="text-sm text-muted-foreground">
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant={hasActiveItem ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-10 px-3",
            hasActiveItem && "bg-primary text-primary-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="flex-1 text-left">{title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 mt-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-9 pl-9 text-sm",
                isActive && "bg-secondary text-secondary-foreground"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </Button>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Son bildirimleri almak için gerçek API hook
function useRecentNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/notifications?limit=5", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          const formattedNotifications = (data.data || [])
            .slice(0, 5)
            .map((notification: any) => ({
              id: notification.id,
              type: notification.type,
              title: notification.title,
              description: notification.description,
              time: formatTimeAgo(notification.createdAt),
              icon: getNotificationIcon(notification.type),
              color: getNotificationColor(notification.type),
              actionUrl: notification.actionUrl,
            }));
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error("Bildirimler alınamadı:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Her 30 saniyede bir yenile
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  return { notifications, loading };
}

// Bildirim tipine göre icon döndür
function getNotificationIcon(type: string) {
  switch (type) {
    case "comment":
      return MessageSquare;
    case "like":
      return Heart;
    case "user_register":
      return UserPlus;
    case "post_published":
      return FileText;
    default:
      return Bell;
  }
}

// Bildirim tipine göre renk döndür
function getNotificationColor(type: string) {
  switch (type) {
    case "comment":
      return "text-blue-500";
    case "like":
      return "text-red-500";
    case "user_register":
      return "text-green-500";
    case "post_published":
      return "text-purple-500";
    default:
      return "text-gray-500";
  }
}

// Zaman formatla
function formatTimeAgo(date: string | Date) {
  const now = new Date();
  const notificationDate = new Date(date);
  const diff = now.getTime() - notificationDate.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Şimdi";
  if (minutes < 60) return `${minutes}dk`;
  if (hours < 24) return `${hours}sa`;
  if (days < 7) return `${days}g`;
  return notificationDate.toLocaleDateString("tr-TR");
}

export function AdminSidebar({ user, className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setTheme, theme } = useTheme();
  const { notifications } = useRecentNotifications();

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">JURNALİZE</span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="border-b p-4">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/posts/new">
              <Button size="sm" className="h-8 text-xs cursor-pointer">
                <Plus className="h-3 w-3 mr-1" />
                Yeni
              </Button>
            </Link>

            {/* Bildirimler Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs relative"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Bildirimler
                  {notifications.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Son Bildirimler
                  <Badge variant="outline" className="text-xs">
                    {notifications.length}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Henüz bildirim yok
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.slice(0, 5).map((notification: any) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="p-3 cursor-pointer"
                        asChild
                      >
                        <Link
                          href={
                            notification.actionUrl || "/admin/notifications"
                          }
                        >
                          <div className="flex items-start gap-3 w-full">
                            <notification.icon
                              className={cn(
                                "h-4 w-4 mt-0.5",
                                notification.color
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {notification.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/notifications"
                    className="text-center justify-center font-medium"
                  >
                    Tüm Bildirimleri Görüntüle
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Main
                </h2>
              </div>
            )}
            {mainNavItems.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>

          <Separator />

          {/* Content Management */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  İçerik
                </h2>
              </div>
            )}
            {contentNavItems.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>

          <Separator />

          {/* User Management */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Kullanıcılar
                </h2>
              </div>
            )}
            {userNavItems.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>

          <Separator />

          {/* System */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-2">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sistem
                </h2>
              </div>
            )}
            {systemNavItems.map((item) => (
              <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        {!isCollapsed && (
          <div className="space-y-3">
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.name || ""}
                    />
                    <AvatarFallback>{user?.name?.[0] || "A"}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3 flex-1 text-left">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user?.role}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Siteye Git
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isCollapsed && (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={user?.image || ""}
                        alt={user?.name || ""}
                      />
                      <AvatarFallback className="text-xs">
                        {user?.name?.[0] || "A"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-sm">
                    <div className="font-medium">{user?.name}</div>
                    <div className="text-muted-foreground">{user?.role}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}
