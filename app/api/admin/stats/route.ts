import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats - Admin dashboard istatistikleri
export async function GET(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const user = session.user as any;
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    // Paralel olarak tüm istatistikleri getir
    const [
      totalPosts,
      totalUsers,
      totalComments,
      totalViews,
      totalLikes,
      publishedPosts,
      draftPosts,
      activeUsers,
      pendingComments,
      monthlyPosts,
      weeklyViews,
      weeklyUsers,
      topCategories,
      recentActivity,
    ] = await Promise.all([
      // Toplam post sayısı
      prisma.post.count(),

      // Toplam kullanıcı sayısı
      prisma.user.count(),

      // Toplam yorum sayısı
      prisma.comment.count({
        where: { isActive: true },
      }),

      // Toplam görüntülenme sayısı
      prisma.view.count(),

      // Toplam beğeni sayısı
      prisma.like.count({
        where: { type: "LIKE" },
      }),

      // Yayınlanmış post sayısı
      prisma.post.count({
        where: { status: "PUBLISHED" },
      }),

      // Taslak post sayısı
      prisma.post.count({
        where: { status: "DRAFT" },
      }),

      // Aktif kullanıcı sayısı (son 30 gün)
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Bekleyen yorum sayısı
      prisma.comment.count({
        where: {
          isActive: true,
          // Burada moderation durumu eklenebilir
        },
      }),

      // Bu ayki post sayısı
      prisma.post.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // Bu haftaki görüntülenme sayısı
      prisma.view.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Bu haftaki yeni kullanıcı sayısı
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // En popüler kategoriler
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              posts: {
                where: { status: "PUBLISHED" },
              },
            },
          },
        },
        orderBy: {
          posts: {
            _count: "desc",
          },
        },
        take: 5,
      }),

      // Son aktiviteler (son 10 post)
      prisma.post.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    // Önceki dönemle karşılaştırma için gerekli hesaplamalar
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [lastMonthPosts, lastWeekViews, lastWeekUsers] = await Promise.all([
      prisma.post.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      prisma.view.count({
        where: {
          createdAt: {
            gte: lastWeek,
            lt: thisWeek,
          },
        },
      }),

      prisma.user.count({
        where: {
          createdAt: {
            gte: lastWeek,
            lt: thisWeek,
          },
        },
      }),
    ]);

    // Değişim yüzdelerini hesapla
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalPosts,
      totalUsers,
      totalComments,
      totalViews,
      totalLikes,
      publishedPosts,
      draftPosts,
      activeUsers,
      pendingComments,
      monthlyPosts,
      weeklyViews,
      weeklyUsers,

      // Değişim yüzdeleri
      changes: {
        monthlyPosts: calculateChange(monthlyPosts, lastMonthPosts),
        weeklyViews: calculateChange(weeklyViews, lastWeekViews),
        weeklyUsers: calculateChange(weeklyUsers, lastWeekUsers),
      },

      // Ek veriler
      topCategories: topCategories.map((cat) => ({
        name: cat.name,
        postCount: cat._count.posts,
      })),

      recentActivity,

      // Hesaplanan oranlar
      publishRatio:
        totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0,
      engagementRate:
        totalViews > 0 ? Math.round((totalLikes / totalViews) * 100) : 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]:", error);
    return NextResponse.json(
      { error: "İstatistikler alınırken hata oluştu" },
      { status: 500 }
    );
  }
}
