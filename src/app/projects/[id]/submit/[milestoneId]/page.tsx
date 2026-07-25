"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LinkEvidence {
  type: "github" | "drive" | "figma" | "url"
  url: string
  label: string
}

export default function SubmitPage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { id, milestoneId } = use(params)
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [fileUrls, setFileUrls] = useState<string[]>([])
  const [links, setLinks] = useState<LinkEvidence[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selected])
    setUploading(true)

    for (const file of selected) {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) setFileUrls((prev) => [...prev, data.url])
    }

    setUploading(false)
  }

  function addLink() {
    setLinks((prev) => [...prev, { type: "url", url: "", label: "" }])
  }

  function updateLink(index: number, field: keyof LinkEvidence, value: string) {
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    setSubmitting(true)
    const res = await fetch(`/api/milestones/${milestoneId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrls, linkEvidence: links }),
    })

    if (res.ok) {
      router.push(`/projects/${id}`)
    } else {
      const data = await res.json()
      alert(data.error || "Submission failed")
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary">&larr; Back to project</Link>

      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Submit Milestone</h1>

      <div className="space-y-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Upload Files</h3>
          <input type="file" multiple onChange={handleUpload} className="text-sm text-text-secondary" />
          {uploading && <p className="text-xs text-text-muted mt-2">Uploading...</p>}
          {fileUrls.length > 0 && (
            <div className="mt-3 space-y-1">
              {fileUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-accent-primary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span className="truncate">{url.split("/").pop()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Link Evidence</h3>
            <button onClick={addLink} className="text-accent-primary text-sm">+ Add link</button>
          </div>
          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={i} className="p-3 bg-bg-elevated rounded-lg space-y-2">
                <div className="flex gap-2">
                  <select
                    className="input w-1/3"
                    value={link.type}
                    onChange={(e) => updateLink(i, "type", e.target.value)}
                  >
                    <option value="github">GitHub</option>
                    <option value="drive">Google Drive</option>
                    <option value="figma">Figma</option>
                    <option value="url">URL</option>
                  </select>
                  <input className="input flex-1" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Label" />
                  <button onClick={() => removeLink(i)} className="text-danger text-sm">Remove</button>
                </div>
                <input className="input" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://..." />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || (fileUrls.length === 0 && links.length === 0)}
          className="btn-primary w-full"
        >
          {submitting ? "Submitting..." : "Submit Milestone"}
        </button>
      </div>
    </div>
  )
}
