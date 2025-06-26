import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded border shadow transition-all duration-300 backdrop-blur-sm",
  {
    variants: {
      variant: {
        // Default variants - Daha resmi görünüm
        default: "py-6 border-slate-200/60 bg-white/95 shadow-lg",
        outline: "border-2 border-slate-300/60",
        ghost: "border-transparent shadow-none",

        // Blog Post Cards - Profesyonel stil
        "blog-post":
          "hover:shadow-xl hover:border-slate-300/80 hover:scale-[1.01] cursor-pointer py-4 border-slate-200/60 bg-white/95",
        "featured-post":
          "border-2 border-amber-300/70 shadow-xl bg-gradient-to-br from-amber-50/90 to-orange-50/80 py-6",
        "pinned-post":
          "border-2 border-orange-300/70 shadow-xl bg-gradient-to-br from-orange-50/90 to-red-50/80 py-6",

        // Post Type Specific Cards - Kurumsal görünüm
        "post-article":
          "border-amber-200/60 hover:border-amber-300/80 hover:shadow-xl py-4 bg-white/95",
        "post-review":
          "border-orange-200/60 hover:border-orange-300/80 hover:shadow-xl py-4 bg-white/95",
        "post-poetry":
          "border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl bg-gradient-to-br from-slate-50/90 to-gray-50/80 py-4",
        "post-interview":
          "border-blue-200/60 hover:border-blue-300/80 hover:shadow-xl py-4 bg-white/95",
        "post-essay":
          "border-indigo-200/60 hover:border-indigo-300/80 hover:shadow-xl bg-gradient-to-br from-indigo-50/90 to-blue-50/80 py-4",
        "post-news":
          "border-emerald-200/60 hover:border-emerald-300/80 hover:shadow-xl py-4 bg-white/95",
        "post-opinion":
          "border-purple-200/60 hover:border-purple-300/80 hover:shadow-xl py-4 bg-white/95",

        // Special Cards - Yönetici paneli resmi görünüm
        "admin-panel":
          "border-slate-300/60 bg-gradient-to-br from-slate-50/95 to-gray-50/90 py-6 shadow-xl",
        "sidebar-widget":
          "border-slate-200/50 bg-gradient-to-br from-gray-50/90 to-slate-50/80 py-4 shadow-md",
        "comment-card": "border-slate-200/60 bg-slate-50/90 py-3 shadow-sm",
        "nested-comment":
          "border-l-4 border-l-amber-400/80 border-slate-200/60 bg-amber-50/60 py-3",
        "search-result": "hover:bg-slate-50/60 border-transparent py-3",
      },
      size: {
        default: "gap-6",
        sm: "gap-4",
        lg: "gap-8",
        compact: "gap-2",
        spacious: "gap-10",
      },
      padding: {
        default: "px-6",
        sm: "px-4",
        lg: "px-8",
        none: "px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      padding: "default",
    },
  }
);

function Card({
  className,
  variant,
  size,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, size, padding }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
};
