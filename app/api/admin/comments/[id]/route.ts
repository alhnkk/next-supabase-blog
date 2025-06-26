import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const commentUpdateSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/comments/[id] - Yorum detaylarını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Yorumu detaylı şekilde getir
    const comment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        isActive: true,
        isEdited: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
        replies: {
          where: { isActive: true },
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
          take: 10,
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("[GET /api/admin/comments/[id]]:", error);
    return NextResponse.json(
      { error: "Yorum bilgileri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/comments/[id] - Yorumu güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Validation
    const validatedData = commentUpdateSchema.parse(body);

    // Yorumun varlığını kontrol et
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { id: true, content: true, isActive: true, isEdited: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Update data hazırla
    const updateData: any = {};

    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
      updateData.isEdited = true; // İçerik değiştirildiyse düzenlendi olarak işaretle
    }
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;

    // Güncelle
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        content: true,
        isActive: true,
        isEdited: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedComment,
      message: "Yorum başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/admin/comments/[id]]:", error);
    return NextResponse.json(
      { error: "Yorum güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/comments/[id] - Yorumu sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Yorumun varlığını kontrol et
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        content: true,
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!existingComment) {
      return NextResponse.json({ error: "Yorum bulunamadı" }, { status: 404 });
    }

    // Transaction ile sil (cascade handling)
    await prisma.$transaction(async (tx) => {
      // Önce child yorumları soft delete yap
      if (existingComment._count.replies > 0) {
        await tx.comment.updateMany({
          where: { parentId: id },
          data: {
            isActive: false,
            content: "[Bu yorum silinmiştir]",
          },
        });
      }

      // Likes'ları sil
      await tx.like.deleteMany({
        where: { commentId: id },
      });

      // Ana yorumu soft delete yap
      await tx.comment.update({
        where: { id },
        data: {
          isActive: false,
          content: "[Bu yorum silinmiştir]",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Yorum başarıyla silindi",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/comments/[id]]:", error);
    return NextResponse.json(
      { error: "Yorum silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
