import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full text-[11px] font-medium tracking-wide transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
        primary: "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]",
        success: "bg-[var(--color-success-subtle)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]",
        danger: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]",
        info: "bg-[var(--color-info-subtle)] text-[var(--color-info)]",
        outline: "border border-[var(--color-border-default)] text-[var(--color-text-secondary)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1",
        lg: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" && "bg-[var(--color-success)]",
          variant === "warning" && "bg-[var(--color-warning)]",
          variant === "danger" && "bg-[var(--color-danger)]",
          variant === "info" && "bg-[var(--color-info)]",
          variant === "primary" && "bg-[var(--color-accent-primary)]",
          (!variant || variant === "default" || variant === "outline") && "bg-[var(--color-text-muted)]",
        )} />
      )}
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
