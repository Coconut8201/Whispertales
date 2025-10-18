import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  emoji?: string
  message?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", emoji = "🎨", message = "載入中...", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-12 h-12",
      md: "w-16 h-16",
      lg: "w-24 h-24",
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-4 p-8", className)}
        {...props}
      >
        <div className="relative">
          <div
            className={cn(
              "rounded-full border-6 border-gray-200 border-t-children-primary animate-spin",
              sizeClasses[size]
            )}
          />
          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">
            {emoji}
          </div>
        </div>
        {message && (
          <p className="text-children-md font-bold text-children-primary animate-pulse">
            {message}
          </p>
        )}
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }
