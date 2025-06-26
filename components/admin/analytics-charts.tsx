"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Download,
  Calendar,
  Users,
  Eye,
  MessageSquare,
  FileText,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for charts
const visitorsData = [
  { date: "Jan", visitors: 4000, pageViews: 2400, newUsers: 400 },
  { date: "Feb", visitors: 3000, pageViews: 1398, newUsers: 300 },
  { date: "Mar", visitors: 2000, pageViews: 9800, newUsers: 800 },
  { date: "Apr", visitors: 2780, pageViews: 3908, newUsers: 350 },
  { date: "May", visitors: 1890, pageViews: 4800, newUsers: 450 },
  { date: "Jun", visitors: 2390, pageViews: 3800, newUsers: 250 },
  { date: "Jul", visitors: 3490, pageViews: 4300, newUsers: 400 },
  { date: "Aug", visitors: 4200, pageViews: 5100, newUsers: 520 },
  { date: "Sep", visitors: 3800, pageViews: 4600, newUsers: 380 },
  { date: "Oct", visitors: 4100, pageViews: 4900, newUsers: 410 },
  { date: "Nov", visitors: 3900, pageViews: 4700, newUsers: 390 },
  { date: "Dec", visitors: 4300, pageViews: 5200, newUsers: 430 },
];

const postsData = [
  { category: "Edebiyat", posts: 45, views: 12500, engagement: 85 },
  { category: "Şiir", posts: 32, views: 8900, engagement: 92 },
  { category: "Roman", posts: 28, views: 15200, engagement: 78 },
  { category: "Eleştiri", posts: 19, views: 6800, engagement: 88 },
  { category: "Deneme", posts: 15, views: 5400, engagement: 81 },
  { category: "Haber", posts: 12, views: 9200, engagement: 73 },
];

const engagementData = [
  { name: "Beğeniler", value: 3892, color: "#ef4444" },
  { name: "Yorumlar", value: 856, color: "#8b5cf6" },
  { name: "Paylaşımlar", value: 234, color: "#06b6d4" },
  { name: "Kaydetmeler", value: 156, color: "#10b981" },
];

const recentActivity = [
  {
    time: "2 dakika",
    action: "Yeni yorum",
    user: "Ahmet Yılmaz",
    post: "Modern Edebiyat",
  },
  {
    time: "5 dakika",
    action: "Yeni post",
    user: "Admin",
    post: "Şiir Dünyası",
  },
  {
    time: "12 dakika",
    action: "Kullanıcı kaydı",
    user: "Fatma Demir",
    post: null,
  },
  {
    time: "25 dakika",
    action: "Post beğenisi",
    user: "Mehmet Kaya",
    post: "Roman İncelemesi",
  },
  {
    time: "35 dakika",
    action: "Yorum moderasyonu",
    user: "Admin",
    post: "Eleştiri Yazısı",
  },
];

const COLORS = ["#ea580c", "#f59e0b", "#dc2626", "#d97706", "#92400e"];

interface AnalyticsChartsProps {
  className?: string;
}

export function AnalyticsCharts({ className }: AnalyticsChartsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading">Analitik Paneli</h2>
          <p className="text-muted-foreground">
            Blogunuzun performansını ve etkileşimini takip edin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Son 7 gün</SelectItem>
              <SelectItem value="30">Son 30 gün</SelectItem>
              <SelectItem value="90">Son 3 ay</SelectItem>
              <SelectItem value="365">Son yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            İndir
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Toplam Görüntüleme</p>
              <p className="text-2xl font-bold text-blue-800">24,567</p>
              <p className="text-xs text-blue-600">Son ayın %23.1'i</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Yeni Kullanıcılar</p>
              <p className="text-2xl font-bold text-green-800">4,820</p>
              <p className="text-xs text-green-600">Son ayın %8.3'ü</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Yorumlar</p>
              <p className="text-2xl font-bold text-purple-800">856</p>
              <p className="text-xs text-purple-600">Son haftanın %15.7'si</p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Etkileşim</p>
              <p className="text-2xl font-bold text-orange-800">84.2%</p>
              <p className="text-xs text-orange-600">Son haftanın %2.5'i</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">
                Ziyaretçiler & Sayfa Görüntüleme
              </h3>
              <p className="text-sm text-muted-foreground">Aylık genel bakış</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="w-3 h-3" />
              +23.1%
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={visitorsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="visitors"
                stackId="1"
                stroke="#ea580c"
                fill="#ea580c"
                fillOpacity={0.6}
                name="Visitors"
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Page Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Posts by Category */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">
                Kategoriye Göre Gönderiler
              </h3>
              <p className="text-sm text-muted-foreground">
                İçerik dağılımı
              </p>
            </div>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={postsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="posts" fill="#ea580c" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Pie Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">Etkileşim</h3>
              <p className="text-sm text-muted-foreground">Kullanıcı etkileşimleri</p>
            </div>
            <Heart className="w-5 h-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {engagementData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-xs">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold font-heading">
                Son İşlemler
              </h3>
              <p className="text-sm text-muted-foreground">
                Site son işlemleri
              </p>
            </div>
            <Button variant="outline" size="sm">
              Tümünü Gör
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {activity.action}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.time} önce
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{activity.user}</span>
                    {activity.post && (
                      <>
                        {" • "}
                        <span>{activity.post}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
