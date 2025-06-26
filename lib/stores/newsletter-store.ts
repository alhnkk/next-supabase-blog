import { create } from "zustand";

interface NewsletterState {
  isLoading: boolean;
  message: string;
  messageType: "success" | "error" | null;
  subscribe: (email: string) => Promise<void>;
  clearMessage: () => void;
}

export const useNewsletterStore = create<NewsletterState>((set) => ({
  isLoading: false,
  message: "",
  messageType: null,

  subscribe: async (_email: string) => {
    set({ isLoading: true, message: "", messageType: null });

    try {
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1500)); // Performans için kaldırıldı

      // Mock success response
      set({
        isLoading: false,
        message: "Başarıyla abone oldunuz! Hoş geldin mesajımızı kontrol edin.",
        messageType: "success",
      });

      // Clear message after 5 seconds
      setTimeout(() => {
        set({ message: "", messageType: null });
      }, 5000);
    } catch (_error) {
      set({
        isLoading: false,
        message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
        messageType: "error",
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        set({ message: "", messageType: null });
      }, 5000);
    }
  },

  clearMessage: () => {
    set({ message: "", messageType: null });
  },
}));
