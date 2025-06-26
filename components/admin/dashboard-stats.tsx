"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Users,
  MessageSquare,
  Eye,
  TrendingUp,
  TrendingDown,
  Heart,
  Star,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface StatCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  icon: React.ElementType;
  color: string;
  className?: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  className,
  isLoading = false,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-6 relative overflow-hidden", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 relative overflow-hidden", className)}>
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "p-2 rounded-lg",
              `bg-${color}-100 text-${color}-600`
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          {change && (
            <Badge
              variant={change.type === "increase" ? "default" : "destructive"}
              className="text-xs"
            >
              {change.type === "increase" ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change.value}%
            </Badge>
          )}
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground font-heading">
            {typeof value === "number" ? value.toLocaleString() : value}
          </h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {change && (
            <p className="text-xs text-muted-foreground">
              {change.type === "increase" ? "+" : "-"}
              {change.value}% from {change.period}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

interface StatsData {
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  monthlyPosts: number;
  weeklyViews: number;
  weeklyUsers: number;
  changes: {
    monthlyPosts: number;
    weeklyViews: number;
    weeklyUsers: number;
  };
  publishRatio: number;
  engagementRate: number;
  topCategories: Array<{ name: string; postCount: number }>;
  recentActivity: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    author: { name: string; email: string };
  }>;
}

interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || "Veri alınamadı");
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
      toast.error("İstatistikler yüklenirken hata oluştu");

      // Fallback mock data if API fails
      setStats({
        totalPosts: 0,
        totalUsers: 0,
        totalComments: 0,
        totalViews: 0,
        totalLikes: 0,
        monthlyPosts: 0,
        weeklyViews: 0,
        weeklyUsers: 0,
        changes: {
          monthlyPosts: 0,
          weeklyViews: 0,
          weeklyUsers: 0,
        },
        publishRatio: 0,
        engagementRate: 0,
        topCategories: [],
        recentActivity: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats && isLoading) {
    return <DashboardStatsSkeleton className={className} />;
  }

  if (!stats) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Veri Yüklenemedi</h3>
          <p className="text-muted-foreground mb-4">
            İstatistikler yüklenirken bir hata oluştu.
          </p>
          <Button onClick={fetchStats} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Post",
      value: stats.totalPosts,
      change: {
        value: Math.abs(stats.changes.monthlyPosts),
        type:
          stats.changes.monthlyPosts >= 0 ? "increase" : ("decrease" as const),
        period: "last month",
      },
      icon: FileText,
      color: "blue",
    },
    {
      title: "Toplam Kullanıcı",
      value: stats.totalUsers,
      change: {
        value: Math.abs(stats.changes.weeklyUsers),
        type:
          stats.changes.weeklyUsers >= 0 ? "increase" : ("decrease" as const),
        period: "last week",
      },
      icon: Users,
      color: "green",
    },
    {
      title: "Toplam Yorum",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "purple",
    },
    {
      title: "Toplam Görüntülenme",
      value: stats.totalViews,
      change: {
        value: Math.abs(stats.changes.weeklyViews),
        type:
          stats.changes.weeklyViews >= 0 ? "increase" : ("decrease" as const),
        period: "last week",
      },
      icon: Eye,
      color: "orange",
    },
    {
      title: "Toplam Beğeni",
      value: stats.totalLikes,
      icon: Heart,
      color: "red",
    },
    {
      title: "Bu Ayki Post",
      value: stats.monthlyPosts,
      change: {
        value: Math.abs(stats.changes.monthlyPosts),
        type:
          stats.changes.monthlyPosts >= 0 ? "increase" : ("decrease" as const),
        period: "last month",
      },
      icon: Calendar,
      color: "indigo",
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading mb-2">
              JURNALİZE Admin Paneline Hoş Geldiniz! 👋
            </h2>
            <p className="text-muted-foreground">
              Bugün blogunuzda neler oluyor, işte özet.
            </p>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Son güncelleme: {lastUpdated.toLocaleTimeString("tr-TR")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchStats}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", isLoading && "animate-spin")}
              />
              Yenile
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={
              stat.change
                ? {
                    ...stat.change,
                    type: stat.change.type as "increase" | "decrease",
                  }
                : undefined
            }
            icon={stat.icon}
            color={stat.color}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">En Popüler Kategoriler</h3>
          <div className="space-y-3">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <Badge variant="outline">{category.postCount} post</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Henüz kategori yok
              </p>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hızlı İstatistikler</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Yayın Oranı</span>
              <Badge variant="outline">{stats.publishRatio}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Etkileşim Oranı</span>
              <Badge variant="outline">{stats.engagementRate}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Haftalık Görüntülenme</span>
              <Badge variant="outline">
                {stats.weeklyViews.toLocaleString()}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function DashboardStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatCard
            key={index}
            title=""
            value={0}
            icon={FileText}
            color="blue"
            isLoading={true}
          />
        ))}
      </div>
    </div>
  );
}
