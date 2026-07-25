import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AlertOctagon, Clock, FileText, ShieldAlert } from "lucide-react"

export default async function DisputesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const disputes = await prisma.dispute.findMany({
    where: {
      OR: [
        { milestone: { project: { clientId: session.user.id } } },
        { milestone: { project: { freelancerId: session.user.id } } },
      ],
    },
    include: {
      milestone: {
        include: { 
          project: { select: { id: true, title: true, clientId: true, freelancerId: true, client: { select: { name: true } }, freelancer: { select: { name: true } } } } 
        },
      },
      evidences: true,
      opener: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED_ACCEPTED":
      case "RESOLVED_ADMIN":
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">Resolved</span>
      case "EVIDENCE_PENDING":
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">Awaiting Evidence</span>
      case "AI_SUGGESTED":
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">AI Suggested</span>
      case "ESCALATED":
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">Escalated to Admin</span>
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
          <h1 className="text-lg font-bold text-gray-900">Dispute Center</h1>
        </div>
        <div className="flex items-center gap-3">
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <span className="text-sm font-semibold text-gray-600">Resolution Hub</span>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Active Disputes</p>
          <h2 className="text-3xl font-bold text-gray-900">{disputes.filter(d => !d.status.startsWith('RESOLVED')).length}</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Resolved</p>
          <h2 className="text-3xl font-bold text-gray-900">{disputes.filter(d => d.status.startsWith('RESOLVED')).length}</h2>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm bg-red-50 border-red-100">
          <p className="text-sm font-semibold text-red-500 mb-2 uppercase tracking-wider">Requires Action</p>
          <h2 className="text-3xl font-bold text-red-600">{disputes.filter(d => d.status === 'EVIDENCE_PENDING' && d.openedBy !== session.user.id).length}</h2>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {disputes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShieldAlert className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>You have no active or past disputes.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {disputes.map((dispute) => {

              const isOpener = dispute.openedBy === session.user.id

              return (
                <div key={dispute.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(dispute.status)}
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Opened {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        Dispute for {dispute.milestone.project.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Milestone: <span className="font-medium text-gray-900">{dispute.milestone.title}</span> &bull; Amount in escrow: <span className="font-medium text-gray-900">{usdFormatter.format(dispute.milestone.amount / 100)}</span>
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <AlertOctagon className="w-4 h-4 text-gray-400" />
                          Opened by {isOpener ? 'You' : dispute.opener.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {dispute.evidences.length} Evidence document(s)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                      <Link href={`/projects/${dispute.milestone.project.id}/dispute`} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
