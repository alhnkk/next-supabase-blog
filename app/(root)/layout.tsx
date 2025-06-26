import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Footer } from "@/components/footer";
import { SiteMetadataProvider } from "@/components/site-metadata-provider";

// Navbar'ı client-side'da render et (SSR problemi çözümü)
const Navbar = dynamic(
  () => import("@/components/navbar").then((mod) => ({ default: mod.Navbar })),
  {
    ssr: false,
    loading: () => (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </nav>
    ),
  }
);

export const metadata: Metadata = {
  title: "Blog - Modern İçerik Platformu",
  description:
    "En güncel yazıları keşfedin, kendi içeriklerinizi paylaşın ve toplulukla etkileşime geçin. Modern blog platformu ile fikirlerinizi dünyayla buluşturun.",
  keywords: [
    "blog",
    "yazı",
    "makale",
    "teknoloji",
    "lifestyle",
    "içerik",
    "platform",
    "paylaşım",
    "sosyal",
    "türkçe blog",
  ],
  authors: [{ name: "Blog Team" }],
  creator: "Blog",
  publisher: "Blog Platform",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url:
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://next-supabase-blog-xi.vercel.app/",
    siteName: "Blog",
    title: "Blog - Modern İçerik Platformu",
    description:
      "En güncel yazıları keşfedin, kendi içeriklerinizi paylaşın ve toplulukla etkileşime geçin.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blog Platformu",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Blog - Modern Platform",
    description:
      "En güncel yazıları keşfedin ve kendi içeriklerinizi paylaşın.",
    images: ["/og-image.jpg"],
    creator: "@blog_app",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Verification
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },

  // Manifest
  manifest: "/manifest.json",

  // Alternate languages
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_BASE_URL || "https://journalize.vercel.app",
    languages: {
      "tr-TR": "/",
      "en-US": "/en",
    },
  },

  // Category
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteMetadataProvider>
      <div className="bg-background">
        <Navbar />
        <div>{children}</div>
        <Footer />
      </div>
    </SiteMetadataProvider>
  );
}
