import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!postId) {
      return new Response(JSON.stringify({ error: "PostId gereklidir" }), {
        status: 400,
      });
    }

    const skip = (page - 1) * limit;

    // Get comments with nested replies
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        isActive: true,
        parentId: null, // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isAdmin: true,
          },
        },
        replies: {
          where: { isActive: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                isAdmin: true,
              },
            },
            _count: {
              select: {
                likes: { where: { type: "LIKE" } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            likes: { where: { type: "LIKE" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Format comments with like counts
    const formattedComments = comments.map((comment) => ({
      ...comment,
      likeCount: comment._count.likes,
      replies: comment.replies.map((reply) => ({
        ...reply,
        likeCount: reply._count.likes,
      })),
    }));

    // Get total count
    const totalComments = await prisma.comment.count({
      where: {
        postId,
        isActive: true,
        parentId: null,
      },
    });

    return new Response(
      JSON.stringify({
        comments: formattedComments,
        pagination: {
          page,
          limit,
          total: totalComments,
          totalPages: Math.ceil(totalComments / limit),
          hasMore: skip + limit < totalComments,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/comments]:", error);
    return new Response(
      JSON.stringify({ error: "Yorumlar yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, postId, parentId } = body;

    // Validate required fields
    if (!content || !postId) {
      return new Response(
        JSON.stringify({ error: "İçerik ve postId gereklidir" }),
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return new Response(
        JSON.stringify({ error: "Yorum 500 karakterden uzun olamaz" }),
        { status: 400 }
      );
    }

    // Check if post exists and allows comments
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { allowComments: true },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    if (!post.allowComments) {
      return new Response(
        JSON.stringify({ error: "Bu yazıda yorumlar kapatılmıştır" }),
        { status: 403 }
      );
    }

    // If replying to a comment, check if parent exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return new Response(
          JSON.stringify({ error: "Yanıtlanacak yorum bulunamadı" }),
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        parentId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isAdmin: true,
          },
        },
        _count: {
          select: {
            likes: { where: { type: "LIKE" } },
          },
        },
      },
    });

    // Format response
    const formattedComment = {
      ...comment,
      likeCount: comment._count.likes,
    };

    return new Response(JSON.stringify(formattedComment), { status: 201 });
  } catch (error) {
    console.error("[POST /api/comments]:", error);
    return new Response(
      JSON.stringify({ error: "Yorum oluşturulurken hata oluştu" }),
      { status: 500 }
    );
  }
}
