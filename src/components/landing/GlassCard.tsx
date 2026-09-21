import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "purple" | "blue" | "cyan" | "none" // Keeping for backwards compat, but ignoring
  hoverEffect?: boolean
}

export function GlassCard({
  children,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  glow = "none",
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-bg-surface border border-border-subtle overflow-hidden shadow-card",
        hoverEffect && "transition-all duration-300 hover:border-border-strong hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
