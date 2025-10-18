import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-children-md px-4 py-2 text-children-sm font-bold transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-children-primary to-children-primary-light text-children-text-white shadow-children-soft",
        secondary:
          "bg-gradient-to-r from-children-secondary to-children-secondary-light text-children-text-white shadow-children-soft",
        success:
          "bg-gradient-to-r from-children-success to-children-success-light text-children-text-white shadow-children-soft",
        warning:
          "bg-gradient-to-r from-children-warning to-children-warning-light text-children-text-white shadow-children-soft",
        accent:
          "bg-gradient-to-r from-children-accent to-children-accent-light text-children-text-primary shadow-children-soft",
        outline:
          "border-2 border-children-primary text-children-primary bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
