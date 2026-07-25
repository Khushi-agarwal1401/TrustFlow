import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "purple" | "blue" | "cyan" | "none"
  hoverEffect?: boolean
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hoverEffect = false,
  ...props
}: GlassCardProps) {
  const glowClasses = {
    purple: "before:from-brand-primary/20 before:to-transparent",
    blue: "before:from-brand-secondary/20 before:to-transparent",
    cyan: "before:from-brand-cyan/20 before:to-transparent",
    none: "before:hidden",
  }

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-brand-surface/50 backdrop-blur-md border border-[rgba(255,255,255,0.06)] overflow-hidden",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:opacity-50",
        glowClasses[glow],
        hoverEffect && "transition-all duration-300 hover:border-[rgba(255,255,255,0.15)] hover:shadow-lg hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
