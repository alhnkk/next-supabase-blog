import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/saved-posts - Kullanıcının kaydedilmiş postlarını getir
export async function GET(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Kullanıcının kaydedilmiş postlarını getir
    const [savedPosts, totalCount] = await Promise.all([
      prisma.savedPost.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  bio: true,
                },
              },
              category: true,
              tags: {
                include: {
                  tag: true,
                },
              },
              _count: {
                select: {
                  comments: true,
                  likes: { where: { type: "LIKE" } },
                  views: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.savedPost.count({
        where: {
          userId: session.user.id,
        },
      }),
    ]);

    // Sadece post'ları döndür
    const posts = savedPosts.map((savedPost) => ({
      ...savedPost.post,
      savedAt: savedPost.createdAt,
    }));

    const response = {
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    };

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    console.error("[GET /api/saved-posts]:", error);
    return new Response(
      JSON.stringify({ error: "Kaydedilmiş postlar yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}
