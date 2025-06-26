import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/user/[id]/likes - Kullanıcının beğendiği postları getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to view their own liked posts
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const likedPosts = await prisma.like.findMany({
      where: {
        userId: userId,
        post: {
          isNot: null, // Only include likes on posts (not comments)
        },
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                views: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected structure
    const transformedPosts = likedPosts
      .filter((like) => like.post) // Ensure post exists
      .map((like) => ({
        id: like.post!.id,
        title: like.post!.title,
        slug: like.post!.slug,
        coverImage: like.post!.coverImage,
        createdAt: like.createdAt.toISOString(),
        author: like.post!.author,
        category: like.post!.category,
        _count: like.post!._count,
      }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Liked posts fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
