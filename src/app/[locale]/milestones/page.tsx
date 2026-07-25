import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Flag, Calendar, ArrowRight, CircleDashed } from "lucide-react"

export default async function MilestonesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const milestones = await prisma.milestone.findMany({
    where: {
      project: {
        OR: [
          { clientId: session.user.id },
          { freelancerId: session.user.id }
        ]
      }
    },
    include: {
      project: {
        select: { id: true, title: true, clientId: true, freelancerId: true, client: { select: { name: true } }, freelancer: { select: { name: true } } }
      }
    },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" }
    ]
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PAID":
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Completed</span>
      case "DISPUTED":
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">Disputed</span>
      case "REVISION_REQUESTED":
      case "IN_REVIEW":
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">Needs Attention</span>
      case "FUNDED":
        return <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">In Progress</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">{status}</span>
    }
  }

  const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Milestones</h1>
        </div>
        <div className="flex items-center gap-3">
          <Flag className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Task Tracker</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {milestones.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            <Flag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No active milestones across your projects.</p>
          </div>
        ) : (
          milestones.map((m) => {
            const isClient = m.project.clientId === session.user.id
            const counterparty = isClient ? m.project.freelancer : m.project.client
            const isOverdue = m.dueDate && new Date(m.dueDate) < new Date() && m.status !== "APPROVED" && m.status !== "PAID"

            return (
              <div key={m.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {getStatusBadge(m.status)}
                    <span className="text-sm font-bold text-gray-900">{usdFormatter.format(m.amount / 100)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1" title={m.title}>{m.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{m.deliverableDescription}</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 truncate max-w-[150px]" title={m.project.title}>
                      <CircleDashed className="w-3.5 h-3.5 text-[#4F46E5]" />
                      {m.project.title}
                    </span>
                    <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200">
                      {isClient ? 'Freelancer' : 'Client'}: {counterparty?.name || 'Pending'}
                    </span>
                    <Link href={`/projects/${m.project.id}`} className="text-[#4F46E5] p-1.5 hover:bg-[#EEF2FF] rounded-lg transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
