import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin sayfaları için Better Auth kontrolü
  if (pathname.startsWith("/admin")) {
    try {
      // Better Auth session kontrolü
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Session yoksa login'e yönlendir
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Admin kontrolü - hem role hem isAdmin'i kontrol et
      const isAdmin =
        session.user.role === "admin" || (session.user as any).isAdmin === true;

      if (!isAdmin) {
        // Admin değilse ana sayfaya yönlendir
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }

      // Admin erişimi onaylandı
      return NextResponse.next();
    } catch (error) {
      console.error("Middleware Auth Error:", error);
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
