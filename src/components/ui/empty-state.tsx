import * as React from "react"
import { cn } from "@/lib/utils"
import { Inbox, FileSearch, PackageOpen, Users } from "lucide-react"

const icons = {
  inbox: Inbox,
  search: FileSearch,
  package: PackageOpen,
  users: Users,
}

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: keyof typeof icons | React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({ className, icon = "inbox", title, description, action, ...props }: EmptyStateProps) {
  const IconComponent = typeof icon === "string" ? icons[icon as keyof typeof icons] : null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-5">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-[var(--color-text-muted)]" strokeWidth={1.5} />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--color-text-muted)] max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export { EmptyState }
