import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true, bio: true },
        },
        category: true,
        tags: { include: { tag: true } },
        _count: {
          select: {
            comments: true,
            likes: { where: { type: "LIKE" } },
            views: true,
          },
        },
      },
    });
    if (!post) {
      return new Response(JSON.stringify({ error: "Post bulunamadı" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Post yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}
