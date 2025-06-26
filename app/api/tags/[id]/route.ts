import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return NextResponse.json(
        { message: "Etiket bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Etiket yüklenirken bir hata oluştu.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: json.name,
        slug: json.slug,
        color: json.color,
      },
    });
    return NextResponse.json(tag);
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Etiket güncellenirken bir hata oluştu.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tag.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { message: "Etiket silinirken bir hata oluştu.", error: error.message },
      { status: 500 }
    );
  }
}
