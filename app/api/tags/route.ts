import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tag.count(),
    ]);

    return NextResponse.json({
      data: tags,
      total,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Etiketler yüklenirken bir hata oluştu.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const tag = await prisma.tag.create({
      data: {
        name: json.name,
        slug: json.slug,
        color: json.color || "#6b7280",
      },
    });
    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Etiket oluşturulurken bir hata oluştu.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
