import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin sayfaları için session kontrolü
  if (pathname.startsWith("/admin")) {
    try {
      // Session token'ı cookie'den al
      const sessionToken = request.cookies.get(
        "__Secure-better-auth.session_token"
      )?.value;

      console.log("🔍 Middleware Debug:", {
        pathname,
        hasSessionToken: !!sessionToken,
        cookiePresent: !!sessionToken,
      });

      // Session token yoksa login'e yönlendir
      if (!sessionToken) {
        console.log("❌ No session token, redirecting to login");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Session token varsa API'ye fetch ile kontrol et
      const response = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (!response.ok) {
        console.log("❌ Session validation failed, redirecting to login");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const session = await response.json();
      const user = session?.user;

      console.log("🔍 Session Check:", {
        hasUser: !!user,
        userRole: user?.role,
        isAdmin: user?.role === "admin",
      });

      if (!user || user.role !== "admin") {
        console.log("❌ Not admin, redirecting to home");
        const homeUrl = new URL("/", request.url);
        return NextResponse.redirect(homeUrl);
      }

      // Admin erişimi onaylandı
      console.log("✅ Admin access granted");
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
