import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schemas
const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
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
  role: z
    .enum(["admin", "user", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
  status: z
    .enum(["active", "banned", "all"])
    .nullable()
    .optional()
    .default("all")
    .transform((val) => val || "all"),
  sortBy: z
    .enum(["name", "email", "createdAt", "updatedAt"])
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

// GET /api/admin/users - Kullanıcıları listele
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
      role: searchParams.get("role"),
      status: searchParams.get("status"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const { page, limit, search, role, status, sortBy, sortOrder } =
      querySchema.parse(queryParams);

    // Where clause oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role !== "all") {
      where.role = role;
    }

    if (status === "active") {
      where.banned = { not: true };
    } else if (status === "banned") {
      where.banned = true;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // OrderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Kullanıcıları getir
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/users]:", error);
    return NextResponse.json(
      { error: "Kullanıcılar alınırken hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Yeni kullanıcı oluştur (opsiyonel)
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
    const { name, email, role = "user" } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "İsim ve email gereklidir" },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Yeni kullanıcı oluştur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        emailVerified: true, // Admin tarafından oluşturulduğu için verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Kullanıcı başarıyla oluşturuldu",
    });
  } catch (error) {
    console.error("[POST /api/admin/users]:", error);
    return NextResponse.json(
      { error: "Kullanıcı oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
