"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  Calendar,
  FileText,
  MessageSquare,
  Heart,
  Shield,
  Crown,
  MapPin,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface UserProfileTooltipProps {
  userId: string;
  children: React.ReactNode;
  showOnClick?: boolean;
}

interface UserInfo {
  id: string;
  name: string;
  username?: string;
  email?: string;
  image?: string;
  bio?: string;
  role?: string;
  isVerified?: boolean;
  location?: string;
  website?: string;
  joinedAt: string;
  stats: {
    posts: number;
    comments: number;
    likes: number;
    following: number;
    followers: number;
  };
}

export function UserProfileTooltip({
  userId,
  children,
  showOnClick = false,
}: UserProfileTooltipProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUserInfo = async () => {
    if (isLoading || userInfo) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !userInfo && !isLoading) {
      fetchUserInfo();
    }
  };

  const handleClick = () => {
    if (showOnClick) {
      window.location.href = `/user/${userId}`;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div
          onClick={handleClick}
          className={showOnClick ? "cursor-pointer" : ""}
        >
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="top" align="start">
        {isLoading ? (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        ) : userInfo ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-muted">
                  <AvatarImage src={userInfo.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {userInfo.name?.charAt(0)?.toUpperCase() || (
                      <User className="w-6 h-6" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {userInfo.name}
                    </h3>
                    {userInfo.role === "admin" && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {userInfo.isVerified && (
                      <Shield className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  {userInfo.username && (
                    <p className="text-xs text-muted-foreground">
                      @{userInfo.username}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(userInfo.joinedAt), {
                        addSuffix: true,
                        locale: tr,
                      })}{" "}
                      katıldı
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {userInfo.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {userInfo.bio}
                </p>
              )}

              {/* Location & Website */}
              {(userInfo.location || userInfo.website) && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {userInfo.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{userInfo.location}</span>
                    </div>
                  )}
                  {userInfo.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <a
                        href={userInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary truncate"
                      >
                        Website
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-semibold">
                    {userInfo.stats.posts}
                  </div>
                  <div className="text-xs text-muted-foreground">Post</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {userInfo.stats.comments}
                  </div>
                  <div className="text-xs text-muted-foreground">Yorum</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {userInfo.stats.likes}
                  </div>
                  <div className="text-xs text-muted-foreground">Beğeni</div>
                </div>
              </div>

              {/* View Profile Button */}
              <Button asChild size="sm" className="w-full">
                <Link href={`/user/${userId}`}>Profili Görüntüle</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Kullanıcı bilgileri yüklenemedi
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Usage helper for common elements
export function UserNameWithTooltip({
  userId,
  name,
  className = "",
}: {
  userId: string;
  name: string;
  className?: string;
}) {
  return (
    <UserProfileTooltip userId={userId} showOnClick>
      <span
        className={`hover:text-primary transition-colors cursor-pointer ${className}`}
      >
        {name}
      </span>
    </UserProfileTooltip>
  );
}

export function UserAvatarWithTooltip({
  userId,
  name,
  image,
  size = "default",
  className = "",
}: {
  userId: string;
  name: string;
  image?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    default: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <UserProfileTooltip userId={userId} showOnClick>
      <Avatar
        className={`${sizeClasses[size]} ring-2 ring-muted hover:ring-primary transition-all cursor-pointer ${className}`}
      >
        <AvatarImage src={image || ""} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
    </UserProfileTooltip>
  );
}
