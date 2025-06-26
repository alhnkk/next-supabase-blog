import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript kuralları - çok esnek
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/prefer-as-const": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      
      // React kuralları - esnek
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      
      // JSX Accessibility - esnek
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      
      // Next.js kuralları - esnek
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      
      // Genel JavaScript kuralları
      "no-console": "off",
      "no-debugger": "warn",
      "prefer-const": "off",
      "no-var": "off",
      "no-undef": "off", // TypeScript zaten kontrol ediyor
      
      // Import/Export kuralları
      "import/no-anonymous-default-export": "off",
      "import/no-unresolved": "off",
      
      // Sadece kritik syntax hatalarını error olarak tut
      "no-unreachable": "error",
      "no-unexpected-multiline": "error",
      "valid-typeof": "error",
    },
  },
];

export default eslintConfig;
