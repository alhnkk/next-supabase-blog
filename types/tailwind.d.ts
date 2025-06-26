declare module "tailwindcss" {
  export interface TailwindConfig {
    theme?: {
      extend?: {
        colors?: Record<string, string>;
        fontFamily?: Record<string, string[]>;
        fontSize?: Record<string, string>;
        borderRadius?: Record<string, string>;
        spacing?: Record<string, string>;
        boxShadow?: Record<string, string>;
      };
    };
  }
}

declare module "@tailwindcss/postcss" {
  const plugin: any;
  export = plugin;
}

// Tailwind v4 CSS değişkenleri için type extensions
declare global {
  interface CSSStyleDeclaration {
    "--color-primary": string;
    "--color-primary-foreground": string;
    "--color-secondary": string;
    "--color-secondary-foreground": string;
    "--color-accent": string;
    "--color-accent-foreground": string;
    "--color-background": string;
    "--color-foreground": string;
    "--color-muted": string;
    "--color-muted-foreground": string;
    "--color-border": string;
    "--color-input": string;
    "--color-ring": string;
    "--color-success": string;
    "--color-success-foreground": string;
    "--color-warning": string;
    "--color-warning-foreground": string;
    "--color-info": string;
    "--color-info-foreground": string;
    "--radius": string;
    "--radius-sm": string;
    "--radius-lg": string;
    "--radius-xl": string;
  }
}

export {};
