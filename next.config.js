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
  serverExternalPackages: ["@prisma/client"],
  // Performans optimizasyonları
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Bundle optimizasyonları
  webpack: (config, { dev, isServer }) => {
    // Sadece production'da ve client-side'da optimizasyon
    if (!dev && !isServer) {
      // Tree shaking için mark as side effect free
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    return config;
  },
  // Bundle analyzer
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      if (process.env.ANALYZE === "true") {
        const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
  // Better Auth External Packages
  serverExternalPackages: ["better-auth"],
  // Statik optimizasyon
  output: "standalone",
};

export default nextConfig;
