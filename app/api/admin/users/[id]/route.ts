import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
});

// GET /api/admin/users/[id] - Kullanıcı detaylarını getir
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

    // Kullanıcıyı detaylı şekilde getir
    const userData = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            likes: true,
            savedPosts: true,
          },
        },
        posts: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                views: true,
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            isActive: true,
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("[GET /api/admin/users/[id]]:", error);
    return NextResponse.json(
      { error: "Kullanıcı bilgileri alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Kullanıcıyı güncelle
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

    const adminUser = session.user as any;
    if (adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validation
    const validatedData = userUpdateSchema.parse(body);

    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kendini admin olmaktan çıkarmasını engelle
    if (adminUser.id === id && validatedData.role === "user") {
      return NextResponse.json(
        { error: "Kendi admin rolünüzü kaldıramazsınız" },
        { status: 400 }
      );
    }

    // Email güncellemesi varsa, çakışma kontrolü
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailExists && emailExists.id !== id) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Update data hazırla
    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.email !== undefined)
      updateData.email = validatedData.email;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.banned !== undefined)
      updateData.banned = validatedData.banned;
    if (validatedData.banReason !== undefined)
      updateData.banReason = validatedData.banReason;
    if (validatedData.banExpires !== undefined) {
      updateData.banExpires = validatedData.banExpires
        ? new Date(validatedData.banExpires)
        : null;
    }

    // Ban durumu temizlenmişse ban nedenini ve süresini de temizle
    if (validatedData.banned === false) {
      updateData.banReason = null;
      updateData.banExpires = null;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Kullanıcı başarıyla güncellendi",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[PUT /api/admin/users/[id]]:", error);
    return NextResponse.json(
      { error: "Kullanıcı güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Kullanıcıyı sil (soft delete)
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

    const adminUser = session.user as any;
    if (adminUser.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gereklidir" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Kendini silmeyi engelle
    if (adminUser.id === id) {
      return NextResponse.json(
        { error: "Kendi hesabınızı silemezsiniz" },
        { status: 400 }
      );
    }

    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Başka adminleri silmeyi engelle (opsiyonel güvenlik)
    if (existingUser.role === "admin") {
      return NextResponse.json(
        { error: "Diğer admin kullanıcıları silemezsiniz" },
        { status: 400 }
      );
    }

    // Soft delete - kullanıcıyı banned yap ve email'ini değiştir
    const deletedEmail = `deleted_${Date.now()}_${
      existingUser.id
    }@deleted.local`;

    await prisma.user.update({
      where: { id },
      data: {
        banned: true,
        banReason: "Hesap admin tarafından silindi",
        email: deletedEmail, // Email'i unique constraint için değiştir
        name: "Silinmiş Kullanıcı",
        image: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kullanıcı başarıyla silindi",
    });
  } catch (error) {
    console.error("[DELETE /api/admin/users/[id]]:", error);
    return NextResponse.json(
      { error: "Kullanıcı silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
