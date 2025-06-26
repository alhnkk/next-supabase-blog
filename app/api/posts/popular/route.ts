import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;

    // PERFORMANS OPTİMİZE EDİLDİ - Sadece gerekli alanları select et
    const popularPosts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        _count: {
          select: {
            views: true,
            likes: {
              where: { type: "LIKE" },
            },
            comments: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [
        {
          views: {
            _count: "desc",
          },
        },
        {
          likes: {
            _count: "desc",
          },
        },
        { publishedAt: "desc" },
      ],
      take: limit,
    });

    return Response.json({
      data: popularPosts,
      success: true,
    });
  } catch (error) {
    console.error("[GET /api/posts/popular]:", error);
    return Response.json(
      {
        error: "Popüler postlar yüklenirken bir hata oluştu",
        success: false,
      },
      { status: 500 }
    );
  }
}
