import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Bell, Clock } from "lucide-react"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  // Optionally mark all as read here, or leave it to client-side
  const unreadCount = notifications.filter(n => !n.readAt).length

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">{unreadCount} Unread</span>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const isUnread = !notif.readAt
              return (
                <div key={notif.id} className={`p-5 flex items-start gap-4 transition-colors ${isUnread ? 'bg-[#EEF2FF]/50' : 'hover:bg-gray-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnread ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-gray-100 text-gray-500'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold truncate ${isUnread ? 'text-[#0F172A]' : 'text-gray-700'}`}>
                        {notif.type.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {JSON.stringify(notif.payload)}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="shrink-0 flex items-center justify-center h-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
