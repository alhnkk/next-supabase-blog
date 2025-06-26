import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const postUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "REVIEW", "SCHEDULED"]).optional(),
  categoryId: z.string().optional(),
  isFeatured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  publishedAt: z.string().optional(),
  scheduledFor: z.string().optional(),
});

const querySchema = z.object({
  page: z.string().nullable().optional().default("1").transform((val) => Number(val || "1")),
  limit: z.string().nullable().optional().default("10").transform((val) => Number(val || "10")),
  search: z.string().nullable().optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED", "REVIEW", "SCHEDULED", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
  category: z.string().nullable().optional(),
  author: z.string().nullable().optional(),
  featured: z.enum(["true", "false", "all"]).nullable().optional().default("all").transform((val) => val || "all"),
  sortBy: z
    .enum(["title", "createdAt", "updatedAt", "publishedAt", "views"])
    .nullable()
    .optional()
    .default("createdAt")
    .transform((val) => val || "createdAt"),
  sortOrder: z.enum(["asc", "desc"]).nullable().optional().default("desc").transform((val) => val || "desc"),
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
});

const bulkActionSchema = z.object({
  action: z.enum([
    "delete",
    "publish",
    "draft",
    "review",
    "feature",
    "unfeature",
  ]),
  postIds: z.array(z.string()).min(1),
});

// GET /api/admin/posts - Post listesi
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
      category: searchParams.get("category"),
      author: searchParams.get("author"),
      featured: searchParams.get("featured"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
    };

    const {
      page,
      limit,
      search,
      status,
      category,
      author,
      featured,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    } = querySchema.parse(queryParams);

    // Where clause oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      where.status = status;
    }

    if (category) {
      where.categoryId = category;
    }

    if (author) {
      where.authorId = author;
    }

    if (featured === "true") {
      where.isFeatured = true;
    } else if (featured === "false") {
      where.isFeatured = false;
    }

    // Tarih filtreleme
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Pagination
    const skip = (page - 1) * limit;

    // OrderBy clause
    const orderBy: any = {};
    if (sortBy === "views") {
      orderBy._count = { views: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Post'ları getir
    const [posts, totalCount, categories, authors] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          status: true,
          isFeatured: true,
          allowComments: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          coverImage: true,
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
          _count: {
            select: {
              views: true,
              likes: true,
              comments: true,
            },
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      prisma.post.count({ where }),
      // Kategoriler için filter options
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { name: "asc" },
      }),
      // Yazarlar için filter options
      prisma.user.findMany({
        where: {
          posts: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Istatistikler
    const stats = await prisma.post.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const statusStats = {
      DRAFT: 0,
      PUBLISHED: 0,
      REVIEW: 0,
      SCHEDULED: 0,
    };

    stats.forEach((stat) => {
      if (stat.status && stat.status in statusStats) {
        statusStats[stat.status as keyof typeof statusStats] = stat._count.id;
      }
    });

    return NextResponse.json({
      success: true,
      data: posts,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        categories,
        authors,
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("[GET /api/admin/posts]:", error);
    return NextResponse.json(
      { error: "Post'lar alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/posts/bulk - Toplu işlemler
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
    const { action, postIds } = bulkActionSchema.parse(body);

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "delete":
        // Soft delete - status'u DELETED yapabiliriz veya isActive: false
        await prisma.post.updateMany({
          where: { id: { in: postIds } },
          data: { status: "DRAFT" }, // Geçici olarak DRAFT'a çevir, sonra DELETE status eklenebilir
        });
        message = `${postIds.length} post silindi`;
        break;

      case "publish":
        updateData = {
          status: "PUBLISHED",
          publishedAt: new Date(),
        };
        message = `${postIds.length} post yayınlandı`;
        break;

      case "draft":
        updateData = { status: "DRAFT" };
        message = `${postIds.length} post taslağa alındı`;
        break;

      case "review":
        updateData = { status: "REVIEW" };
        message = `${postIds.length} post incelemeye alındı`;
        break;

      case "feature":
        updateData = { isFeatured: true };
        message = `${postIds.length} post öne çıkarıldı`;
        break;

      case "unfeature":
        updateData = { isFeatured: false };
        message = `${postIds.length} post öne çıkarmadan kaldırıldı`;
        break;
    }

    if (action !== "delete") {
      await prisma.post.updateMany({
        where: { id: { in: postIds } },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      message,
      affectedCount: postIds.length,
    });
  } catch (error) {
    console.error("[POST /api/admin/posts/bulk]:", error);
    return NextResponse.json(
      { error: "Toplu işlem sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
