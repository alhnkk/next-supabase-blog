import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";

// Validation schemas
const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Kategori adı en az 2 karakter olmalıdır")
    .max(50, "Kategori adı en fazla 50 karakter olabilir")
    .trim(),
  slug: z
    .string()
    .min(2, "Slug en az 2 karakter olmalıdır")
    .max(50, "Slug en fazla 50 karakter olabilir")
    .regex(/^[a-z0-9-]+$/, "Slug sadece küçük harf, rakam ve tire içerebilir")
    .trim(),
  description: z
    .string()
    .max(200, "Açıklama en fazla 200 karakter olabilir")
    .optional()
    .nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli bir hex renk kodu giriniz")
    .default("#f59e0b"),
  icon: z
    .string()
    .max(50, "İkon adı en fazla 50 karakter olabilir")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

const querySchema = z.object({
  page: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 1))
    .pipe(z.number().min(1).default(1)),
  limit: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val) : 10))
    .pipe(z.number().min(1).max(100).default(10)),
  search: z
    .string()
    .nullish()
    .transform((val) => val || undefined),
  isActive: z
    .string()
    .nullish()
    .transform((val) =>
      val === "true" ? true : val === "false" ? false : undefined
    ),
  includePosts: z
    .string()
    .nullish()
    .transform((val) => val === "true"),
  sortBy: z
    .string()
    .nullish()
    .transform((val) => val || "createdAt")
    .pipe(z.enum(["name", "createdAt", "updatedAt"]).default("createdAt")),
  sortOrder: z
    .string()
    .nullish()
    .transform((val) => val || "desc")
    .pipe(z.enum(["asc", "desc"]).default("desc")),
});

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

function rateLimit(identifier: string): boolean {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];

  // Remove old requests outside the window
  const validRequests = userRequests.filter(
    (time: number) => now - time < RATE_LIMIT_WINDOW
  );

  if (validRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
}

// Slug generation helper
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const userIP = headersList.get("x-forwarded-for") || "unknown";

    if (!rateLimit(userIP)) {
      return NextResponse.json(
        {
          success: false,
          message: "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      isActive: searchParams.get("isActive"),
      includePosts: searchParams.get("includePosts"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const { page, limit, search, isActive, includePosts, sortBy, sortOrder } =
      querySchema.parse(queryParams);

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
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
          ...(includePosts && {
            posts: {
              take: 5,
              orderBy: {
                createdAt: "desc",
              },
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImage: true,
                publishedAt: true,
                createdAt: true,
              },
              where: {
                status: "PUBLISHED",
              },
            },
          }),
        },
      }),
      prisma.category.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Categories GET error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz parametreler",
          error: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Kategoriler yüklenirken bir hata oluştu.",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const headersList = await headers();
    const userIP = headersList.get("x-forwarded-for") || "unknown";

    if (!rateLimit(userIP)) {
      return NextResponse.json(
        {
          success: false,
          message: "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu slug zaten kullanılıyor",
          error: "SLUG_EXISTS",
          field: "slug",
        },
        { status: 409 }
      );
    }

    // Generate slug if not provided or auto-generate from name
    let slug = validatedData.slug;
    if (!slug && validatedData.name) {
      slug = generateSlug(validatedData.name);

      // Check if auto-generated slug exists
      const existingSlug = await prisma.category.findUnique({
        where: { slug },
      });

      if (existingSlug) {
        // Add timestamp to make it unique
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        color: validatedData.color,
        icon: validatedData.icon,
        isActive: validatedData.isActive,
      },
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kategori başarıyla oluşturuldu",
        data: category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Categories POST error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz veri formatı",
          error: "VALIDATION_ERROR",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Bu kategori zaten mevcut",
          error: "DUPLICATE_ENTRY",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Kategori oluşturulurken bir hata oluştu.",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
