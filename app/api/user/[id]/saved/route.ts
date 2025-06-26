import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/user/[id]/saved - Kullanıcının kaydettiği postları getir
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

    // Only allow users to view their own saved posts
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const savedPosts = await prisma.savedPost.findMany({
      where: {
        userId: userId,
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
    const transformedPosts = savedPosts.map((savedPost) => ({
      id: savedPost.post.id,
      title: savedPost.post.title,
      slug: savedPost.post.slug,
      coverImage: savedPost.post.coverImage,
      createdAt: savedPost.createdAt.toISOString(),
      author: savedPost.post.author,
      category: savedPost.post.category,
      _count: savedPost.post._count,
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Saved posts fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
