import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Session'ı auth'dan al
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Database'den user bilgisini al
    let dbUser = null;
    if (session?.user?.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      debug: {
        sessionExists: !!session,
        userExists: !!session?.user,
        sessionUser: session?.user || null,
        dbUser: dbUser || null,
        headers: {
          cookie: request.headers.get("cookie"),
          authorization: request.headers.get("authorization"),
        },
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        timestamp: new Date().toISOString(),
      },
    });
  }
} 