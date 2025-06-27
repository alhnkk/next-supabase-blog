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

      console.log("🔍 Middleware Debug:", {
        pathname,
        hasSession: !!session,
        userId: session?.user?.id,
        userRole: (session?.user as any)?.role,
        isAdmin: (session?.user as any)?.isAdmin,
      });

      // Session yoksa login'e yönlendir
      if (!session?.user) {
        console.log("❌ No session, redirecting to login");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Admin kontrolü - sadece role kontrolü yap
      const user = session.user as any;
      const isAdmin = user.role === "admin";

      console.log("🔍 Admin Check:", {
        userRole: user.role,
        isAdmin,
        redirectingToHome: !isAdmin,
      });

      if (!isAdmin) {
        console.log("❌ Not admin, redirecting to home");
        // Admin değilse ana sayfaya yönlendir
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
