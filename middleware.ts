import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin sayfaları için geçici olarak bypass
  if (pathname.startsWith("/admin")) {
    console.log("🔓 Admin access temporarily bypassed for debugging");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Sadece admin sayfaları için middleware çalışsın
    "/admin/:path*",
  ],
};
