import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./card"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  emoji: string
  value: string | number
  label: string
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "info"
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, emoji, value, label, color = "primary", ...props }, ref) => {
    const colorClasses = {
      primary: "bg-children-bg-primary text-children-primary",
      secondary: "bg-children-bg-secondary text-children-secondary",
      accent: "bg-amber-50 text-children-accent",
      success: "bg-green-50 text-children-success",
      warning: "bg-orange-50 text-children-warning",
      info: "bg-blue-50 text-children-info",
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "text-center min-w-[120px] transition-transform hover:scale-105",
          colorClasses[color],
          className
        )}
        {...props}
      >
        <div className="text-3xl mb-2 animate-wiggle">
          {emoji}
        </div>
        <div className="text-2xl font-bold mb-1">
          {value}
        </div>
        <div className="text-children-sm text-children-text-secondary">
          {label}
        </div>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
