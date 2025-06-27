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
            /* Minimal Critical CSS */
            html { scroll-behavior: smooth; }
            body { 
              font-family: system-ui, -apple-system, sans-serif;
              margin: 0;
              padding: 0;
            }
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
