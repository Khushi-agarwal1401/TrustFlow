"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function TaxPage() {
  const [taxInfos, setTaxInfos] = useState<{ id: string; taxId: string; taxType: string; country: string; address: string | null; isVerified: boolean }[]>([])
  const [taxId, setTaxId] = useState("")
  const [taxType, setTaxType] = useState("VAT")
  const [country, setCountry] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tax-info").then((r) => r.json()).then((data) => {
      setTaxInfos(data)
      setLoading(false)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/tax-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxId, taxType, country, address }),
    })
    if (res.ok) {
      setTaxId(""); setAddress("")
      const data = await fetch("/api/tax-info").then((r) => r.json())
      setTaxInfos(data)
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Tax Information</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="card-double mb-6 animate-fade-up stagger-1">
        <div className="card-inner space-y-4">
          <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Add Tax Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Tax ID / EIN / VAT" required />
            <select className="input" value={taxType} onChange={(e) => setTaxType(e.target.value)}>
              <option value="VAT">VAT</option>
              <option value="EIN">EIN</option>
              <option value="SSN">SSN</option>
              <option value="GST">GST</option>
              <option value="OTHER">Other</option>
            </select>
            <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country code (US, GB, etc.)" required />
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Business address" />
          </div>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>

      <div className="space-y-2 animate-fade-up stagger-2">
        {taxInfos.length === 0 ? (
          <div className="card-double"><div className="card-inner text-center py-8">
            <p className="text-text-muted text-sm">No tax information saved</p>
          </div></div>
        ) : (
          taxInfos.map((t, i) => (
            <div key={t.id} className={`card-double animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="card-inner flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.taxType}: {t.taxId}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t.country}{t.address ? ` · ${t.address}` : ""}</p>
                </div>
                <span className={`badge ${t.isVerified ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                  {t.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
