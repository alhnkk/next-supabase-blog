/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "yhjavwtzhquzsylbunxf.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 1 gün cache
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Development'ta daha az log
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Server components external packages (Next.js 15 syntax)
  serverExternalPackages: ["@prisma/client", "better-auth"],
  // Performans optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Experimental optimizations
  experimental: {
    optimizePackageImports: ["lucide-react"],
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "TTFB"],
    scrollRestoration: true,
  },
  // Statik optimizasyon
  output: "standalone",
};

export default nextConfig;
