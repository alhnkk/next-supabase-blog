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
            /* Critical CSS - Öncelikli yükleme için */
            @font-face {
              font-family: 'Playfair Display';
              font-style: normal;
              font-weight: 400 700;
              font-display: swap;
              src: url('/fonts/playfair-display.woff2') format('woff2');
            }
            @font-face {
              font-family: 'Red Hat Display';
              font-style: normal;
              font-weight: 400 600;
              font-display: swap;
              src: url('/fonts/red-hat-display.woff2') format('woff2');
            }

            /* Layout kritik stiller */
            html { scroll-behavior: smooth; }
            body { 
              font-family: 'Red Hat Display', ui-sans-serif, system-ui, sans-serif;
              line-height: 1.6;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            /* Performance optimizations */
            img { content-visibility: auto; }
            .hero-section { contain: layout style paint; }
            .post-card { will-change: transform; }
            
            /* Badge optimizations - statik stiller */
            .badge-yellow { background: #b8860b !important; color: white !important; }
            .badge-orange { background: #cc6600 !important; color: white !important; }
            .badge-purple { background: #e9d5ff !important; color: #6b21a8 !important; }
            
            /* Animation keyframes */
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            .animate-in { animation: fadeIn 0.6s ease-out; }
            .animate-slide { animation: slideIn 0.4s ease-out; }
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
