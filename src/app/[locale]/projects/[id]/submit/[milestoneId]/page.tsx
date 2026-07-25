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
  const [fileUrls, setFileUrls] = useState<string[]>([])
  const [links, setLinks] = useState<LinkEvidence[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(selectedFiles: File[]) {
    if (selectedFiles.length === 0) return
    setUploading(true)
    setError(null)

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (data.url) {
          setFileUrls((prev) => [...prev, data.url])
        } else {
          throw new Error("Failed to upload " + file.name)
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(Array.from(e.dataTransfer.files))
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      handleUpload(Array.from(e.target.files))
    }
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
    setError(null)
    const res = await fetch(`/api/milestones/${milestoneId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrls, linkEvidence: links }),
    })

    if (res.ok) {
      router.push(`/projects/${id}`)
    } else {
      const data = await res.json()
      setError(data.error || "Submission failed")
      setSubmitting(false)
    }
  }

  const linkIcons = {
    github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
    drive: "M21.1 12.5l-3.2-5.4A8.9 8.9 0 0 0 12 3a8.9 8.9 0 0 0-5.9 4.1L2.9 12.5M12 21a8.9 8.9 0 0 0 5.9-4.1l3.2-5.4M12 21a8.9 8.9 0 0 1-5.9-4.1l-3.2-5.4",
    figma: "M5.5 5.5A3.5 3.5 0 0 1 9 2h6a3.5 3.5 0 0 1 3.5 3.5v13A3.5 3.5 0 0 1 15 22H9a3.5 3.5 0 0 1-3.5-3.5v-13z M9 9h6 M9 15h6",
    url: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8 relative min-h-screen">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to project</Link>

      <div className="mt-8 space-y-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Submit Milestone</h1>
          <p className="text-text-secondary mt-1">Upload files or provide links as evidence of completed work.</p>
        </div>

        {error && <div className="p-4 bg-danger/10 rounded-xl text-sm text-danger text-center">{error}</div>}

        <div className="card p-6 border border-border-default shadow-sm bg-bg-surface space-y-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">Upload Files</h3>
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-accent-primary bg-accent-subtle' : 'border-border-subtle bg-bg-elevated'}`}
            >
              <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-8 h-8 text-text-muted mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-accent-primary hover:underline">Click to upload</span>
                <span className="text-xs text-text-muted mt-1">or drag and drop files here</span>
              </label>
            </div>
            
            {uploading && <p className="text-xs text-accent-primary font-medium mt-3 animate-pulse">Uploading files...</p>}
            
            {fileUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fileUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-bg-elevated border border-border-subtle rounded-lg text-xs text-text-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-primary flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span className="truncate">{url.split("/").pop()?.split("?")[0] || "file"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border-subtle pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Link Evidence</h3>
              <button onClick={addLink} className="btn-ghost text-xs py-1.5 px-3 rounded-full">+ Add link</button>
            </div>
            <div className="space-y-3">
              {links.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-4 bg-bg-elevated rounded-xl border border-dashed border-border-subtle">No links added. Useful for GitHub, Figma, or Google Drive.</p>
              ) : (
                links.map((link, i) => (
                  <div key={i} className="p-4 bg-bg-elevated rounded-xl border border-border-subtle space-y-3">
                    <div className="flex gap-2">
                      <div className="relative w-1/3">
                        <select
                          className="input w-full appearance-none pl-9 text-sm"
                          value={link.type}
                          onChange={(e) => updateLink(i, "type", e.target.value)}
                        >
                          <option value="github">GitHub</option>
                          <option value="drive">Drive</option>
                          <option value="figma">Figma</option>
                          <option value="url">URL</option>
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d={linkIcons[link.type as keyof typeof linkIcons]} />
                          </svg>
                        </div>
                      </div>
                      <input className="input flex-1 text-sm" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} placeholder="Description (e.g. Frontend code)" />
                      <button onClick={() => removeLink(i)} className="text-danger text-sm px-2 hover:underline">Remove</button>
                    </div>
                    <input className="input text-sm font-mono" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} placeholder="https://..." />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border-subtle bg-bg-surface z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <span className="text-sm text-text-secondary">AI will review these materials.</span>
            <div className="flex gap-3">
              <Link href={`/projects/${id}`} className="btn-ghost">Cancel</Link>
              <button
                onClick={handleSubmit}
                disabled={submitting || (fileUrls.length === 0 && links.length === 0)}
                className="btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Milestone"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
