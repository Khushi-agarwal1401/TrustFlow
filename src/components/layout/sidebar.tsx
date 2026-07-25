"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "@prisma/client"
import { Button } from "../ui/button"

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Contracts', path: '/contracts' },
    { name: 'Milestones', path: '/milestones' },
    { name: 'Escrow & Payments', path: '/escrow-payments' },
    { name: 'Disputes', path: '/disputes' },
    { name: 'Freelancers', path: '/freelancers' },
    { name: 'Messages', path: '/messages', badge: '3' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Reports', path: '/reports' },
    { name: 'Settings', path: '/settings' },
  ]

  return (
    <aside className="w-[260px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col justify-between hidden lg:flex shrink-0 h-screen overflow-y-auto">
      <div>
        <div className="h-[72px] flex items-center px-6 border-b border-transparent">
          <Link href="/" className="flex items-center gap-2.5 text-[var(--color-accent-primary)] hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span className="font-bold text-xl tracking-tight text-[var(--color-text-primary)] font-poppins">TrustFlow</span>
          </Link>
        </div>
        <nav className="px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            // Check if exact match or nested route, but special case for root
            const isActive = item.path === '/' 
              ? pathname === '/' 
              : pathname.startsWith(item.path)

            return (
              <Link 
                key={item.name} 
                href={item.path} 
                className={`flex items-center gap-3 px-3 py-2.5 font-semibold rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]' 
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {/* Simple generic icon for now based on active state */}
                <div className={`w-[18px] h-[18px] rounded-sm flex-shrink-0 mask mask-squircle ${isActive ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-text-muted)] opacity-50'}`}></div>
                {item.name}
                {item.badge && <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]'}`}>{item.badge}</span>}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="p-4">
        <div className="bg-[var(--color-bg-base)] rounded-xl p-5 mb-4 relative overflow-hidden group border border-[var(--color-border-subtle)] shadow-sm">
          <div className="absolute top-3 left-3 text-[var(--color-accent-primary)]">
             <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div className="relative z-10 pl-5">
            <h4 className="text-xs font-bold text-[var(--color-accent-primary)] mb-1">
              Upgrade to Pro
            </h4>
            <p className="text-[10px] text-[var(--color-text-secondary)] mb-3 leading-relaxed">Unlock advanced analytics, priority support and more.</p>
            <Button variant="primary" className="w-full text-[10px] py-1.5 h-auto">Upgrade Now</Button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden shrink-0 border border-[var(--color-border-subtle)]">
             {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--color-accent-primary)]"></div>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--color-text-secondary)] capitalize">{user.roles?.[0]?.toLowerCase() || "User"}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
