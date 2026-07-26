"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ClauseTemplates } from "../clause-templates"

export default function LegalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  useSession()
  const router = useRouter()
  const [project, setProject] = useState<{ title: string } | null>(null)
  const [contract, setContract] = useState<{ id: string; signatures: { id: string; user: { name: string }; signedAt: string }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    async function load() {
      const projRes = await fetch(`/api/projects/${id}`)
      const projData = await projRes.json()
      setProject(projData)
      if (projData.contract) {
        await fetch(`/api/contracts/${projData.contract.id}/pdf`)
        setContract(projData.contract)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSign() {
    if (!contract) return
    setSigning(true)
    await fetch(`/api/contracts/${contract.id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signatureData: { signed: true, timestamp: new Date().toISOString() } }),
    })
    
    // router.refresh() does not update client state, so we must re-fetch
    const projRes = await fetch(`/api/projects/${id}`)
    const projData = await projRes.json()
    if (projData.contract) {
      setContract(projData.contract)
    }
    
    setSigning(false)
    router.refresh()
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>
  if (!project) return <div className="p-6 text-text-muted">Project not found</div>
  if (!contract) return <div className="p-6 text-text-muted">No contract to sign</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Legal · {project.title}</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-4">
          <h2 className="font-semibold mb-4">Contract Preview</h2>
          <iframe src={`/api/contracts/${contract.id}/pdf?v=${contract.signatures?.length || 0}`} className="w-full h-[600px] rounded-lg border border-border-subtle" />
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-3">Signatures</h3>
            <div className="space-y-2">
              {!contract.signatures || contract.signatures.length === 0 ? (
                <p className="text-sm text-text-muted">No signatures yet</p>
              ) : (
                contract.signatures.map((s) => (
                  <div key={s.id} className="text-sm p-2 bg-bg-elevated rounded">
                    <p className="font-medium">{s.user?.name || "Unknown User"}</p>
                    <p className="text-xs text-text-muted">{new Date(s.signedAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
            <button onClick={handleSign} disabled={signing} className="btn-primary w-full mt-4">
              {signing ? "Signing..." : "Sign Contract"}
            </button>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Clause Templates</h3>
            <ClauseTemplates />
            <div className="mt-3 pt-3 border-t border-border-subtle">
              <a href={`/api/contracts/${contract.id}/pdf`} target="_blank" className="btn-ghost w-full text-sm text-center block">
                Export PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
