"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "For Clients", href: "#clients" },
    { name: "For Freelancers", href: "#freelancers" },
    { name: "Security", href: "#security" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 sm:px-6 md:pt-6">
      <nav className="relative w-full max-w-6xl rounded-2xl bg-bg-surface/80 backdrop-blur-md border border-border-subtle shadow-card">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M12 16v4" />
                <path d="M8 20h8" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-text-primary tracking-tight transition-colors">
              TrustFlow <span className="text-accent-primary font-semibold">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-text-primary hover:text-accent-primary transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signin?mode=signup"
              className="text-sm font-medium bg-accent-primary text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-text-secondary hover:text-text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border-subtle bg-bg-surface/95 rounded-b-2xl"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-text-secondary hover:text-text-primary"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-[1px] w-full bg-border-subtle my-2" />
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin?mode=signup"
                  className="text-sm font-medium bg-accent-primary text-white px-4 py-2 rounded-lg text-center active:scale-[0.97]"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
