import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .optional()
    .default("#6B7280"),
});

const querySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
  status: z.enum(["all"]).optional().default("all"),
  sortBy: z
    .enum(["name", "createdAt", "postCount", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const bulkActionSchema = z.object({
  action: z.enum(["delete"]),
  tagIds: z.array(z.string()).min(1),
});

// GET /api/admin/tags - Tag listesi
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

    const { page, limit, search, sortBy, sortOrder } =
      querySchema.parse(queryParams);

    // Where clause oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // OrderBy clause
    const orderBy: any = {};
    if (sortBy === "postCount") {
      orderBy.posts = { _count: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Tag'ları getir
    const [tags, totalCount] = await Promise.all([
      prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        },
      }),
      prisma.tag.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const statusStats = {
      total: totalCount,
    };

    return NextResponse.json({
      success: true,
      data: tags,
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
    console.error("[GET /api/admin/tags]:", error);
    return NextResponse.json(
      { error: "Tag'lar alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/tags - Yeni tag oluştur
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Bulk action kontrolü
    if (body.action && body.tagIds) {
      const { action, tagIds } = bulkActionSchema.parse(body);

      switch (action) {
        case "delete":
          // Tag kullanımda mı kontrol et
          const tagsInUse = await prisma.tag.findMany({
            where: {
              id: { in: tagIds },
              posts: { some: {} },
            },
            select: { id: true, name: true },
          });

          if (tagsInUse.length > 0) {
            return NextResponse.json(
              {
                error: `Silmeye çalıştığınız tag'lar post'larda kullanılıyor: ${tagsInUse
                  .map((t) => t.name)
                  .join(", ")}`,
                details: tagsInUse,
              },
              { status: 400 }
            );
          }

          // Post-Tag ilişkilerini sil
          await prisma.postTag.deleteMany({
            where: { tagId: { in: tagIds } },
          });

          // Tag'ları sil
          await prisma.tag.deleteMany({
            where: { id: { in: tagIds } },
          });

          return NextResponse.json({
            success: true,
            message: `${tagIds.length} tag silindi`,
            affectedCount: tagIds.length,
          });
      }
    }

    // Yeni tag oluşturma
    const validatedData = tagCreateSchema.parse(body);

    // Slug kontrolü
    const existingSlug = await prisma.tag.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Name kontrolü
    const existingName = await prisma.tag.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "Bu tag adı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: validatedData,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
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
      data: tag,
      message: "Tag başarıyla oluşturuldu",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı", details: error.errors },
        { status: 400 }
      );
    }

    console.error("[POST /api/admin/tags]:", error);
    return NextResponse.json(
      { error: "Tag oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
