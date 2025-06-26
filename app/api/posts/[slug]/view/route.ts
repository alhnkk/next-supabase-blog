import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Post'u slug ile bul
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    // Session kontrolü (isteğe bağlı)
    const session = await auth.api.getSession({ headers: request.headers });

    // IP adresi ve User-Agent bilgisi al
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || "";

    // 5 dakika içinde aynı IP'den view var mı kontrol et
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const existingView = await prisma.view.findFirst({
      where: {
        postId: post.id,
        ipAddress: ip,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    // Eğer 5 dakika içinde görüntüleme varsa, sayıyı artırma
    if (existingView) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Bu post yakın zamanda görüntülendi",
        }),
        { status: 200 }
      );
    }

    // Yeni view kaydı oluştur
    await prisma.view.create({
      data: {
        postId: post.id,
        ipAddress: ip,
        userAgent,
        referrer,
        userId: session?.user?.id || null,
      },
    });

    // Güncel view sayısını al
    const totalViews = await prisma.view.count({
      where: {
        postId: post.id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalViews,
        message: "Görüntülenme sayısı artırıldı",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/posts/[slug]/view]:", error);
    return new Response(
      JSON.stringify({ error: "Görüntülenme sayısı artırılırken hata oluştu" }),
      { status: 500 }
    );
  }
}
