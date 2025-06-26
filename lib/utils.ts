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
