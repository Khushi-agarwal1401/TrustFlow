import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Shield, Building2, FileText, Receipt, Key, Puzzle } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"

const settingsBase = [
  {
    title: "Organization",
    href: "/settings/organization",
    description: "Configure your organization details, team members, and billing info",
    icon: Building2,
  },
  {
    title: "Invoices",
    href: "/settings/invoices",
    description: "View and manage invoices, payment history, and billing details",
    icon: FileText,
  },
  {
    title: "Tax Information",
    href: "/settings/tax",
    description: "Manage your tax ID, tax type, and country for compliance",
    icon: Receipt,
  },
  {
    title: "API Keys",
    href: "/settings/api-keys",
    description: "Generate and manage API keys for integrations and automation",
    icon: Key,
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    description: "Connect GitHub, Slack, Linear, and other tools to your projects",
    icon: Puzzle,
  },
]

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const profileHref = `/profile/${session.user.id}`

  const settingsSections = [
    {
      title: "Profile",
      href: profileHref,
      description: "Manage your personal information, avatar, and display name",
      icon: Shield,
    },
    ...settingsBase,
  ]

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-6">
        <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
            <span className="text-text-muted">/</span>
            <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Settings</h1>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section, i) => {
            const Icon = section.icon
            return (
              <Link key={section.href} href={section.href}
                className={`card-double transition-all duration-200 hover:border-accent-primary/30 group animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="card-inner flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-subtle text-accent-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary" style={{ fontFamily: "var(--font-poppins)" }}>{section.title}</h3>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{section.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
