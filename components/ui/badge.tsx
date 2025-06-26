import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-xs border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        // Default ShadCN variants
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",

        // Post Type Badges (Farklı renkler ile)
        "post-article":
          "border-transparent bg-amber-200 text-amber-800 [a&]:hover:bg-amber-300 shadow-sm",
        "post-review":
          "border-transparent bg-orange-200 text-orange-800 [a&]:hover:bg-orange-300 shadow-sm",
        "post-poetry":
          "border-transparent bg-slate-200 text-slate-800 [a&]:hover:bg-slate-300 shadow-sm font-serif italic text-[11px]",
        "post-interview":
          "border-transparent bg-blue-200 text-blue-800 [a&]:hover:bg-blue-300 shadow-sm",
        "post-essay":
          "border-transparent bg-indigo-200 text-indigo-800 [a&]:hover:bg-indigo-300 shadow-sm font-serif text-[11px]",
        "post-news":
          "border-transparent bg-emerald-200 text-emerald-800 [a&]:hover:bg-emerald-300 shadow-sm",
        "post-opinion":
          "border-transparent bg-purple-200 text-purple-800 [a&]:hover:bg-purple-300 shadow-sm",

        // Category Badges (Tamamen farklı renkler)
        "cat-edebiyat":
          "border-transparent bg-rose-100 text-rose-700 [a&]:hover:bg-rose-200",
        "cat-siir":
          "border-transparent bg-cyan-100 text-cyan-700 [a&]:hover:bg-cyan-200",
        "cat-roman":
          "border-transparent bg-teal-100 text-teal-700 [a&]:hover:bg-teal-200",
        "cat-elestiri":
          "border-transparent bg-lime-100 text-lime-700 [a&]:hover:bg-lime-200",

        // Status Badges (Gradient'lar farklı)
        featured:
          "border-transparent bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 shadow-md",
        pinned:
          "border-transparent bg-gradient-to-r from-red-200 to-pink-200 text-red-800 shadow-md",
        trending:
          "border-transparent bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 shadow-md",
        new: "border-transparent bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 shadow-md",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
