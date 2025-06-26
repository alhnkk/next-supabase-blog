import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PUT /api/comments/[id] - Update comment
export async function PUT(
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

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: "İçerik gereklidir" }), {
        status: 400,
      });
    }

    if (content.length > 500) {
      return new Response(
        JSON.stringify({ error: "Yorum 500 karakterden uzun olamaz" }),
        { status: 400 }
      );
    }

    // Await params and find comment
    const { id } = await params;
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return new Response(JSON.stringify({ error: "Yorum bulunamadı" }), {
        status: 404,
      });
    }

    // Check if user owns the comment or is admin
    const isOwner = existingComment.authorId === session.user.id;
    const isAdmin = (session.user as any).isAdmin;

    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Bu yorumu düzenleme yetkiniz yok" }),
        { status: 403 }
      );
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date(),
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

    const formattedComment = {
      ...updatedComment,
      likeCount: updatedComment._count.likes,
    };

    return new Response(JSON.stringify(formattedComment), { status: 200 });
  } catch (error) {
    console.error("[PUT /api/comments/[id]]:", error);
    return new Response(
      JSON.stringify({ error: "Yorum güncellenirken hata oluştu" }),
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
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

    // Await params and find comment
    const { id } = await params;
    const existingComment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!existingComment) {
      return new Response(JSON.stringify({ error: "Yorum bulunamadı" }), {
        status: 404,
      });
    }

    // Check if user owns the comment or is admin
    const isOwner = existingComment.authorId === session.user.id;
    const isAdmin = (session.user as any).isAdmin;

    if (!isOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Bu yorumu silme yetkiniz yok" }),
        { status: 403 }
      );
    }

    // Soft delete - just mark as inactive
    await prisma.comment.update({
      where: { id },
      data: { isActive: false },
    });

    return new Response(
      JSON.stringify({ message: "Yorum başarıyla silindi" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/comments/[id]]:", error);
    return new Response(
      JSON.stringify({ error: "Yorum silinirken hata oluştu" }),
      { status: 500 }
    );
  }
}
