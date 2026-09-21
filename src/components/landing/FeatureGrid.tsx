import { ReactNode } from "react"
import { GlassCard } from "./GlassCard"

interface Feature {
  title: string
  description: string
  icon: ReactNode
}

interface FeatureGridProps {
  features: Feature[]
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <GlassCard key={i} hoverEffect className="p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center text-accent-primary">
            {feature.icon}
          </div>
          <h3 className="font-semibold text-lg text-text-primary">
            {feature.title}
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            {feature.description}
          </p>
        </GlassCard>
      ))}
    </div>
  )
}
