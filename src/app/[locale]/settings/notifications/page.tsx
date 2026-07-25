"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function NotificationsPage() {
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [subscribing, setSubscribing] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setPushSupported(true)
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setPushEnabled(!!sub)
        })
      })
    }
  }, [])

  async function subscribePush() {
    setSubscribing(true)
    setStatus(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      })

      await fetch("/api/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(sub.getKey("p256dh")!),
            auth: arrayBufferToBase64(sub.getKey("auth")!),
          },
        }),
      })

      setPushEnabled(true)
      setStatus("Push notifications enabled!")
    } catch (err) {
      setStatus("Failed to enable push notifications")
      console.error(err)
    } finally {
      setSubscribing(false)
    }
  }

  async function unsubscribePush() {
    setSubscribing(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch("/api/push-subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setPushEnabled(false)
      setStatus("Push notifications disabled")
    } catch (err) {
      setStatus("Failed to disable push notifications")
      console.error(err)
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Notification Settings</h1>
        </div>
      </header>

      <div className="space-y-6">
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Push Notifications</h3>
                <p className="text-sm text-text-secondary mt-0.5">Get notified about milestone submissions, messages, and project updates</p>
              </div>
              <div className="flex items-center gap-3">
                {pushSupported ? (
                  <button
                    onClick={pushEnabled ? unsubscribePush : subscribePush}
                    disabled={subscribing}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      pushEnabled ? "bg-accent-primary" : "bg-bg-elevated"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        pushEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                ) : (
                  <span className="text-xs text-text-muted">Not supported in this browser</span>
                )}
              </div>
            </div>
            {status && (
              <div className={`p-3 rounded-lg text-sm ${
                status.includes("enabled") || status.includes("disabled")
                  ? "bg-accent-subtle text-accent-primary"
                  : "bg-danger/10 text-danger"
              }`}>
                {status}
              </div>
            )}
          </div>
        </div>

        <div className="card-double animate-fade-up stagger-2">
          <div className="card-inner">
            <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Email Notifications</h3>
            <p className="text-sm text-text-secondary">
              Email notifications are handled automatically based on your activity in the platform. You&apos;ll receive emails for
              project invites, milestone updates, and dispute activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
