import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { prisma } from "@/lib/prisma";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateSlug(title: string): Promise<string> {
  // Türkçe karakter dönüşümleri
  const turkishChars: { [key: string]: string } = {
    ç: "c",
    ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    I: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  const slug = title
    .toLowerCase()
    .trim()
    // Türkçe karakterleri değiştir
    .replace(/[çğıöşüÇĞIÖŞÜ]/g, (char) => turkishChars[char] || char)
    // Özel karakterleri kaldır (sayı, harf ve boşluk hariç)
    .replace(/[^a-z0-9\s-]/g, "")
    // Boşlukları tire ile değiştir
    .replace(/\s+/g, "-")
    // Çoklu tireleri tek tire yap
    .replace(/-+/g, "-")
    // Başta ve sondaki tireleri kaldır
    .replace(/^-+|-+$/g, "");

  let finalSlug = slug;
  let counter = 1;

  while (true) {
    const existingPost = await prisma.post.findUnique({
      where: { slug: finalSlug },
    });

    if (!existingPost) {
      break;
    }

    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

// Re-export array utilities
export * from "./utils/array-utils";

/**
 * Calculate luminance for a given RGB color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Memoization cache for contrast calculations
const contrastCache = new Map<
  string,
  { backgroundColor: string; color: string; borderColor?: string }
>();

/**
 * Get accessible text color for a given background color (simplified)
 * Returns 'white' or 'black' based on a simple luminance check
 */
export function getAccessibleTextColorFast(backgroundColor: string): string {
  // Simple hex to luminance calculation (faster than full WCAG)
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Simple luminance formula (faster than WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "black" : "white";
}

/**
 * Get accessible badge styles for category colors (optimized with memoization)
 */
export function getAccessibleBadgeStyles(categoryColor: string): {
  backgroundColor: string;
  color: string;
  borderColor?: string;
} {
  // Check cache first
  if (contrastCache.has(categoryColor)) {
    return contrastCache.get(categoryColor)!;
  }

  const textColor = getAccessibleTextColorFast(categoryColor);
  let result: { backgroundColor: string; color: string; borderColor?: string };

  // Simplified contrast enhancement for known problematic colors
  const hex = categoryColor.replace("#", "").toLowerCase();

  // Pre-defined fixes for common problematic colors
  if (
    hex === "f8df24" ||
    hex === "ffff00" ||
    hex.startsWith("f8d") ||
    hex.startsWith("fff")
  ) {
    // Yellow-ish colors - darken significantly
    result = {
      backgroundColor: "#b8860b", // Dark goldenrod
      color: "white",
      borderColor: categoryColor,
    };
  } else if (
    hex === "f59e0b" ||
    hex.startsWith("f59") ||
    hex.startsWith("ff9")
  ) {
    // Orange-ish colors - darken
    result = {
      backgroundColor: "#cc6600",
      color: "white",
      borderColor: categoryColor,
    };
  } else if (
    hex === "8b5cf6" ||
    hex.startsWith("8b5") ||
    hex.startsWith("9b5")
  ) {
    // Purple-ish colors - create light background
    result = {
      backgroundColor: "#e9d5ff",
      color: "#6b21a8",
      borderColor: categoryColor,
    };
  } else {
    // Default case - use original color with calculated text
    result = {
      backgroundColor: categoryColor,
      color: textColor,
    };
  }

  // Cache the result
  contrastCache.set(categoryColor, result);

  return result;
}

/**
 * Get CSS class name for common category colors (faster than inline styles)
 */
export function getCategoryBadgeClass(categoryColor: string): string | null {
  const hex = categoryColor?.replace("#", "").toLowerCase();

  if (!hex) return null;

  // Return static CSS classes for known colors
  if (
    hex === "f8df24" ||
    hex === "ffff00" ||
    hex.startsWith("f8d") ||
    hex.startsWith("fff")
  ) {
    return "badge-yellow";
  } else if (
    hex === "f59e0b" ||
    hex.startsWith("f59") ||
    hex.startsWith("ff9")
  ) {
    return "badge-orange";
  } else if (
    hex === "8b5cf6" ||
    hex.startsWith("8b5") ||
    hex.startsWith("9b5")
  ) {
    return "badge-purple";
  }

  return null; // Use inline styles as fallback
}
