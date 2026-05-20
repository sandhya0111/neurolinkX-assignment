import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 px-8 py-3",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Enables a loading spinner and disables the button */
  isLoading?: boolean;
}

/**
 * Enterprise-grade Button Component
 * 
 * Supports variants, sizes, and a loading state. 
 * Designed using `cva` to strictly type the available prop configurations.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-inherit shrink-0" aria-hidden="true" />}
        {/* We keep children slightly faded/transparent if loading doesn't explicitly hide them, or just let them render alongside the spinner */}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
