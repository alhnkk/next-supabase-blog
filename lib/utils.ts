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

/**
 * Get accessible text color for a given background color
 * Returns 'white' or 'black' based on WCAG AA contrast requirements (4.5:1)
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio(backgroundColor, "#ffffff");
  const blackContrast = getContrastRatio(backgroundColor, "#000000");

  // WCAG AA requires at least 4.5:1 contrast ratio
  if (whiteContrast >= 4.5) return "white";
  if (blackContrast >= 4.5) return "black";

  // If neither meets the requirement, choose the one with higher contrast
  return whiteContrast > blackContrast ? "white" : "black";
}

/**
 * Get accessible badge styles for category colors
 * Returns optimized background and text colors for better contrast
 */
export function getAccessibleBadgeStyles(categoryColor: string): {
  backgroundColor: string;
  color: string;
  borderColor?: string;
} {
  const textColor = getAccessibleTextColor(categoryColor);

  // If the contrast is poor, adjust the background color
  const whiteContrast = getContrastRatio(categoryColor, "#ffffff");
  const blackContrast = getContrastRatio(categoryColor, "#000000");

  if (whiteContrast < 4.5 && blackContrast < 4.5) {
    // Poor contrast with both colors, create a more accessible version
    const rgb = hexToRgb(categoryColor);
    if (!rgb) return { backgroundColor: categoryColor, color: textColor };

    // Darken or lighten the color to improve contrast
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

    if (luminance > 0.5) {
      // Light color, darken it
      const factor = 0.6;
      const newR = Math.round(rgb.r * factor);
      const newG = Math.round(rgb.g * factor);
      const newB = Math.round(rgb.b * factor);
      return {
        backgroundColor: `rgb(${newR}, ${newG}, ${newB})`,
        color: "white",
        borderColor: categoryColor,
      };
    } else {
      // Dark color, create a lighter background with dark text
      const factor = 0.15;
      const newR = Math.round(rgb.r + (255 - rgb.r) * (1 - factor));
      const newG = Math.round(rgb.g + (255 - rgb.g) * (1 - factor));
      const newB = Math.round(rgb.b + (255 - rgb.b) * (1 - factor));
      return {
        backgroundColor: `rgb(${newR}, ${newG}, ${newB})`,
        color: categoryColor,
        borderColor: categoryColor,
      };
    }
  }

  return {
    backgroundColor: categoryColor,
    color: textColor,
  };
}
