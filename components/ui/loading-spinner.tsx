import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

export function LoadingSpinner({
  className,
  size,
  ...props
}: LoadingSpinnerProps) {
  return (
    <div className={cn(spinnerVariants({ size, className }))} {...props} />
  );
}
