import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// PUT /api/user/profile - Kullanıcı profil bilgilerini güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
      });
    }

    const body = await request.json();
    const { name, username, bio, image, email } = body;

    // Username benzersizlik kontrolü
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Bu kullanıcı adı zaten kullanılıyor" }),
          { status: 400 }
        );
      }
    }

    // Email benzersizlik kontrolü
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: session.user.id },
        },
      });

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Bu e-posta adresi zaten kullanılıyor" }),
          { status: 400 }
        );
      }
    }

    // Profil güncelleme
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(image && { image }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
            comments: {
              where: {
                isActive: true,
              },
            },
            likes: {
              where: {
                type: "LIKE",
                post: {
                  status: "PUBLISHED",
                },
              },
            },
            savedPosts: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    console.error("[PUT /api/user/profile]:", error);
    return new Response(
      JSON.stringify({ error: "Profil güncellenirken hata oluştu" }),
      { status: 500 }
    );
  }
}

// GET /api/user/profile - Mevcut kullanıcının profil bilgilerini getir
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        email: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
            comments: {
              where: {
                isActive: true,
              },
            },
            likes: {
              where: {
                type: "LIKE",
                post: {
                  status: "PUBLISHED",
                },
              },
            },
            savedPosts: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Kullanıcı bulunamadı" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("[GET /api/user/profile]:", error);
    return new Response(
      JSON.stringify({ error: "Profil bilgileri alınırken hata oluştu" }),
      { status: 500 }
    );
  }
}
