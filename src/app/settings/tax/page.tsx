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

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Tax Information</h1>

      <form onSubmit={handleSubmit} className="card p-4 mb-6 space-y-3">
        <h3 className="font-semibold">Add Tax Info</h3>
        <div className="grid grid-cols-2 gap-3">
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
      </form>

      <div className="space-y-2">
        {taxInfos.length === 0 ? (
          <p className="text-text-muted text-sm">No tax information saved</p>
        ) : (
          taxInfos.map((t) => (
            <div key={t.id} className="card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.taxType}: {t.taxId}</p>
                <p className="text-xs text-text-muted">{t.country}{t.address ? ` · ${t.address}` : ""}</p>
              </div>
              <span className={`text-xs ${t.isVerified ? "text-success" : "text-warning"}`}>{t.isVerified ? "Verified" : "Unverified"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
