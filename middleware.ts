import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin sayfaları için Better Auth kontrolü
  if (pathname.startsWith("/admin")) {
    try {
      console.log("🔍 Admin route accessed:", pathname);

      // Session cookies'ini kontrol et
      const sessionToken = request.cookies.get("better-auth.session_token");
      console.log("🍪 Session token exists:", !!sessionToken?.value);

      // Better Auth session kontrolü
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      console.log("📊 Complete Session Debug:", {
        pathname,
        hasSession: !!session,
        sessionKeys: session ? Object.keys(session) : [],
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role,
              isAdmin: (session.user as any).isAdmin,
              allUserFields: Object.keys(session.user),
            }
          : null,
      });

      // Session yoksa login'e yönlendir
      if (!session?.user) {
        console.log("❌ No session found, redirecting to login");
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Admin kontrolü - hem role hem isAdmin'i kontrol et
      const isAdmin =
        session.user.role === "admin" || (session.user as any).isAdmin === true;

      if (!isAdmin) {
        console.log("❌ User is not admin:", {
          role: session.user.role,
          isAdmin: (session.user as any).isAdmin,
          userId: session.user.id,
        });

        // Geçici olarak admin olmayan kullanıcıları da geçir (debug için)
        console.log("⚠️ TEMPORARILY ALLOWING NON-ADMIN ACCESS FOR DEBUG");
        return NextResponse.next();

        // const homeUrl = new URL("/", request.url);
        // return NextResponse.redirect(homeUrl);
      }

      console.log("✅ Admin access granted");
      return NextResponse.next();
    } catch (error) {
      console.error("🚨 Middleware Auth Error:", error);
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
