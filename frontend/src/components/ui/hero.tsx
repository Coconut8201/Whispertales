import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  emoji?: string
  gradient?: "primary" | "secondary" | "accent" | "rainbow"
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ className, title, subtitle, emoji, gradient = "primary", ...props }, ref) => {
    const gradientClasses = {
      primary: "from-children-primary to-children-accent",
      secondary: "from-children-secondary to-children-info",
      accent: "from-children-accent to-children-warning",
      rainbow: "from-children-primary via-children-accent to-children-secondary",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-b-children-lg bg-gradient-to-br p-6 shadow-children-medium mb-6",
          gradientClasses[gradient],
          className
        )}
        {...props}
      >
        <div className="text-center">
          {emoji && (
            <div className="text-6xl mb-4 animate-bounce-slow">
              {emoji}
            </div>
          )}
          <h1 className="text-children-xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {title}
          </h1>
          {subtitle && (
            <p className="text-children-md text-white/90 drop-shadow">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Hero.displayName = "Hero"

export { Hero }
