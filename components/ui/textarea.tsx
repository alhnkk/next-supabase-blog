import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        // Blog specific variants
        comment:
          "bg-gray-50 border-gray-200 focus-visible:border-amber-500 focus-visible:ring-amber-500/20",
        excerpt:
          "bg-amber-50 border-amber-200 focus-visible:border-amber-500 focus-visible:ring-amber-500/20",
        content:
          "bg-white border-gray-300 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20",
        admin:
          "bg-red-50 border-red-200 focus-visible:border-red-500 focus-visible:ring-red-500/20",
        editor:
          "bg-indigo-50 border-indigo-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 font-mono",
        minimal:
          "border-0 border-b-2 border-gray-200 rounded-none bg-transparent focus-visible:border-amber-500 focus-visible:ring-0 shadow-none",
      },
      size: {
        default: "min-h-16",
        sm: "min-h-12 px-2 py-1.5 text-sm",
        lg: "min-h-24 px-4 py-3 text-lg",
        xl: "min-h-32 px-5 py-4 text-xl",
        auto: "min-h-0 field-sizing-content",
      },
      intent: {
        default: "",
        excerpt: "italic text-gray-600",
        content: "leading-relaxed",
        comment: "leading-normal",
        code: "font-mono text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      intent: "default",
    },
  }
);

function Textarea({
  className,
  variant,
  size,
  intent,
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, size, intent }), className)}
      {...props}
    />
  );
}

export { Textarea, textareaVariants };
