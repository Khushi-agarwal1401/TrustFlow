import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Shield, ArrowUpRight, ArrowDownRight, Clock, RefreshCw, CheckCircle, XCircle } from "lucide-react"


export default async function EscrowPaymentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const transactions = await prisma.escrowTransaction.findMany({
    where: {
      milestone: {
        project: {
          OR: [
            { clientId: session.user.id },
            { freelancerId: session.user.id }
          ]
        }
      }
    },
    include: {
      milestone: {
        include: {
          project: { select: { title: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Calculate metrics
  const activeEscrow = transactions
    .filter(t => t.type === "FUND" && t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalReleased = transactions
    .filter(t => t.type === "RELEASE" && t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + t.amount, 0)

  const activeEscrowCount = transactions.filter(t => t.type === "FUND" && t.status === "SUCCEEDED").length

  const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FUND": return <ArrowDownRight className="w-4 h-4 text-emerald-500" />
      case "RELEASE": return <ArrowUpRight className="w-4 h-4 text-indigo-500" />
      case "REFUND": return <RefreshCw className="w-4 h-4 text-orange-500" />
      default: return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED": return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case "PENDING": return <Clock className="w-4 h-4 text-amber-500" />
      case "FAILED": return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Escrow & Payments</h1>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">TrustFlow Secured</span>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Currently Protected</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-1">{usdFormatter.format(activeEscrow / 100)}</h2>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <Shield className="w-3 h-3" /> Across {activeEscrowCount} active milestone(s)
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Released</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-1">{usdFormatter.format(totalReleased / 100)}</h2>
          <p className="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3" /> Payouts completed
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-semibold text-gray-900">Transaction History</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No escrow transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Project / Milestone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          tx.type === 'FUND' ? 'bg-emerald-50' : 
                          tx.type === 'RELEASE' ? 'bg-indigo-50' : 'bg-orange-50'
                        }`}>
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{tx.type.toLowerCase()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{tx.provider} &bull; {new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{tx.milestone.project.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{tx.milestone.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(tx.status)}
                        <span className={`font-medium text-[13px] ${
                          tx.status === 'SUCCEEDED' ? 'text-emerald-700' :
                          tx.status === 'PENDING' ? 'text-amber-700' : 'text-red-700'
                        }`}>{tx.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${
                        tx.type === 'RELEASE' ? 'text-indigo-600' : 
                        tx.type === 'FUND' ? 'text-emerald-600' : 'text-gray-900'
                      }`}>
                        {tx.type === 'RELEASE' ? '-' : '+'}{usdFormatter.format(tx.amount / 100)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
