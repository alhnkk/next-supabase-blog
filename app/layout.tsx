import type { Metadata } from "next";
import { Playfair_Display, Red_Hat_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/footer";
import { BannedUserDetector } from "@/components/banned-user-detector";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"], // Multiple weights for headings
});

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Multiple weights for body text
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
      <body
        className={`${redHatDisplay.className} ${playfairDisplay.variable}`}
      >
        <BannedUserDetector />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
