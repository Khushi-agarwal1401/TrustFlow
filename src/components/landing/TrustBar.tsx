export function TrustBar() {
  const labels = [
    "Existing Freelancer Relationships",
    "Milestone Contracts",
    "Protected Payments",
    "Evidence-Based Reviews",
    "Auditable Disputes",
  ]

  return (
    <section className="w-full border-y border-[rgba(255,255,255,0.06)] bg-brand-surface/30 backdrop-blur-sm py-10 mt-12 md:mt-24">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-center font-poppins font-semibold text-brand-text-muted text-sm tracking-wider uppercase mb-8">
          Built for the way freelance work actually happens
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-brand-text-secondary text-sm font-medium whitespace-nowrap">
                {label}
              </span>
              {i < labels.length - 1 && (
                <div className="hidden md:block w-1 h-1 rounded-full bg-brand-primary/40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
