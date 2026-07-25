import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  User, Bell, Shield, Key, FileText, 
  Settings as SettingsIcon, Building, DollarSign, Plug
} from "lucide-react"

export default async function SettingsHubPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const settingsLinks = [
    {
      title: "Profile Settings",
      description: "Manage your personal information, avatar, and roles.",
      icon: <User className="w-6 h-6 text-indigo-500" />,
      href: "/settings/profile",
      color: "bg-indigo-50"
    },
    {
      title: "Organization",
      description: "Manage your team, invite members, and configure team settings.",
      icon: <Building className="w-6 h-6 text-blue-500" />,
      href: "/settings/organization",
      color: "bg-blue-50"
    },
    {
      title: "Notifications",
      description: "Configure email and push notification preferences.",
      icon: <Bell className="w-6 h-6 text-amber-500" />,
      href: "/settings/notifications",
      color: "bg-amber-50"
    },
    {
      title: "Integrations & Webhooks",
      description: "Connect third-party services and manage webhook deliveries.",
      icon: <Plug className="w-6 h-6 text-emerald-500" />,
      href: "/settings/integrations",
      color: "bg-emerald-50"
    },
    {
      title: "API Keys",
      description: "Manage programmatic access to your account and organization.",
      icon: <Key className="w-6 h-6 text-purple-500" />,
      href: "/settings/api-keys",
      color: "bg-purple-50"
    },
    {
      title: "Invoices & Billing",
      description: "Manage your billing details, view past invoices, and add payment methods.",
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      href: "/settings/invoices",
      color: "bg-green-50"
    },
    {
      title: "Tax Information",
      description: "Update your tax ID, country of residence, and compliance details.",
      icon: <FileText className="w-6 h-6 text-orange-500" />,
      href: "/settings/tax",
      color: "bg-orange-50"
    },
    {
      title: "Audit Log",
      description: "View a history of actions taken on your account and projects.",
      icon: <Shield className="w-6 h-6 text-red-500" />,
      href: "/settings/audit-log",
      color: "bg-red-50"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Preferences</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsLinks.map((link, idx) => (
          <Link 
            key={idx} 
            href={link.href}
            className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:border-[#4F46E5]/30 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${link.color}`}>
                {link.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#4F46E5] transition-colors">
                {link.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {link.description}
              </p>
            </div>
            <div className="mt-6 flex items-center text-sm font-medium text-[#4F46E5]">
              Manage &rarr;
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
