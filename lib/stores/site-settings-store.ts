import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteLogo: string;
  adminEmail: string;
  primaryColor: string;
  accentColor: string;
  enableDarkMode: boolean;
}

interface SiteSettingsStore {
  settings: SiteSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const defaultSettings: SiteSettings = {
  siteName: "Blog",
  siteDescription: "Modern blog platformu",
  siteUrl: "https://localhost:3000",
  siteLogo: "/logo.svg",
  adminEmail: "admin@blog.com",
  primaryColor: "#1e293b",
  accentColor: "#f59e0b",
  enableDarkMode: false,
};

export const useSiteSettingsStore = create<SiteSettingsStore>()(
  persist(
    (set, get) => ({
      settings: null, // Start with null to avoid hydration mismatch
      isLoading: true,
      error: null,

      fetchSettings: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch("/api/admin/settings", {
            method: "GET",
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result = await response.json();

          if (result.success && result.data) {
            set({
              settings: {
                siteName: result.data.siteName || defaultSettings.siteName,
                siteDescription:
                  result.data.siteDescription ||
                  defaultSettings.siteDescription,
                siteUrl: result.data.siteUrl || defaultSettings.siteUrl,
                siteLogo: result.data.siteLogo || defaultSettings.siteLogo,
                adminEmail:
                  result.data.adminEmail || defaultSettings.adminEmail,
                primaryColor:
                  result.data.appearanceSettings?.primaryColor ||
                  defaultSettings.primaryColor,
                accentColor:
                  result.data.appearanceSettings?.accentColor ||
                  defaultSettings.accentColor,
                enableDarkMode:
                  result.data.appearanceSettings?.enableDarkMode ||
                  defaultSettings.enableDarkMode,
              },
              isLoading: false,
            });
          } else {
            set({
              settings: defaultSettings,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Site settings fetch error:", error);
          set({
            error: "Ayarlar yüklenirken hata oluştu",
            isLoading: false,
            settings: defaultSettings,
          });
        }
      },

      updateSettings: (newSettings) => {
        const current = get().settings;
        if (current) {
          set({
            settings: { ...current, ...newSettings },
          });
        }
      },
    }),
    {
      name: "site-settings-storage-v2", // Changed version to clear old cache
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Ensure we have valid settings after rehydration
          if (!state.settings) {
            state.settings = defaultSettings;
          }
          state.isLoading = false;
        }
      },
    }
  )
);
