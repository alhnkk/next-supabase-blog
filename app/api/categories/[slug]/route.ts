import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await prisma.category.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
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
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Kategori bulunamadı",
          error: "CATEGORY_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Category GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Kategori bilgileri yüklenirken bir hata oluştu",
        error: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
