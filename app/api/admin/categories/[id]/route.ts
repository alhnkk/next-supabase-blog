import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .optional(),
  isActive: z.boolean().optional(),
});

// GET /api/admin/categories/[id] - Kategori detaylarını getir
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

    // Kategoriyi detaylı şekilde getir
    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          where: { status: "PUBLISHED" },
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
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("[GET /api/admin/categories/[id]]:", error);
    return NextResponse.json(
      { error: "Kategori bilgileri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories/[id] - Kategoriyi güncelle
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
    const validatedData = categoryUpdateSchema.parse(body);

    // Kategorinin varlığını kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Slug güncellemesi varsa, çakışma kontrolü
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
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
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const nameExists = await prisma.category.findFirst({
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
          { error: "Bu kategori adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Update data hazırla
    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.color !== undefined)
      updateData.color = validatedData.color;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;

    // Güncelle
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        isActive: true,
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
      data: updatedCategory,
      message: "Kategori başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/admin/categories/[id]]:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Kategoriyi sil
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

    // Kategorinin varlığını kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Kategorinin kullanımda olup olmadığını kontrol et
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        {
          error: `"${existingCategory.name}" kategorisi ${existingCategory._count.posts} post'ta kullanılıyor. Önce bu post'ları başka kategoriye taşıyın.`,
          inUse: true,
          postCount: existingCategory._count.posts,
        },
        { status: 400 }
      );
    }

    // Kategoriyi sil
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `"${existingCategory.name}" kategorisi başarıyla silindi`,
    });
  } catch (error) {
    console.error("[DELETE /api/admin/categories/[id]]:", error);
    return NextResponse.json(
      { error: "Kategori silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
