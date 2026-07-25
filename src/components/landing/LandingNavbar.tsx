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
      <nav className="relative w-full max-w-6xl rounded-2xl bg-brand-surface/70 backdrop-blur-md border border-[rgba(255,255,255,0.08)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:p-[1px] before:bg-gradient-to-r before:from-brand-primary/40 before:to-brand-secondary/40 before:content-[''] before:[mask-image:linear-gradient(black,black)_padding-box,linear-gradient(black,black)] before:[mask-composite:exclude]">
        <div className="px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
                <path d="M12 16v4" />
                <path d="M8 20h8" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className="font-poppins font-bold text-lg text-brand-text tracking-tight group-hover:text-white transition-colors">
              TrustFlow <span className="text-brand-text-muted font-semibold">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-brand-text-secondary hover:text-brand-text transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-brand-text hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signin?mode=signup"
              className="text-sm font-medium bg-brand-text text-brand-bg px-4 py-2 rounded-lg hover:bg-white transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-brand-text-secondary hover:text-brand-text"
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
              className="lg:hidden overflow-hidden border-t border-[rgba(255,255,255,0.08)] bg-brand-surface/95 rounded-b-2xl"
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-brand-text-secondary hover:text-brand-text"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="h-[1px] w-full bg-[rgba(255,255,255,0.08)] my-2" />
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-brand-text"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin?mode=signup"
                  className="text-sm font-medium bg-brand-text text-brand-bg px-4 py-2 rounded-lg text-center"
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
