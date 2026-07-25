import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "double" | "glass" | "interactive"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-card",
    elevated: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-card hover:shadow-card-hover hover:border-[var(--color-accent-primary)] hover:-translate-y-0.5 transition-all duration-300",
    double: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-[20px] shadow-card p-[2px]",
    glass: "bg-[var(--color-bg-surface)] backdrop-blur-2xl border border-[var(--color-border-subtle)] rounded-2xl shadow-card",
    interactive: "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-card hover:shadow-card-hover hover:border-[var(--color-accent-primary)]/30 transition-all duration-200 cursor-pointer",
  }

  return (
    <div ref={ref} className={cn(variants[variant], className)} {...props}>
      {variant === "double" ? <div className="bg-[var(--color-bg-surface)] rounded-[18px] p-5">{props.children}</div> : props.children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5 pb-0", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("font-semibold text-base tracking-tight", className)} {...props} />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[var(--color-text-secondary)] leading-relaxed", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-5 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
