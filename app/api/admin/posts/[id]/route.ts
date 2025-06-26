import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateSlug } from "@/lib/utils";
import {
  calculateReadingTime,
  calculateWordCount,
} from "@/lib/utils/reading-time";

// Validation schema for post updates
const postUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  introduction: z.string().optional(),
  content: z.string().optional(),
  conclusion: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "REVIEW", "SCHEDULED"]).optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  coverImage: z.string().url().optional().nullable(),
  metaTitle: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

// GET /api/admin/posts/[id] - Tek post getir
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

    // Post'u getir
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("[GET /api/admin/posts/[id]]:", error);
    return NextResponse.json(
      { error: "Post getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/posts/[id] - Post güncelle
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
    const validatedData = postUpdateSchema.parse(body);

    // Mevcut post'u kontrol et
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    // Slug güncelleme
    let slug = existingPost.slug;
    if (validatedData.title && validatedData.title !== existingPost.title) {
      slug = await generateSlug(validatedData.title);
    }

    // Tag işlemleri
    let tagOperations = {};
    if (validatedData.tags) {
      // Önce mevcut tagları sil
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Yeni tagları ekle
      if (validatedData.tags.length > 0) {
        // Mevcut tagları bul veya oluştur
        const tagPromises = validatedData.tags.map(async (tagName) => {
          let tag = await prisma.tag.findFirst({
            where: { name: tagName },
          });

          if (!tag) {
            tag = await prisma.tag.create({
              data: {
                name: tagName,
                slug: tagName.toLowerCase().replace(/\s+/g, "-"),
                color: "#6B7280",
              },
            });
          }

          return tag;
        });

        const tags = await Promise.all(tagPromises);

        // PostTag bağlantılarını oluştur
        tagOperations = {
          tags: {
            create: tags.map((tag) => ({
              tag: { connect: { id: tag.id } },
            })),
          },
        };
      }
    }

    // İçerik analizi
    let readingTime = existingPost.readingTime;
    let wordCount = existingPost.wordCount;

    if (
      validatedData.content ||
      validatedData.introduction ||
      validatedData.conclusion
    ) {
      const contents = {
        introduction:
          validatedData.introduction || existingPost.introduction || "",
        content: validatedData.content || existingPost.content,
        conclusion: validatedData.conclusion || existingPost.conclusion || "",
      };

      readingTime = calculateReadingTime(
        contents.introduction + contents.content + contents.conclusion
      );
      wordCount =
        calculateWordCount(contents.introduction) +
        calculateWordCount(contents.content) +
        calculateWordCount(contents.conclusion);
    }

    // Post'u güncelle
    const updateData: any = {
      slug,
      readingTime,
      wordCount,
      updatedAt: new Date(),
      ...tagOperations,
    };

    // Conditional field'ları ekle
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.excerpt !== undefined)
      updateData.excerpt = validatedData.excerpt;
    if (validatedData.introduction !== undefined)
      updateData.introduction = validatedData.introduction;
    if (validatedData.content) updateData.content = validatedData.content;
    if (validatedData.conclusion !== undefined)
      updateData.conclusion = validatedData.conclusion;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.categoryId)
      updateData.categoryId = validatedData.categoryId;
    if (validatedData.isFeatured !== undefined)
      updateData.isFeatured = validatedData.isFeatured;
    if (validatedData.allowComments !== undefined)
      updateData.allowComments = validatedData.allowComments;
    if (validatedData.coverImage !== undefined)
      updateData.coverImage = validatedData.coverImage;
    if (validatedData.metaTitle !== undefined)
      updateData.metaTitle = validatedData.metaTitle;
    if (validatedData.metaDescription !== undefined)
      updateData.metaDescription = validatedData.metaDescription;
    if (validatedData.ogImage !== undefined)
      updateData.ogImage = validatedData.ogImage;
    if (validatedData.status === "PUBLISHED" && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: "Post başarıyla güncellendi",
    });
  } catch (error) {
    console.error("[PUT /api/admin/posts/[id]]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Post güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts/[id] - Post sil
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

    // Post'un varlığını kontrol et
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
    }

    // İlişkili verileri sil (Prisma otomatik olarak halledecek cascade ile)
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Post başarıyla silindi",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/posts/[id]]:", error);
    return NextResponse.json(
      { error: "Post silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
