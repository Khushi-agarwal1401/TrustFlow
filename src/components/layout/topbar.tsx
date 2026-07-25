import { User } from "@prisma/client"

export function Topbar({ user }: { user: User }) {
  return (
    <header className="h-[72px] bg-[var(--color-bg-surface)] border-b border-[var(--color-border-subtle)] flex items-center justify-between px-8 shrink-0">
      <div className="flex-1 max-w-xl relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input 
          type="text" 
          placeholder="Search projects, freelancers, invoices..." 
          className="w-full pl-10 pr-12 py-2.5 bg-white border border-[var(--color-border-default)] rounded-xl text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent-primary)] transition-all placeholder:text-[var(--color-text-muted)]" 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 h-5 text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] rounded border border-[var(--color-border-subtle)]">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-5 pl-4">
        <button className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-danger)] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--color-bg-surface)]">5</span>
        </button>
        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        </button>
        <div className="h-6 w-px bg-[var(--color-border-subtle)]"></div>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden shrink-0 border border-[var(--color-border-subtle)]">
             {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--color-accent-primary)]"></div>}
          </div>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] hidden md:block">{user.name?.split(' ')[0]}</span>
        </div>
      </div>
    </header>
  )
}
