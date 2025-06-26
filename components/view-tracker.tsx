"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  postSlug: string;
}

export function ViewTracker({ postSlug }: ViewTrackerProps) {
  useEffect(() => {
    // Görüntüleme sayısını artır
    const incrementView = async () => {
      try {
        // Aynı session'da aynı postu tekrar görüntüleme kontrolü
        const lastViewKey = `last_view_${postSlug}`;
        const lastViewTime = localStorage.getItem(lastViewKey);
        const now = Date.now();

        // Son görüntüleme 30 dakika içindeyse sayma
        if (lastViewTime && now - parseInt(lastViewTime) < 30 * 60 * 1000) {
          return;
        }

        // API'ye görüntüleme sayısını artır
        const response = await fetch(`/api/posts/${postSlug}/view`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Son görüntüleme zamanını kaydet
          localStorage.setItem(lastViewKey, now.toString());
        }
      } catch (error) {
        // Sessizce fail - görüntüleme sayısı kritik değil
      }
    };

    // Component mount olduktan 2 saniye sonra çalıştır
    const timer = setTimeout(incrementView, 2000);

    return () => clearTimeout(timer);
  }, [postSlug]);

  // Bu component görsel bir şey render etmez
  return null;
}
