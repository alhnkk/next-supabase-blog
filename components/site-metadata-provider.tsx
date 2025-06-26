"use client";

import { useEffect } from "react";
import { useSiteSettingsStore } from "@/lib/stores/site-settings-store";
import { useHydration } from "@/hooks/use-hydration";

export function SiteMetadataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isHydrated = useHydration();
  const { settings, fetchSettings } = useSiteSettingsStore();

  useEffect(() => {
    if (isHydrated) {
      fetchSettings();
    }
  }, [isHydrated, fetchSettings]);

  useEffect(() => {
    if (isHydrated && settings) {
      // Update document title
      document.title = settings.siteName || "Blog";

      // Update meta description
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          settings.siteDescription || "Modern blog platformu"
        );
      }

      // Update Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", settings.siteName || "Blog");
      }

      // Update Open Graph description
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription) {
        ogDescription.setAttribute(
          "content",
          settings.siteDescription || "Modern blog platformu"
        );
      }

      // Update Open Graph site name
      const ogSiteName = document.querySelector(
        'meta[property="og:site_name"]'
      );
      if (ogSiteName) {
        ogSiteName.setAttribute("content", settings.siteName || "Blog");
      }

      // Update Twitter title
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute("content", settings.siteName || "Blog");
      }

      // Update Twitter description
      const twitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDescription) {
        twitterDescription.setAttribute(
          "content",
          settings.siteDescription || "Modern blog platformu"
        );
      }

      // Update favicon if siteLogo exists
      if (settings.siteLogo) {
        const favicon = document.querySelector(
          'link[rel="icon"]'
        ) as HTMLLinkElement;
        if (favicon) {
          favicon.href = settings.siteLogo;
        }
      }
    }
  }, [isHydrated, settings]);

  return <>{children}</>;
}
