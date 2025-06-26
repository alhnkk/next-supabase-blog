import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const { postId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    // Mevcut beğeniyi kontrol et
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId: postId,
        type: "LIKE",
      },
    });

    if (existingLike) {
      // Beğeniyi kaldır
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return NextResponse.json({
        message: "Beğeni kaldırıldı",
        liked: false,
      });
    } else {
      // Beğeni ekle
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId: postId,
          type: "LIKE",
        },
      });

      return NextResponse.json({
        message: "Post beğenildi",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Like error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { postId } = await params;

    // Post'un toplam beğeni sayısını getir
    const likeCount = await prisma.like.count({
      where: {
        postId: postId,
        type: "LIKE",
      },
    });

    return NextResponse.json({ likeCount });
  } catch (error) {
    console.error("Get likes error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
