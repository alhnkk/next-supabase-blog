import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const tagUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional(),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/tags/[id] - Tag detaylarını getir
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

    // Tag'ı detaylı şekilde getir
    const tag = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          where: {
            post: { status: "PUBLISHED" },
          },
          select: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                createdAt: true,
                author: {
                  select: {
                    name: true,
                  },
                },
                _count: {
                  select: {
                    views: true,
                    likes: true,
                  },
                },
              },
            },
          },
          orderBy: { post: { createdAt: "desc" } },
          take: 10,
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: "Tag bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("[GET /api/admin/tags/[id]]:", error);
    return NextResponse.json(
      { error: "Tag bilgileri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tags/[id] - Tag'ı güncelle
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
    const validatedData = tagUpdateSchema.parse(body);

    // Tag'ın varlığını kontrol et
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag bulunamadı" }, { status: 404 });
    }

    // Slug güncellemesi varsa, çakışma kontrolü
    if (validatedData.slug && validatedData.slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug: validatedData.slug },
      });

      if (slugExists && slugExists.id !== id) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Name güncellemesi varsa, çakışma kontrolü
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const nameExists = await prisma.tag.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: "insensitive",
          },
          id: { not: id },
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Bu tag adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Update data hazırla
    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.color !== undefined)
      updateData.color = validatedData.color;

    // Güncelle
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedTag,
      message: "Tag başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/admin/tags/[id]]:", error);
    return NextResponse.json(
      { error: "Tag güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tags/[id] - Tag'ı sil
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

    // Tag'ın varlığını kontrol et
    const existingTag = await prisma.tag.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existingTag) {
      return NextResponse.json({ error: "Tag bulunamadı" }, { status: 404 });
    }

    // Tag'ın kullanımda olup olmadığını kontrol et
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        {
          error: `"${existingTag.name}" tag'ı ${existingTag._count.posts} post'ta kullanılıyor. Önce bu post'lardan bu tag'ı kaldırın.`,
          inUse: true,
          postCount: existingTag._count.posts,
        },
        { status: 400 }
      );
    }

    // Transaction ile sil
    await prisma.$transaction(async (tx) => {
      // Post-Tag ilişkilerini sil (zaten olmayacak ama güvenlik için)
      await tx.postTag.deleteMany({
        where: { tagId: id },
      });

      // Tag'ı sil
      await tx.tag.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `"${existingTag.name}" tag'ı başarıyla silindi`,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/tags/[id]]:", error);
    return NextResponse.json(
      { error: "Tag silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
