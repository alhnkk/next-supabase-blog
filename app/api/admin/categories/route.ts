import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .optional()
    .default("#3B82F6"),
  icon: z.string().max(10).optional().default("📁"),
  isActive: z.boolean().optional().default(true),
});

const querySchema = z.object({
  page: z
    .string()
    .nullable()
    .optional()
    .default("1")
    .transform((val) => Number(val || "1")),
  limit: z
    .string()
    .nullable()
    .optional()
    .default("10")
    .transform((val) => Number(val || "10")),
  search: z
    .string()
    .nullable()
    .optional()
    .transform((val) => val || undefined),
  status: z
    .enum(["active", "inactive", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
  sortBy: z
    .enum(["name", "createdAt", "postCount", "updatedAt"])
    .nullable()
    .optional()
    .default("createdAt")
    .transform((val) => val || "createdAt"),
  sortOrder: z
    .enum(["asc", "desc"])
    .nullable()
    .optional()
    .default("desc")
    .transform((val) => val || "desc"),
});

const bulkActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete"]),
  categoryIds: z.array(z.string()).min(1),
});

// GET /api/admin/categories - Kategori listesi
export async function GET(request: NextRequest) {
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

    // Query parametrelerini parse et
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const { page, limit, search, status, sortBy, sortOrder } =
      querySchema.parse(queryParams);

    // Where clause oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.isActive = status === "active";
    }

    // Pagination
    const skip = (page - 1) * limit;

    // OrderBy clause
    const orderBy: any = {};
    if (sortBy === "postCount") {
      orderBy._count = { posts: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Kategorileri getir
    const [categories, totalCount] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      }),
      prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // İstatistikler
    const stats = await prisma.category.groupBy({
      by: ["isActive"],
      _count: {
        id: true,
      },
    });

    const statusStats = {
      total: totalCount,
      active: 0,
      inactive: 0,
    };

    stats.forEach((stat) => {
      if (stat.isActive) {
        statusStats.active += stat._count.id;
      } else {
        statusStats.inactive += stat._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: categories,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("[GET /api/admin/categories]:", error);
    return NextResponse.json(
      { error: "Kategoriler alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Yeni kategori oluştur
export async function POST(request: NextRequest) {
  try {
    // Admin yetkisi kontrolü - Database bağlantı sorunları için try-catch
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (authError) {
      console.error("Auth session error:", authError);
      return NextResponse.json(
        { error: "Oturum doğrulanamadı. Lütfen tekrar giriş yapın." },
        { status: 401 }
      );
    }

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

    const body = await request.json();

    // Bulk action kontrolü
    if (body.action && body.categoryIds) {
      const { action, categoryIds } = bulkActionSchema.parse(body);

      let updateData: any = {};
      let message = "";

      switch (action) {
        case "activate":
          updateData = { isActive: true };
          message = `${categoryIds.length} kategori aktif edildi`;
          break;

        case "deactivate":
          updateData = { isActive: false };
          message = `${categoryIds.length} kategori pasif edildi`;
          break;

        case "delete":
          // Kategori kullanımda mı kontrol et
          const categoriesInUse = await prisma.category.findMany({
            where: {
              id: { in: categoryIds },
              posts: { some: {} },
            },
            select: { id: true, name: true },
          });

          if (categoriesInUse.length > 0) {
            return NextResponse.json(
              {
                error: `Silmeye çalıştığınız kategoriler post'larda kullanılıyor: ${categoriesInUse
                  .map((c) => c.name)
                  .join(", ")}`,
                details: categoriesInUse,
              },
              { status: 400 }
            );
          }

          await prisma.category.deleteMany({
            where: { id: { in: categoryIds } },
          });

          return NextResponse.json({
            success: true,
            message: `${categoryIds.length} kategori silindi`,
            affectedCount: categoryIds.length,
          });
      }

      await prisma.category.updateMany({
        where: { id: { in: categoryIds } },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message,
        affectedCount: categoryIds.length,
      });
    }

    // Yeni kategori oluşturma
    const validatedData = categoryCreateSchema.parse(body);

    // Database işlemlerini try-catch ile koru
    try {
      // Slug kontrolü
      const existingSlug = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "Bu slug zaten kullanılıyor" },
          { status: 400 }
        );
      }

      // Name kontrolü
      const existingName = await prisma.category.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: "insensitive",
          },
        },
      });

      if (existingName) {
        return NextResponse.json(
          { error: "Bu kategori adı zaten kullanılıyor" },
          { status: 400 }
        );
      }

      const category = await prisma.category.create({
        data: validatedData,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: category,
        message: "Kategori başarıyla oluşturuldu",
      });
    } catch (dbError: any) {
      console.error("Database error in category creation:", dbError);

      // Prisma specific errors
      if (dbError.code === "P1001") {
        return NextResponse.json(
          {
            error:
              "Veritabanı bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.",
          },
          { status: 503 }
        );
      }

      if (dbError.code === "P2002") {
        return NextResponse.json(
          { error: "Bu kategori zaten mevcut." },
          { status: 400 }
        );
      }

      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/admin/categories]:", error);
    return NextResponse.json(
      { error: "Kategori oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
