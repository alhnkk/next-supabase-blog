import type { Metadata } from "next";
import { Playfair_Display, Red_Hat_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { BannedUserDetector } from "@/components/banned-user-detector";
import { ErrorBoundary } from "@/components/error-boundary";
import "@/lib/utils/global-fixes";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Only essential weights
  display: "swap", // Optimize font loading
  preload: true,
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Only essential weights
  display: "swap", // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "Blog",
  description: "Modern blog platformu",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
      "https://next-supabase-blog-xi.vercel.app/"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://next-supabase-blog-xi.vercel.app"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />

        {/* Critical CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Font face declarations for immediate rendering */
            body { font-family: ${redHatDisplay.style.fontFamily}, system-ui, sans-serif; }
            .font-heading { font-family: var(--font-playfair), serif; }
            
            /* Critical layout styles */
            * { box-sizing: border-box; }
            html { scroll-behavior: smooth; }
            body { margin: 0; padding: 0; line-height: 1.6; }
            
            /* Loading state */
            .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
          `,
          }}
        />
      </head>
      <body
        className={`${redHatDisplay.className} ${playfairDisplay.variable}`}
      >
        <ErrorBoundary>
          <BannedUserDetector />
          {children}
          <Toaster position="top-right" richColors />
        </ErrorBoundary>
      </body>
    </html>
  );
}
