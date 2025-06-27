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
    minimumCacheTTL: 60,
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
  // PERFORMANS: Aggressive production optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "class-variance-authority",
      "clsx",
      "date-fns",
    ],
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "TTFB"],
    scrollRestoration: true,
  },
  // Bundle optimizasyonları ve analyzer
  webpack: (config, { dev, isServer }) => {
    // PERFORMANS: Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk
            framework: {
              chunks: "all",
              name: "framework",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Commons chunk
            commons: {
              name: "commons",
              chunks: "all",
              minChunks: 2,
              priority: 20,
            },
            // Shared chunk
            shared: {
              name: "shared",
              chunks: "all",
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Utilities chunk (our optimized functions)
            utils: {
              name: "utils",
              test: /[\\/]lib[\\/]utils/,
              chunks: "all",
              priority: 30,
              enforce: true,
            },
          },
        },
      };

      // Aggressive tree shaking
      config.optimization.providedExports = true;
      config.optimization.usedExports = true;
      config.optimization.concatenateModules = true;

      // Basic optimizations without require
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === "TerserPlugin") {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions?.compress,
                drop_console: true,
                drop_debugger: true,
              },
            };
          }
        });
      }
    }
    return config;
  },
  // Better Auth External Packages
  serverExternalPackages: ["better-auth"],
  // Statik optimizasyon
  output: "standalone",
  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // Headers for performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
