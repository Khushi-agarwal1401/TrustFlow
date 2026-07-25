import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string
  src?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  fallback?: string
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Avatar({ className, name, src, size = "md", fallback, ...props }: AvatarProps) {
  const initials = getInitials(name || fallback || "?")
  const colors = [
    "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]",
    "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
    "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
    "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
    "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
  ]
  const colorIndex = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length : 0

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-semibold",
        sizeMap[size],
        colors[colorIndex],
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || "Avatar"} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

export { Avatar }
