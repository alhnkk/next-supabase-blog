import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // comment, like, user, post
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    let notifications: any[] = [];

    if (!type || type === "all") {
      // Tüm bildirimleri getir
      const [comments, likes, users, posts] = await Promise.all([
        // Son yorumlar
        prisma.comment.findMany({
          take: limit,
          skip: skip,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
            post: {
              select: { id: true, title: true, slug: true },
            },
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Son 7 gün
            },
          },
        }),

        // Son beğeniler
        prisma.like.findMany({
          take: limit,
          skip: skip,
          orderBy: { createdAt: "desc" },
          where: {
            post: { isNot: null },
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Son 7 gün
            },
          },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            post: {
              select: { id: true, title: true, slug: true },
            },
          },
        }),

        // Yeni üyeler
        prisma.user.findMany({
          take: limit,
          skip: skip,
          orderBy: { createdAt: "desc" },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Son 7 gün
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        }),

        // Son yayınlanan postlar
        prisma.post.findMany({
          take: limit,
          skip: skip,
          orderBy: { publishedAt: "desc" },
          where: {
            status: "PUBLISHED",
            publishedAt: {
              not: null,
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Son 7 gün
            },
          },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        }),
      ]);

      // Bildirimleri birleştir ve formatla
      notifications = [
        ...comments.map((comment) => ({
          id: `comment-${comment.id}`,
          type: "comment",
          title: "Yeni yorum",
          description: `${comment.author?.name || "Anonim"} "${
            comment.post?.title
          }" gönderisine yorum yaptı`,
          content: comment.content.substring(0, 100) + "...",
          createdAt: comment.createdAt,
          isRead: false,
          user: comment.author,
          post: comment.post,
          actionUrl: `/post/${comment.post?.slug}#comment-${comment.id}`,
        })),
        ...likes.map((like) => ({
          id: `like-${like.id}`,
          type: "like",
          title: "Yeni beğeni",
          description: `${like.user?.name || "Anonim"} "${
            like.post?.title
          }" gönderisini beğendi`,
          content: null,
          createdAt: like.createdAt,
          isRead: false,
          user: like.user,
          post: like.post,
          actionUrl: `/post/${like.post?.slug}`,
        })),
        ...users.map((user) => ({
          id: `user-${user.id}`,
          type: "user_register",
          title: "Yeni üye",
          description: `${user.name || user.email} siteye katıldı`,
          content: null,
          createdAt: user.createdAt,
          isRead: false,
          user: { id: user.id, name: user.name, image: user.image },
          post: null,
          actionUrl: `/admin/users`,
        })),
        ...posts.map((post) => ({
          id: `post-${post.id}`,
          type: "post_published",
          title: "Yeni gönderi",
          description: `${post.author?.name || "Anonim"} "${
            post.title
          }" gönderisini yayınladı`,
          content: null,
          createdAt: post.publishedAt!,
          isRead: false,
          user: post.author,
          post: { id: post.id, title: post.title, slug: post.slug },
          actionUrl: `/post/${post.slug}`,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      // Belirli tür bildirimler
      switch (type) {
        case "comment":
          const comments = await prisma.comment.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: "desc" },
            include: {
              author: { select: { id: true, name: true, image: true } },
              post: { select: { id: true, title: true, slug: true } },
            },
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
              },
            },
          });

          notifications = comments.map((comment) => ({
            id: `comment-${comment.id}`,
            type: "comment",
            title: "Yeni yorum",
            description: `${comment.author?.name || "Anonim"} "${
              comment.post?.title
            }" gönderisine yorum yaptı`,
            content: comment.content,
            createdAt: comment.createdAt,
            isRead: false,
            user: comment.author,
            post: comment.post,
            actionUrl: `/post/${comment.post?.slug}#comment-${comment.id}`,
          }));
          break;

        case "like":
          const likes = await prisma.like.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: "desc" },
            where: {
              post: { isNot: null },
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            include: {
              user: { select: { id: true, name: true, image: true } },
              post: { select: { id: true, title: true, slug: true } },
            },
          });

          notifications = likes.map((like) => ({
            id: `like-${like.id}`,
            type: "like",
            title: "Yeni beğeni",
            description: `${like.user?.name || "Anonim"} "${
              like.post?.title
            }" gönderisini beğendi`,
            content: null,
            createdAt: like.createdAt,
            isRead: false,
            user: like.user,
            post: like.post,
            actionUrl: `/post/${like.post?.slug}`,
          }));
          break;

        case "user":
          const users = await prisma.user.findMany({
            take: limit,
            skip: skip,
            orderBy: { createdAt: "desc" },
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              createdAt: true,
            },
          });

          notifications = users.map((user) => ({
            id: `user-${user.id}`,
            type: "user_register",
            title: "Yeni üye",
            description: `${user.name || user.email} siteye katıldı`,
            content: null,
            createdAt: user.createdAt,
            isRead: false,
            user: { id: user.id, name: user.name, image: user.image },
            post: null,
            actionUrl: `/admin/users`,
          }));
          break;

        case "post":
          const posts = await prisma.post.findMany({
            take: limit,
            skip: skip,
            orderBy: { publishedAt: "desc" },
            where: {
              status: "PUBLISHED",
              publishedAt: {
                not: null,
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            include: {
              author: { select: { id: true, name: true, image: true } },
            },
          });

          notifications = posts.map((post) => ({
            id: `post-${post.id}`,
            type: "post_published",
            title: "Yeni gönderi",
            description: `${post.author?.name || "Anonim"} "${
              post.title
            }" gönderisini yayınladı`,
            content: null,
            createdAt: post.publishedAt!,
            isRead: false,
            user: post.author,
            post: { id: post.id, title: post.title, slug: post.slug },
            actionUrl: `/post/${post.slug}`,
          }));
          break;
      }
    }

    // Toplam sayıyı hesapla (pagination için)
    let total = 0;
    if (!type || type === "all") {
      const [commentCount, likeCount, userCount, postCount] = await Promise.all(
        [
          prisma.comment.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.like.count({
            where: {
              post: { isNot: null },
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.post.count({
            where: {
              status: "PUBLISHED",
              publishedAt: {
                not: null,
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
        ]
      );
      total = commentCount + likeCount + userCount + postCount;
    } else {
      // Belirli tip için count
      total = notifications.length;
    }

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total,
        comments: type === "comment" ? total : 0,
        likes: type === "like" ? total : 0,
        users: type === "user" ? total : 0,
        posts: type === "post" ? total : 0,
      },
    });
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
