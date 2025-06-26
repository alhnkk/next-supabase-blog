/**
 * Metin içeriğinden okuma süresini hesaplayan fonksiyon
 * @param content - HTML veya düz metin içeriği
 * @param wordsPerMinute - Dakikada okunacak kelime sayısı (varsayılan: 200)
 * @returns Dakika cinsinden okuma süresi
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  if (!content || content.trim().length === 0) {
    return 1; // Minimum 1 dakika
  }

  // HTML etiketlerini temizle
  const cleanedContent = content
    .replace(/<[^>]*>/g, "") // HTML etiketlerini kaldır
    .replace(/\s+/g, " ") // Birden fazla boşluğu tek boşlukla değiştir
    .trim();

  // Kelimeleri say
  const words = cleanedContent.split(" ").filter((word) => word.length > 0);
  const wordCount = words.length;

  // Okuma süresini hesapla (minimum 1 dakika)
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

  return Math.max(readingTimeMinutes, 1);
}

/**
 * Metin içeriğinden kelime sayısını hesaplayan fonksiyon
 * @param content - HTML veya düz metin içeriği
 * @returns Kelime sayısı
 */
export function calculateWordCount(content: string): number {
  if (!content || content.trim().length === 0) {
    return 0;
  }

  // HTML etiketlerini temizle
  const cleanedContent = content
    .replace(/<[^>]*>/g, "") // HTML etiketlerini kaldır
    .replace(/\s+/g, " ") // Birden fazla boşluğu tek boşlukla değiştir
    .trim();

  // Kelimeleri say
  const words = cleanedContent.split(" ").filter((word) => word.length > 0);

  return words.length;
}

/**
 * Çoklu içerik alanından toplam okuma süresini hesaplayan fonksiyon
 * @param contents - İçerik alanları objesi
 * @param wordsPerMinute - Dakikada okunacak kelime sayısı (varsayılan: 200)
 * @returns Dakika cinsinden toplam okuma süresi
 */
export function calculateTotalReadingTime(
  contents: {
    introduction?: string;
    content?: string;
    conclusion?: string;
  },
  wordsPerMinute: number = 200
): number {
  const { introduction = "", content = "", conclusion = "" } = contents;

  // Tüm içerikleri birleştir
  const totalContent = [introduction, content, conclusion]
    .filter(Boolean)
    .join(" ");

  return calculateReadingTime(totalContent, wordsPerMinute);
}
