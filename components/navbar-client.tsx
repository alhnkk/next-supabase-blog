"use client";

import { Navbar } from "./navbar";
import { useHydration } from "@/hooks/use-hydration";

export function NavbarClient() {
  const isHydrated = useHydration();

  // Always render the same component structure to maintain hook consistency
  // Use suppressHydrationWarning to prevent mismatch warnings
  return (
    <div suppressHydrationWarning>
      {isHydrated ? (
        <Navbar />
      ) : (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 my-1">
            {/* Simple logo placeholder during SSR */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
                BLOG
              </h2>
            </div>

            {/* Simple search placeholder */}
            <div className="px-8 flex-1 hidden md:block">
              <div className="h-9 bg-gray-100 rounded-md animate-pulse"></div>
            </div>

            {/* Auth buttons placeholder */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-20 bg-gray-100 rounded-md animate-pulse"></div>
              <div className="h-9 w-20 bg-gray-100 rounded-md animate-pulse"></div>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
