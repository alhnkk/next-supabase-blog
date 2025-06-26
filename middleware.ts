import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sadece admin sayfaları için basit kontrol
  if (pathname.startsWith("/admin")) {
    // Session cookie'sini kontrol et
    const sessionToken = request.cookies.get("better-auth.session_token");

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Sadece admin sayfaları için middleware çalışsın
    "/admin/:path*",
  ],
};
