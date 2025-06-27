import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Session'ı kontrol et
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Giriş yapmanız gerekiyor",
        },
        { status: 401 }
      );
    }

    console.log("🔍 Current user before admin update:", session.user);

    // Kullanıcıyı admin yap
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "admin",
        isAdmin: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isAdmin: true,
      },
    });

    console.log("✅ User updated to admin:", updatedUser);

    return NextResponse.json({
      success: true,
      message: "Kullanıcı admin rolüne yükseltildi",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Make admin error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}
