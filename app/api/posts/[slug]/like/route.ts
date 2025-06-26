import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/posts/[slug]/like - Add/remove like/dislike
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Auth kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    const { slug } = await params;
    const { type } = await request.json(); // "LIKE" or "DISLIKE"

    if (!type || !["LIKE", "DISLIKE"].includes(type)) {
      return new Response(JSON.stringify({ error: "Geçersiz beğeni türü" }), {
        status: 400,
      });
    }

    // Post'u slug ile bul
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        allowLikes: true,
        status: true,
      },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    if (!post.allowLikes) {
      return new Response(
        JSON.stringify({ error: "Bu post için beğeni sistemi kapalı" }),
        { status: 403 }
      );
    }

    if (post.status !== "PUBLISHED") {
      return new Response(
        JSON.stringify({
          error: "Sadece yayınlanmış postları beğenebilirsiniz",
        }),
        { status: 403 }
      );
    }

    // Mevcut beğeniyi kontrol et
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId_type: {
          userId: session.user.id,
          postId: post.id,
          type,
        },
      },
    });

    let action = "added";

    if (existingLike) {
      // Mevcut beğeniyi kaldır
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      action = "removed";
    } else {
      // Ters tepkiyi kaldır (LIKE varsa DISLIKE'ı sil, vice versa)
      const oppositeType = type === "LIKE" ? "DISLIKE" : "LIKE";
      const oppositeReaction = await prisma.like.findUnique({
        where: {
          userId_postId_type: {
            userId: session.user.id,
            postId: post.id,
            type: oppositeType,
          },
        },
      });

      if (oppositeReaction) {
        await prisma.like.delete({
          where: { id: oppositeReaction.id },
        });
      }

      // Yeni beğeni ekle
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: post.id,
          type,
        },
      });
    }

    // Güncel sayıları al
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.like.count({
        where: {
          postId: post.id,
          type: "LIKE",
        },
      }),
      prisma.like.count({
        where: {
          postId: post.id,
          type: "DISLIKE",
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        type,
        likeCount,
        dislikeCount,
        userReaction: action === "added" ? type : null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/posts/[slug]/like]:", error);
    return new Response(
      JSON.stringify({ error: "Beğeni işlemi sırasında hata oluştu" }),
      { status: 500 }
    );
  }
}

// GET /api/posts/[slug]/like - Get like counts and user reaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Post'u slug ile bul
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    // Session kontrolü (optional)
    const session = await auth.api.getSession({ headers: request.headers });

    // Like/dislike sayılarını al
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.like.count({
        where: {
          postId: post.id,
          type: "LIKE",
        },
      }),
      prisma.like.count({
        where: {
          postId: post.id,
          type: "DISLIKE",
        },
      }),
    ]);

    // Kullanıcının tepkisini kontrol et (giriş yapmışsa)
    let userReaction = null;
    if (session?.user) {
      const reaction = await prisma.like.findFirst({
        where: {
          postId: post.id,
          userId: session.user.id,
        },
        select: { type: true },
      });
      userReaction = reaction?.type || null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        likeCount,
        dislikeCount,
        userReaction,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/posts/[slug]/like]:", error);
    return new Response(
      JSON.stringify({ error: "Like bilgileri yüklenirken hata oluştu" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
