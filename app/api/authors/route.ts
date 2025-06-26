import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/authors - Yazarların listesi (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 50;

    // Sadece yayınlanmış postu olan yazarları getir
    const authors = await prisma.user.findMany({
      where: {
        posts: {
          some: {
            status: "PUBLISHED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: authors,
      total: authors.length,
    });
  } catch (error) {
    console.error("[GET /api/authors]:", error);
    return NextResponse.json(
      { error: "Yazarlar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
