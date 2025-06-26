"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "",
        // Blog specific variants
        author: "ring-2 ring-amber-200 hover:ring-amber-400 transition-all",
        commenter: "ring-1 ring-gray-200 hover:ring-gray-300",
        admin: "ring-2 ring-red-300 hover:ring-red-400",
        moderator: "ring-2 ring-blue-300 hover:ring-blue-400",
        guest: "ring-1 ring-gray-100",
        featured: "ring-2 ring-gradient-to-r from-amber-400 to-orange-400",
      },
      size: {
        default: "size-8",
        sm: "size-6",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-20",
        "3xl": "size-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const avatarFallbackVariants = cva(
  "bg-muted flex size-full items-center justify-center rounded-full font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-600",
        author: "bg-amber-100 text-amber-800",
        commenter: "bg-gray-100 text-gray-600",
        admin: "bg-red-100 text-red-800 font-semibold",
        moderator: "bg-blue-100 text-blue-800",
        guest: "bg-gray-50 text-gray-500",
        featured:
          "bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800",
      },
      size: {
        default: "text-xs",
        sm: "text-[10px]",
        lg: "text-sm",
        xl: "text-base",
        "2xl": "text-lg",
        "3xl": "text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Avatar({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ variant, size }), className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("rounded-full aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(avatarFallbackVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  avatarVariants,
  avatarFallbackVariants,
};
