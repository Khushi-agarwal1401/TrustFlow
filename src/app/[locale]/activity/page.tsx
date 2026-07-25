import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Activity, Clock } from "lucide-react"

export default async function ActivityPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const events = await prisma.projectEvent.findMany({
    where: {
      project: {
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      }
    },
    include: {
      project: { select: { title: true } },
      actor: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Recent Activity</h1>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Audit Trail</span>
        </div>
      </header>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No recent activity found on your projects.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 relative">
            {events.map((evt, idx) => (
              <div key={evt.id} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors relative">
                {/* Timeline line */}
                {idx !== events.length - 1 && (
                  <div className="absolute left-[39px] top-14 bottom-[-20px] w-0.5 bg-gray-100 z-0"></div>
                )}
                
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-50 border border-gray-200 text-gray-500 z-10 relative">
                  <Activity className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#0F172A] truncate">
                      {evt.eventType.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium text-gray-900">{evt.actor?.name || "System"}</span> performed an action on <span className="font-medium text-gray-900">{evt.project.title}</span>.
                  </p>
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-600 font-mono overflow-x-auto">
                      {JSON.stringify(evt.metadata, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
