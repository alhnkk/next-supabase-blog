import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input flex w-full min-w-0 rounded-lg border bg-white/95 px-3 text-base shadow-sm transition-all duration-200 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-slate-400 focus-visible:ring-slate-400/20 focus-visible:ring-[3px] aria-invalid:ring-red-300/30 aria-invalid:border-red-300",
  {
    variants: {
      variant: {
        default: "border-slate-300/60 bg-white/95 backdrop-blur-sm",
        // Professional variants - Daha resmi görünüm

        comment:
          "bg-slate-50/80 border-slate-300/60 focus-visible:border-slate-500 focus-visible:ring-slate-500/20 backdrop-blur-sm",
        admin:
          "bg-slate-50/90 border-slate-300/70 focus-visible:border-slate-600 focus-visible:ring-slate-600/20 shadow-md backdrop-blur-sm",
        editor:
          "bg-slate-50/90 border-slate-300/70 focus-visible:border-slate-600 focus-visible:ring-slate-600/20 font-mono shadow-md backdrop-blur-sm",
        minimal:
          "border-0 border-b-2 border-slate-300/60 rounded-none bg-transparent focus-visible:border-slate-500 focus-visible:ring-0 shadow-none",
        professional:
          "bg-slate-50/60 border-slate-400/60 focus-visible:border-slate-600 focus-visible:ring-slate-600/25 shadow-md backdrop-blur-sm",
        search:
          "bg-slate-50/80 border-slate-300/60 focus-visible:border-slate-500 focus-visible:ring-slate-500/20 placeholder:text-slate-500/70 backdrop-blur-sm",
      },

      size: {
        default: "h-9 py-1",
        sm: "h-8 px-2 text-sm",
        lg: "h-11 px-4 text-lg",
        xl: "h-12 px-5 text-xl",
      },
      intent: {
        default: "",
        title: "font-semibold text-lg",
        subtitle: "font-medium",
        body: "font-normal",
        meta: "text-sm font-light",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      intent: "default",
    },
  }
);

function Input({
  className,
  type,
  variant,
  size,
  intent,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size, intent }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
