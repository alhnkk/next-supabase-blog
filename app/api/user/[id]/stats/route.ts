import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/[id]/stats - Kullanıcı istatistiklerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kullanıcının var olup olmadığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return new Response(JSON.stringify({ error: "Kullanıcı bulunamadı" }), {
        status: 404,
      });
    }

    // Temel istatistikler
    const [
      totalViews,
      totalLikes,
      totalComments,
      postsThisMonth,
      popularPost,
      totalPosts,
    ] = await Promise.all([
      // Toplam görüntüleme sayısı
      prisma.view.count({
        where: {
          post: {
            authorId: id,
            status: "PUBLISHED",
          },
        },
      }),

      // Toplam beğeni sayısı
      prisma.like.count({
        where: {
          type: "LIKE",
          post: {
            authorId: id,
            status: "PUBLISHED",
          },
        },
      }),

      // Toplam yorum sayısı
      prisma.comment.count({
        where: {
          post: {
            authorId: id,
            status: "PUBLISHED",
          },
          isActive: true,
        },
      }),

      // Bu ay yayımlanan post sayısı
      prisma.post.count({
        where: {
          authorId: id,
          status: "PUBLISHED",
          publishedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),

      // En popüler post
      prisma.post.findFirst({
        where: {
          authorId: id,
          status: "PUBLISHED",
        },
        select: {
          title: true,
          slug: true,
          _count: {
            select: {
              views: true,
            },
          },
        },
        orderBy: {
          views: {
            _count: "desc",
          },
        },
      }),

      // Toplam post sayısı
      prisma.post.count({
        where: {
          authorId: id,
          status: "PUBLISHED",
        },
      }),
    ]);

    // Engagement rate hesaplama (basit formül: (beğeni + yorum) / görüntüleme)
    const engagementRate =
      totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    // Aylık performans (son 6 ay)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const [monthPosts, monthViews, monthLikes] = await Promise.all([
        prisma.post.count({
          where: {
            authorId: id,
            status: "PUBLISHED",
            publishedAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.view.count({
          where: {
            post: {
              authorId: id,
              status: "PUBLISHED",
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prisma.like.count({
          where: {
            type: "LIKE",
            post: {
              authorId: id,
              status: "PUBLISHED",
            },
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      monthlyData.push({
        month: date.toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "short",
        }),
        posts: monthPosts,
        views: monthViews,
        likes: monthLikes,
      });
    }

    const stats = {
      totalViews,
      totalLikes,
      totalComments,
      totalPosts,
      postsThisMonth,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      popularPost: popularPost
        ? {
            title: popularPost.title,
            slug: popularPost.slug,
            views: popularPost._count.views,
          }
        : null,
      monthlyData,
      summary: {
        avgViewsPerPost:
          totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0,
        avgLikesPerPost:
          totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
        avgCommentsPerPost:
          totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0,
      },
    };

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (error) {
    console.error("[GET /api/user/[id]/stats]:", error);
    return new Response(
      JSON.stringify({ error: "İstatistikler yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}
