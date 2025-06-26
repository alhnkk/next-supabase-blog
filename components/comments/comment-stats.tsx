"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Heart, TrendingUp, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentStatsProps {
  totalComments: number;
  totalLikes: number;
  mostActiveDay?: string;
  averageResponseTime?: string;
  className?: string;
}

export function CommentStats({
  totalComments,
  totalLikes,
  mostActiveDay = "Pazartesi",
  averageResponseTime = "2 saat",
  className,
}: CommentStatsProps) {
  const stats = [
    {
      icon: MessageCircle,
      label: "Toplam Yorum",
      value: totalComments,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      label: "Toplam Beğeni",
      value: totalLikes,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      label: "En Aktif Gün",
      value: mostActiveDay,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Clock,
      label: "Ort. Yanıt Süresi",
      value: averageResponseTime,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold font-heading">Yorum İstatistikleri</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border",
              stat.bgColor
            )}
          >
            <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-xs">
          Bu ay +{Math.floor(totalComments * 0.15)} yorum
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Bu hafta +{Math.floor(totalLikes * 0.08)} beğeni
        </Badge>
      </div>
    </Card>
  );
}
