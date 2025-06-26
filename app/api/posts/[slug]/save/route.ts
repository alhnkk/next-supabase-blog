import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/posts/[slug]/save - Post'u kaydet/kaydetmeden çıkar
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Auth kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Bu işlem için giriş yapmalısınız" }),
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Post'u slug ile bul
    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        title: true,
      },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    if (post.status !== "PUBLISHED") {
      return new Response(
        JSON.stringify({
          error: "Sadece yayınlanmış postları kaydedebilirsiniz",
        }),
        { status: 403 }
      );
    }

    // Mevcut kayıtlı post'u kontrol et
    const existingSavedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });

    let action: "saved" | "unsaved";

    if (existingSavedPost) {
      // Kayıttan çıkar
      await prisma.savedPost.delete({
        where: { id: existingSavedPost.id },
      });
      action = "unsaved";
    } else {
      // Kaydet
      await prisma.savedPost.create({
        data: {
          userId: session.user.id,
          postId: post.id,
        },
      });
      action = "saved";
    }

    return new Response(
      JSON.stringify({
        success: true,
        action,
        message:
          action === "saved"
            ? `"${post.title}" kaydedildi`
            : `"${post.title}" kayıtlardan çıkarıldı`,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/posts/[slug]/save]:", error);
    return new Response(
      JSON.stringify({ error: "Kaydetme işlemi sırasında hata oluştu" }),
      { status: 500 }
    );
  }
}

// GET /api/posts/[slug]/save - Post'un kayıtlı olup olmadığını kontrol et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Auth kontrolü
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ isSaved: false }), { status: 200 });
    }

    const { slug } = await params;

    // Post'u slug ile bul
    const post = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }

    // Kayıtlı post'u kontrol et
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: post.id,
        },
      },
    });

    return new Response(JSON.stringify({ isSaved: !!savedPost }), {
      status: 200,
    });
  } catch (error) {
    console.error("[GET /api/posts/[slug]/save]:", error);
    return new Response(
      JSON.stringify({ error: "Kayıt durumu kontrol edilirken hata oluştu" }),
      { status: 500 }
    );
  }
}
