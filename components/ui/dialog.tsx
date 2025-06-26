"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const dialogContentVariants = cva(
  "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200",
  {
    variants: {
      variant: {
        default: "sm:max-w-lg md:max-w-[500px]",
        // Blog specific modal variants
        search: "sm:max-w-2xl bg-amber-50 border-amber-200",
        "post-preview": "sm:max-w-4xl max-h-[90vh] overflow-auto",
        "image-gallery": "sm:max-w-5xl max-h-[95vh] p-2",
        comment: "sm:max-w-xl bg-gray-50 border-gray-200",
        admin: "sm:max-w-2xl bg-red-50 border-red-200",
        editor: "sm:max-w-6xl max-h-[95vh] bg-indigo-50 border-indigo-200",
        confirmation: "sm:max-w-md bg-yellow-50 border-yellow-200",
        error: "sm:max-w-lg bg-red-50 border-red-300",
        success: "sm:max-w-lg bg-green-50 border-green-200",
        fullscreen: "w-[95vw] h-[95vh] max-w-none max-h-none",
      },
      size: {
        default: "p-6",
        sm: "p-4 gap-3",
        lg: "p-8 gap-6",
        xl: "p-10 gap-8",
        none: "p-0 gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const dialogOverlayVariants = cva(
  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50",
  {
    variants: {
      variant: {
        default: "bg-black/50",
        blur: "bg-black/30 backdrop-blur-sm",
        dark: "bg-black/70",
        light: "bg-black/30",
        warm: "bg-amber-900/40 backdrop-blur-sm", // For JURNALİZE theme
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> &
  VariantProps<typeof dialogOverlayVariants>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(dialogOverlayVariants({ variant }), className)}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  variant,
  size,
  overlayVariant,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean;
    overlayVariant?: VariantProps<typeof dialogOverlayVariants>["variant"];
  }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay variant={overlayVariant} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(dialogContentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "centered" | "blog-post" | "admin" | "search";
}) {
  const headerVariants = {
    default: "flex flex-col gap-2 text-center sm:text-left",
    centered: "flex flex-col gap-2 text-center",
    "blog-post": "flex flex-col gap-3 text-left border-b border-amber-200 pb-4",
    admin: "flex flex-col gap-2 text-left border-b border-red-200 pb-3",
    search: "flex flex-col gap-2 text-center border-b border-amber-200 pb-3",
  };

  return (
    <div
      data-slot="dialog-header"
      className={cn(headerVariants[variant || "default"], className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "blog-post" | "admin" | "centered";
}) {
  const footerVariants = {
    default: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
    "blog-post":
      "flex flex-row justify-between items-center gap-4 border-t border-amber-200 pt-4",
    admin: "flex flex-row justify-end gap-3 border-t border-red-200 pt-3",
    centered: "flex flex-row justify-center gap-3",
  };

  return (
    <div
      data-slot="dialog-footer"
      className={cn(footerVariants[variant || "default"], className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
  variant?: "default" | "blog-post" | "admin" | "search" | "large";
}) {
  const titleVariants = {
    default: "text-lg leading-none font-semibold",
    "blog-post": "text-xl font-bold text-amber-800 leading-tight",
    admin: "text-lg font-semibold text-red-800",
    search: "text-lg font-semibold text-amber-800",
    large: "text-2xl font-bold leading-tight",
  };

  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(titleVariants[variant || "default"], className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & {
  variant?: "default" | "blog-post" | "admin" | "muted";
}) {
  const descriptionVariants = {
    default: "text-muted-foreground text-sm",
    "blog-post": "text-amber-700 text-sm leading-relaxed",
    admin: "text-red-700 text-sm",
    muted: "text-gray-500 text-xs",
  };

  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(descriptionVariants[variant || "default"], className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
  dialogOverlayVariants,
};
