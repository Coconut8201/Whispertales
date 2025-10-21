import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-children-md sm:rounded-children-lg md:rounded-children-xl text-sm sm:text-base md:text-children-md font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-children-primary to-children-primary-light text-children-text-white shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-br from-children-secondary to-children-secondary-light text-children-text-white shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
        success:
          "bg-gradient-to-br from-children-success to-children-success-light text-children-text-white shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
        warning:
          "bg-gradient-to-br from-children-warning to-children-warning-light text-children-text-white shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
        accent:
          "bg-gradient-to-br from-children-accent to-children-accent-light text-children-text-primary shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
        outline:
          "border-2 sm:border-3 border-children-primary bg-transparent text-children-primary hover:bg-children-bg-primary",
        ghost: "hover:bg-children-bg-primary text-children-text-primary",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-children-soft hover:shadow-children-medium hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 sm:h-12 px-4 sm:px-6 md:px-8 py-2 sm:py-3",
        sm: "h-8 sm:h-10 px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-children-sm rounded-children-sm sm:rounded-children-md",
        lg: "h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-12 py-3 sm:py-3.5 md:py-4 text-base sm:text-lg md:text-children-lg rounded-children-md sm:rounded-children-lg md:rounded-children-xl",
        icon: "h-10 w-10 sm:h-12 sm:w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
