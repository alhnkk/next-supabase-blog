import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
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
  search: z.string().nullable().optional(),
  status: z
    .enum(["active", "inactive", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
  postId: z.string().nullable().optional(),
  authorId: z.string().nullable().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "content", "likes"])
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
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
});

const bulkActionSchema = z.object({
  action: z.enum(["approve", "block", "delete"]),
  commentIds: z.array(z.string()).min(1),
});

// GET /api/admin/comments - Yorum listesi
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
      postId: searchParams.get("postId"),
      authorId: searchParams.get("authorId"),
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
      postId,
      authorId,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    } = querySchema.parse(queryParams);

    // Where clause oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { content: { contains: search, mode: "insensitive" } },
        { author: { name: { contains: search, mode: "insensitive" } } },
        { author: { email: { contains: search, mode: "insensitive" } } },
        { post: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status !== "all") {
      switch (status) {
        case "active":
          where.isActive = true;
          break;
        case "inactive":
          where.isActive = false;
          break;
      }
    }

    if (postId) {
      where.postId = postId;
    }

    if (authorId) {
      where.authorId = authorId;
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
    if (sortBy === "likes") {
      orderBy._count = { likes: sortOrder };
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Yorumları getir
    const [comments, totalCount, posts, authors] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
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
        },
      }),
      prisma.comment.count({ where }),
      // Posts için filter options
      prisma.post.findMany({
        where: {
          comments: {
            some: {},
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { title: "asc" },
        take: 50, // Limit for performance
      }),
      // Authors için filter options
      prisma.user.findMany({
        where: {
          comments: {
            some: {},
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { name: "asc" },
        take: 50, // Limit for performance
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // İstatistikler
    const stats = await prisma.comment.groupBy({
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
      data: comments,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        posts,
        authors,
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("[GET /api/admin/comments]:", error);
    return NextResponse.json(
      { error: "Yorumlar alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/comments/bulk - Toplu işlemler
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
    const { action, commentIds } = bulkActionSchema.parse(body);

    let updateData: any = {};
    let message = "";

    switch (action) {
      case "approve":
        updateData = {
          isActive: true,
        };
        message = `${commentIds.length} yorum onaylandı`;
        break;

      case "block":
        updateData = {
          isActive: false,
        };
        message = `${commentIds.length} yorum engellendi`;
        break;

      case "delete":
        // Soft delete - yorumları pasif yap
        await prisma.comment.updateMany({
          where: { id: { in: commentIds } },
          data: {
            isActive: false,
            content: "[Bu yorum silinmiştir]",
          },
        });
        message = `${commentIds.length} yorum silindi`;
        return NextResponse.json({
          success: true,
          message,
          affectedCount: commentIds.length,
        });
    }

    await prisma.comment.updateMany({
      where: { id: { in: commentIds } },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message,
      affectedCount: commentIds.length,
    });
  } catch (error) {
    console.error("[POST /api/admin/comments/bulk]:", error);
    return NextResponse.json(
      { error: "Toplu işlem sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
