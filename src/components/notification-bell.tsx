"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

interface Notification {
  id: string
  type: string
  payload: { title?: string; message?: string } | null
  readAt: string | null
  createdAt: string
}

export function NotificationBell() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/notifications").then((r) => r.json()).then(setNotifications)
  }, [session])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const unread = notifications.filter((n) => !n.readAt).length

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
  }

  if (!session?.user) return null

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2 btn-ghost">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass rounded-xl shadow-2xl z-50">
          <div className="p-3 border-b border-border-subtle">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <p className="p-4 text-text-muted text-sm">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 border-b border-border-subtle cursor-pointer hover:bg-bg-hover ${!n.readAt ? "bg-accent-subtle" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <p className="text-sm font-medium text-text-primary">{n.payload?.title || n.type}</p>
                <p className="text-xs text-text-muted mt-1">{n.payload?.message || JSON.stringify(n.payload)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
