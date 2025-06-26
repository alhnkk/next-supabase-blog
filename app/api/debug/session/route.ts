import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Better Auth session'ını kontrol et
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log("🔍 Debug Session Data:", {
      hasSession: !!session,
      sessionKeys: session ? Object.keys(session) : [],
      user: session?.user,
    });

    // Eğer kullanıcı varsa, database'den de bilgilerini al
    let dbUser = null;
    if (session?.user?.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isAdmin: true,
          isActive: true,
        },
      });
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      session: {
        exists: !!session,
        user: session?.user || null,
      },
      database: {
        user: dbUser,
      },
      headers: {
        userAgent: request.headers.get("user-agent"),
        cookies:
          request.headers.get("cookie")?.includes("better-auth") || false,
      },
    };

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error) {
    console.error("Debug session error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: {
          timestamp: new Date().toISOString(),
          error: true,
        },
      },
      { status: 500 }
    );
  }
}
