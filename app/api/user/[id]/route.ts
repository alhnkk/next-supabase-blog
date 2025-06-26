import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/user/[id] - Kullanıcı profil bilgilerini getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        createdAt: true,
        isActive: true,
        email: true,
        // Hesap bilgileri
        accounts: {
          select: {
            providerId: true,
            password: true,
          },
        },
        // Istatistikler için count'lar
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

    if (!user.isActive) {
      return new Response(
        JSON.stringify({ error: "Bu kullanıcı aktif değil" }),
        { status: 403 }
      );
    }

    // Şifre ve provider bilgilerini hesapla
    const credentialAccount = user.accounts.find(
      (acc) => acc.providerId === "credential"
    );
    const otherProviders = user.accounts.filter(
      (acc) => acc.providerId !== "credential"
    );

    const userResponse = {
      ...user,
      hasPassword: !!credentialAccount?.password,
      provider:
        otherProviders.length > 0 ? otherProviders[0].providerId : "credential",
      accounts: undefined, // Güvenlik için accounts bilgisini gizle
    };

    return new Response(JSON.stringify(userResponse), { status: 200 });
  } catch (error) {
    console.error("[GET /api/user/[id]]:", error);
    return new Response(
      JSON.stringify({ error: "Kullanıcı bilgileri yüklenirken hata oluştu" }),
      { status: 500 }
    );
  }
}
