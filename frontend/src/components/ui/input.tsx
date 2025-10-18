import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 sm:h-14 w-full rounded-children-sm sm:rounded-children-md border-2 sm:border-3 border-gray-200 bg-children-bg-card px-3 sm:px-4 md:px-5 py-2 sm:py-3 text-sm sm:text-base md:text-children-md transition-all file:border-0 file:bg-transparent file:text-xs sm:file:text-children-sm file:font-medium placeholder:text-children-text-secondary/50 focus-visible:outline-none focus-visible:border-children-primary focus-visible:ring-2 sm:focus-visible:ring-4 focus-visible:ring-children-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
