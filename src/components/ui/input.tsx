import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] px-3.5 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] transition-all duration-200",
              "hover:border-[var(--color-border-strong)]",
              "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--color-accent-ring)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger-ring)]",
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{hint}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
