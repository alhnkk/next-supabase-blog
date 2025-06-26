import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  duration?: number; // ms, undefined ise manuel kapatılır
  closable?: boolean;
}

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];

  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      theme: "system",
      sidebarOpen: false,
      isLoading: false,
      error: null,
      notifications: [],

      setTheme: (theme) => {
        set({ theme });
        // İsteğe bağlı: document.documentElement'e class ekleyip CSS ile tema yönetimi
        if (typeof window !== "undefined") {
          document.documentElement.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            document.documentElement.classList.add(systemTheme);
          } else {
            document.documentElement.classList.add(theme);
          }
        }
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      addNotification: (notificationData) => {
        const id =
          Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = {
          id,
          ...notificationData,
          closable: notificationData.closable ?? true,
        };
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Otomatik kapatma
        if (newNotification.duration) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
        return id;
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: "ui-store" }
  )
);

// Örnek Kullanım (Component içinde)
// import { useUIStore } from '@/lib/stores/ui-store';
//
// const { openModal, addNotification, theme, setTheme } = useUIStore();
//
// openModal('search-dialog');
// addNotification({ type: 'success', title: 'Başarılı!', message: 'İşlem tamamlandı.' });
// setTheme('dark');
