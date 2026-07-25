"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="card-double relative animate-fade-up">
          <div className="card-inner p-8">
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center mx-auto mb-5">
              <span className="text-white text-lg font-bold">T</span>
            </div>

            <h1 className="text-xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
              Sign in to TrustFlow
            </h1>
            <p className="text-text-secondary text-center text-sm mb-7">
              AI-powered accountability for freelance projects
            </p>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="btn-primary w-full flex items-center justify-center gap-2.5 mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle" /></div>
              <div className="relative flex justify-center">
                <span className="bg-bg-surface px-3 text-text-muted text-xs">or continue with email</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                signIn("credentials", { email, password, callbackUrl: "/" })
              }}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <button type="submit" className="btn-primary w-full">
                Sign In / Sign Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
