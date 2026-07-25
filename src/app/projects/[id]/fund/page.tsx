"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

function CheckoutForm({ projectId, onCancel, onSuccess }: { projectId: string, onCancel: () => void, onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setPaying(true)
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || "An error occurred")
      setPaying(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message || "Payment failed")
      setPaying(false)
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Call the API to update the project status and transactions
      const res = await fetch("/api/escrow/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, paymentIntentId: paymentIntent.id }),
      })
      if (res.ok) {
        onSuccess()
      } else {
        setError("Payment succeeded but failed to update project status.")
        setPaying(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "accordion" }} />
      {error && <div className="p-3 bg-danger/10 rounded-lg text-sm text-danger text-center">{error}</div>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} disabled={paying} className="btn-ghost flex-1">
          Cancel
        </button>
        <button type="submit" disabled={!stripe || paying} className="btn-primary flex-1">
          {paying ? "Processing Payment..." : "Fund Escrow"}
        </button>
      </div>
      <p className="text-xs text-text-muted text-center mt-4">Funds are held in escrow and released only when milestones are approved.</p>
    </form>
  )
}

export default function FundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<{ title: string; totalAmount: number; milestones: { title: string; amount: number }[] } | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const projRes = await fetch(`/api/projects/${id}`)
        if (!projRes.ok) throw new Error("Failed to load project")
        const projData = await projRes.json()
        setProject(projData)

        const intRes = await fetch("/api/escrow/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: id }),
        })
        const intData = await intRes.json()
        if (!intRes.ok) {
          setError(intData.error || "Failed to create payment intent")
        } else {
          setClientSecret(intData.clientSecret)
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="card p-8 space-y-4 border border-border-default shadow-sm"><div className="skeleton h-6 w-48" /><div className="skeleton h-3 w-64" /><div className="skeleton h-32 w-full" /></div>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to Project</Link>

      <div className="mt-8 card p-8 border border-border-default shadow-sm bg-bg-surface">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Fund Escrow</h1>
          <p className="text-text-secondary mt-2">Deposit funds to start the project</p>
        </div>

        {project && (
          <div className="bg-bg-elevated border border-border-subtle rounded-xl p-5 mb-8">
            <p className="font-semibold text-lg mb-2">{project.title}</p>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-subtle">
              <span className="text-text-muted text-sm">Total Budget</span>
              <span className="font-bold text-xl" style={{ fontFamily: "var(--font-poppins)" }}>${(project.totalAmount / 100).toLocaleString()}</span>
            </div>
            {project.milestones.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-text-muted tracking-wider">MILESTONES</p>
                {project.milestones.map((m, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 text-text-secondary">
                    <span>{m.title}</span>
                    <span className="font-medium text-text-primary">${(m.amount / 100).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && !clientSecret && (
          <div className="p-4 bg-danger/10 rounded-xl text-sm text-danger text-center">{error}</div>
        )}

        {clientSecret && (
          <div className="pt-2">
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#6C63FF', colorBackground: '#1C1B3B', colorText: '#F1F0FF' } } }}>
              <CheckoutForm 
                projectId={id} 
                onCancel={() => router.push(`/projects/${id}`)}
                onSuccess={() => router.push(`/projects/${id}?funded=true`)} 
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  )
}
