import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind v4 optimized className merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tailwind v4 Animation utilities
 */
export const animations = {
  fadeIn: "animate-fade-in",
  slideLeft: "animate-slide-in-left",
  slideRight: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
  float: "animate-float",
  delay100: "animate-delay-100",
  delay200: "animate-delay-200",
  delay300: "animate-delay-300",
} as const;

/**
 * Tailwind v4 Glass effect utility
 */
export const glassEffect = "glass-effect";

/**
 * Tailwind v4 Gradient utilities
 */
export const gradients = {
  text: "gradient-text",
  bgPrimary: "gradient-bg-primary",
} as const;

/**
 * Tailwind v4 Shadow utilities
 */
export const shadows = {
  glow: "glow-primary",
} as const;

/**
 * Tailwind v4 Container utilities
 */
export const containers = {
  fluid: "container-fluid",
  narrow: "container-narrow",
} as const;

/**
 * Tailwind v4 Aspect ratio utilities
 */
export const aspects = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-portrait",
} as const;

/**
 * Tailwind v4 Text shadow utilities
 */
export const textShadows = {
  default: "text-shadow",
  lg: "text-shadow-lg",
} as const;

/**
 * Helper function to get CSS custom property value
 */
export function getCSSVar(property: string): string {
  if (typeof window !== "undefined") {
    return getComputedStyle(document.documentElement).getPropertyValue(
      property
    );
  }
  return "";
}

/**
 * Helper function to set CSS custom property value
 */
export function setCSSVar(property: string, value: string): void {
  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty(property, value);
  }
}

/**
 * Tailwind v4 Theme color helpers
 */
export const themeColors = {
  primary: "var(--color-primary)",
  primaryForeground: "var(--color-primary-foreground)",
  secondary: "var(--color-secondary)",
  secondaryForeground: "var(--color-secondary-foreground)",
  accent: "var(--color-accent)",
  accentForeground: "var(--color-accent-foreground)",
  background: "var(--color-background)",
  foreground: "var(--color-foreground)",
  muted: "var(--color-muted)",
  mutedForeground: "var(--color-muted-foreground)",
  border: "var(--color-border)",
  input: "var(--color-input)",
  ring: "var(--color-ring)",
  success: "var(--color-success)",
  successForeground: "var(--color-success-foreground)",
  warning: "var(--color-warning)",
  warningForeground: "var(--color-warning-foreground)",
  info: "var(--color-info)",
  infoForeground: "var(--color-info-foreground)",
} as const;

/**
 * Tailwind v4 responsive breakpoints
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Check if we're in dark mode
 */
export function isDarkMode(): boolean {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}
