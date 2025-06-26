// app/api/posts/route.ts (örnek API route)

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { PostStatus, PostType } from "@prisma/client";
import {
  calculateReadingTime,
  calculateWordCount,
  calculateTotalReadingTime,
} from "@/lib/utils/reading-time";

// Yardımcı fonksiyonlar
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// PostType mapping - frontend değerlerini Prisma enum değerlerine çevir
function mapPostType(postType: string): PostType {
  const typeMap: Record<string, PostType> = {
    article: PostType.ARTICLE,
    review: PostType.REVIEW,
    interview: PostType.INTERVIEW,
    poetry: PostType.POETRY,
    essay: PostType.ESSAY,
    news: PostType.NEWS,
    opinion: PostType.OPINION,
    "short-story": PostType.SHORT_STORY,
  };

  return typeMap[postType] || PostType.ARTICLE;
}

// PostStatus mapping - frontend değerlerini Prisma enum değerlerine çevir
function mapPostStatus(status: string): PostStatus {
  const statusMap: Record<string, PostStatus> = {
    draft: PostStatus.DRAFT,
    published: PostStatus.PUBLISHED,
    scheduled: PostStatus.SCHEDULED,
    archived: PostStatus.ARCHIVED,
  };

  return statusMap[status] || PostStatus.DRAFT;
}

// Hata yanıtı oluştur
function errorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

// Başarılı yanıt oluştur
function successResponse(data: any, status: number = 200) {
  return Response.json(data, { status });
}

// GET /api/posts - Post listesi
export async function GET(request: NextRequest) {
  try {
    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || DEFAULT_PAGE;
    const limit = Number(searchParams.get("limit")) || DEFAULT_LIMIT;
    const search = searchParams.get("search") || undefined;
    const type = (searchParams.get("type") as PostType) || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const authorId = searchParams.get("authorId") || undefined;
    const exclude = searchParams.get("exclude") || undefined;
    const isPublished =
      searchParams.get("isPublished") === "true" ? true : undefined;
    const isFeatured =
      searchParams.get("isFeatured") === "true" ? true : undefined;
    const isPinned = searchParams.get("isPinned") === "true" ? true : undefined;
    const tagIds = searchParams.getAll("tagIds") || undefined;

    // Advanced search parameters
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    // Filtreleme koşullarını oluştur
    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { excerpt: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
          // Author name search
          {
            author: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          // Category name search
          {
            category: {
              name: { contains: search, mode: "insensitive" as const },
            },
          },
          // Tags search
          {
            tags: {
              some: {
                tag: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            },
          },
        ],
      }),
      ...(type && { postType: type }),
      ...(categoryId && { categoryId }),
      ...(authorId && { authorId }),
      ...(exclude && { id: { not: exclude } }),
      ...(isPublished && { status: PostStatus.PUBLISHED }),
      ...(isFeatured && { isFeatured: true }),
      ...(isPinned && { isPinned: true }),
      ...(tagIds &&
        tagIds.length > 0 && {
          tags: { some: { tagId: { in: tagIds } } },
        }),
      // Date range filter
      ...((dateFrom || dateTo) && {
        publishedAt: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      }),
    };

    // Toplam post sayısını al
    const total = await prisma.post.count({ where });

    // Postları getir - PERFORMANS OPTİMİZE EDİLDİ
    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        postType: true,
        status: true,
        readingTime: true,
        wordCount: true,
        isFeatured: true,
        isPinned: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
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
          select: {
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
            comments: {
              where: {
                isActive: true, // Sadece aktif yorumları say
              },
            },
            likes: {
              where: {
                type: "LIKE",
              },
            },
            views: true,
          },
        },
      },
      orderBy: (() => {
        // Custom sorting logic for advanced search
        if (sortBy === "views") {
          return [{ isPinned: "desc" }, { views: { _count: sortOrder } }];
        } else if (sortBy === "likes") {
          return [{ isPinned: "desc" }, { likes: { _count: sortOrder } }];
        } else if (sortBy === "comments") {
          return [{ isPinned: "desc" }, { comments: { _count: sortOrder } }];
        } else if (sortBy === "date") {
          return [{ isPinned: "desc" }, { publishedAt: sortOrder }];
        } else {
          // Default: relevance or createdAt
          return [{ isPinned: "desc" }, { createdAt: sortOrder }];
        }
      })(),
      skip: (page - 1) * limit,
      take: limit,
    });

    // Yanıtı oluştur
    return successResponse({
      data: posts,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/posts]:", error);
    return errorResponse("Postlar yüklenirken bir hata oluştu");
  }
}

// POST /api/posts - Yeni post oluştur
export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return errorResponse("Bu işlem için giriş yapmalısınız", 401);
    }

    // Request body'i al
    const body = await request.json();

    // Zorunlu alanları kontrol et
    const requiredFields = ["title", "excerpt", "content", "categoryId"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`${field} alanı zorunludur`);
      }
    }

    // Slug oluştur
    const slug = await generateSlug(body.title);

    // Tag işlemleri için - string array'den tag isimlerini işle
    let tagConnections = undefined;
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      // Mevcut tagları bul
      const existingTags = await prisma.tag.findMany({
        where: {
          name: { in: body.tags },
        },
      });

      // Yeni tagları oluştur
      const existingTagNames = existingTags.map((tag) => tag.name);
      const newTagNames = body.tags.filter(
        (tagName: string) => !existingTagNames.includes(tagName)
      );

      if (newTagNames.length > 0) {
        await prisma.tag.createMany({
          data: newTagNames.map((name: string) => ({
            name,
            slug: name.toLowerCase().replace(/\s+/g, "-"),
            color: "#6B7280", // Default color
          })),
          skipDuplicates: true,
        });
      }

      // Tüm tagları al
      const allTags = await prisma.tag.findMany({
        where: {
          name: { in: body.tags },
        },
      });

      tagConnections = {
        create: allTags.map((tag) => ({
          tag: { connect: { id: tag.id } },
        })),
      };
    }

    // İçerik analizini yap
    const contents = {
      introduction: body.introduction || "",
      content: body.content,
      conclusion: body.conclusion || "",
    };

    const readingTime = calculateTotalReadingTime(contents);
    const wordCount =
      calculateWordCount(body.content) +
      calculateWordCount(body.introduction || "") +
      calculateWordCount(body.conclusion || "");

    // Yeni post oluştur
    const post = await prisma.post.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || "",
        introduction: body.introduction || null,
        content: body.content,
        conclusion: body.conclusion || null,
        coverImage: body.coverImage || null,
        postType: body.postType ? mapPostType(body.postType) : PostType.ARTICLE,
        status: body.status ? mapPostStatus(body.status) : PostStatus.DRAFT,
        readingTime,
        wordCount,
        isFeatured: body.isFeatured || false,
        allowComments: body.allowComments !== false,
        allowLikes: body.allowLikes !== false,
        categoryId: body.categoryId,
        authorId: session.user.id,
        publishedAt:
          mapPostStatus(body.status || "draft") === PostStatus.PUBLISHED
            ? new Date()
            : null,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        tags: tagConnections,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return successResponse(post, 201);
  } catch (error) {
    console.error("[POST /api/posts]:", error);
    return errorResponse("Post oluşturulurken bir hata oluştu");
  }
}
