import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FileText, CheckCircle, Clock, Download, ExternalLink } from "lucide-react"

export default async function ContractsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const contracts = await prisma.contract.findMany({
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
        select: {
          id: true,
          title: true,
          clientId: true,
          freelancerId: true,
          status: true,
          client: { select: { name: true } },
          freelancer: { select: { name: true } }
        }
      },
      signatures: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Contracts & Legal</h1>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Smart Agreements</span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {contracts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No contracts found.</p>
          </div>
        ) : (
          contracts.map((contract) => {
            const isClient = contract.project.clientId === session.user.id
            const counterparty = isClient ? contract.project.freelancer : contract.project.client
            const isSigned = !!contract.acceptedByFreelancerAt

            return (
              <div key={contract.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#4F46E5]/30">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSigned ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isSigned ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{contract.project.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <span>{isClient ? 'Freelancer' : 'Client'}: {counterparty?.name || 'Pending Invite'}</span>
                      <span>&bull;</span>
                      <span>Generated {new Date(contract.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isSigned ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isSigned ? `Signed on ${new Date(contract.acceptedByFreelancerAt!).toLocaleDateString()}` : 'Awaiting Signature'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {contract.signatures.length} Signatures
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:border-l md:border-gray-100 md:pl-6 pt-4 md:pt-0 border-t border-gray-100">
                  {contract.pdfUrl && (
                    <a href={contract.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                      <Download className="w-4 h-4" /> PDF
                    </a>
                  )}
                  <Link href={`/projects/${contract.project.id}/legal`} className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] text-white text-sm font-medium rounded-lg hover:bg-[#4338CA] transition-colors shadow-sm">
                    View Contract <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
