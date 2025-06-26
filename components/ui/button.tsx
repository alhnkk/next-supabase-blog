import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xs whitespace-nowrap text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-primary",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-slate-300 bg-transparent hover:bg-primary hover:text-white",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",

        like: "bg-pink-600 text-white hover:bg-pink-700",
        dislike: "bg-gray-600 text-white hover:bg-gray-700",
        save: "bg-sky-600 text-white hover:bg-sky-700",
        share: "bg-violet-600 text-white hover:bg-violet-700",
        admin: "bg-red-600 text-white hover:bg-red-700 font-semibold",
        editor: "bg-indigo-600 text-white hover:bg-indigo-700",
        search:
          "border border-gray-400 bg-transparent text-gray-700 hover:bg-gray-100",
        filter:
          "border border-amber-400 bg-transparent text-amber-700 hover:bg-amber-50",
        category:
          "border border-orange-400 bg-transparent text-orange-700 hover:bg-orange-50",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 px-3 gap-1.5 has-[>svg]:px-2.5",
        md: "h-10 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 px-6 has-[>svg]:px-4",
        xl: "h-14 px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
        "icon-xl": "size-14",
      },
      intent: {
        primary: "font-medium",
        secondary: "font-normal",
        subtle: "font-light",
        bold: "font-semibold",
        heading: "font-bold uppercase tracking-wider",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      intent: "primary",
    },
  }
);

function Button({
  className,
  variant,
  size,
  intent,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, intent, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
