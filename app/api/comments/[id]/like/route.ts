import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/comments/[id]/like - Toggle comment like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type = "LIKE" } = body; // LIKE or DISLIKE

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return new Response(JSON.stringify({ error: "Yorum bulunamadı" }), {
        status: 404,
      });
    }

    // Check if user already liked/disliked this comment
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId_type: {
          userId: session.user.id,
          commentId: id,
          type,
        },
      },
    });

    let action: "added" | "removed" = "added";

    if (existingLike) {
      // Remove existing like/dislike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      action = "removed";
    } else {
      // Remove opposite reaction if exists
      const oppositeType = type === "LIKE" ? "DISLIKE" : "LIKE";
      const oppositeReaction = await prisma.like.findUnique({
        where: {
          userId_commentId_type: {
            userId: session.user.id,
            commentId: id,
            type: oppositeType,
          },
        },
      });

      if (oppositeReaction) {
        await prisma.like.delete({
          where: { id: oppositeReaction.id },
        });
      }

      // Add new like/dislike
      await prisma.like.create({
        data: {
          userId: session.user.id,
          commentId: id,
          type,
        },
      });
    }

    // Get updated counts
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.like.count({
        where: {
          commentId: id,
          type: "LIKE",
        },
      }),
      prisma.like.count({
        where: {
          commentId: id,
          type: "DISLIKE",
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        action,
        type,
        likeCount,
        dislikeCount,
        userReaction: action === "added" ? type : null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/comments/[id]/like]:", error);
    return new Response(
      JSON.stringify({ error: "Beğeni işlemi sırasında hata oluştu" }),
      { status: 500 }
    );
  }
}

// GET /api/comments/[id]/like - Get like status for user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user's reaction to this comment
    const userReaction = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        commentId: id,
      },
      select: { type: true },
    });

    // Get total counts
    const [likeCount, dislikeCount] = await Promise.all([
      prisma.like.count({
        where: {
          commentId: id,
          type: "LIKE",
        },
      }),
      prisma.like.count({
        where: {
          commentId: id,
          type: "DISLIKE",
        },
      }),
    ]);

    return new Response(
      JSON.stringify({
        likeCount,
        dislikeCount,
        userReaction: userReaction?.type || null,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/comments/[id]/like]:", error);
    return new Response(
      JSON.stringify({ error: "Beğeni durumu alınırken hata oluştu" }),
      { status: 500 }
    );
  }
}
