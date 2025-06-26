import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/[id]/posts - Kullanıcının yazdığı postları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;
    const skip = (page - 1) * limit;

    // Kullanıcının varlığını kontrol et
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Kullanıcı bulunamadı" }), {
        status: 404,
      });
    }

    if (!user.isActive) {
      return new Response(
        JSON.stringify({ error: "Bu kullanıcı aktif değil" }),
        { status: 403 }
      );
    }

    // Kullanıcının postlarını getir
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: {
          authorId: id,
          status: "PUBLISHED",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
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
        orderBy: {
          publishedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.post.count({
        where: {
          authorId: id,
          status: "PUBLISHED",
        },
      }),
    ]);

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
    console.error("[GET /api/user/[id]/posts]:", error);
    return new Response(
      JSON.stringify({ error: "Kullanıcı postları yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}
