"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import {
  Shield,
  Bot,
  Wallet,
  FileCheck,
  Scale,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Sparkles,
  ChevronRight,
  Quote,
} from "lucide-react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

export default function LandingPage() {
  const reduceMotion = useReducedMotion()

  const animProps = reduceMotion
    ? { initial: undefined, whileInView: undefined, viewport: undefined, variants: undefined }
    : {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: 0.2 },
        variants: stagger,
      }

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] overflow-hidden">
      {/* ── Navigation ── */}
      <motion.header
        initial={reduceMotion ? undefined : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]/80 backdrop-blur-2xl"
      >
        <nav className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--color-text-primary)] tracking-tight">TrustFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Testimonials</a>
            <a href="#cta" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Get Started</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/signin" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors font-medium">
              Sign In
            </Link>
            <Link href="/auth/signin">
              <Button size="sm" className="shadow-sm">
                Get Started
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-[var(--color-accent-primary)]/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--color-accent-primary)]/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1000px] mx-auto text-center relative">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="primary" size="lg" className="mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Freelance Accountability
            </Badge>
          </motion.div>

          <motion.h1
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-[var(--color-text-primary)] max-w-[900px] mx-auto"
          >
            Trust, verified by AI.
            <br />
            Payments, secured by
            <span className="text-[var(--color-accent-primary)]"> escrow</span>.
          </motion.h1>

          <motion.p
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-[650px] mx-auto leading-relaxed"
          >
            The first freelancing platform where AI validates deliverables, escrow holds payments, and disputes are resolved in minutes — not months.
          </motion.p>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/signin">
              <Button size="xl" className="shadow-lg hover:shadow-[0_4px_16px_rgba(79,70,229,0.3)] text-base">
                Start Building Trust
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="xl" className="text-base">
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-[var(--color-text-muted)]"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              No setup fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              AI-powered escrow
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
              Dispute resolution
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 md:py-32 px-6 bg-[var(--color-bg-surface)]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div {...animProps} className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <Badge variant="primary">Platform Features</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need to work with confidence
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-lg text-[var(--color-text-secondary)] max-w-[600px] mx-auto">
              AI-powered accountability from project start to final payment.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Bot,
                title: "AI Validation",
                description: "Every milestone submission is automatically reviewed by AI against your contract terms before payment is released.",
                iconColor: "#4F46E5",
              iconBg: "bg-[var(--color-accent-subtle)]",
            },
            {
              icon: Wallet,
              title: "Escrow Payments",
              description: "Funds are held securely in escrow and released automatically when milestones pass AI validation.",
              iconColor: "#10B981",
              iconBg: "bg-[var(--color-success-subtle)]",
            },
            {
              icon: Scale,
              title: "AI Dispute Resolution",
              description: "Disputes are analyzed by AI against your contract terms, delivering fair resolutions in minutes, not weeks.",
              iconColor: "#F59E0B",
              iconBg: "bg-[var(--color-warning-subtle)]",
            },
            {
              icon: FileCheck,
              title: "Smart Contracts",
              description: "AI generates comprehensive contracts with milestone-based payment schedules tailored to your project.",
              iconColor: "#0EA5E9",
              iconBg: "bg-[var(--color-info-subtle)]",
            },
            {
              icon: Shield,
              title: "Risk Monitoring",
              description: "Real-time risk signals analyze project health and alert you to potential issues before they escalate.",
              iconColor: "#4F46E5",
              iconBg: "bg-[var(--color-accent-subtle)]",
            },
            {
              icon: TrendingUp,
              title: "Analytics & Insights",
              description: "Track completion rates, revenue trends, freelancer performance, and risk metrics in real time.",
              iconColor: "#10B981",
              iconBg: "bg-[var(--color-success-subtle)]",
            },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}>
                    <Icon className="w-5 h-5" style={{ color: feature.iconColor }} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">{feature.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 md:py-32 px-6">
        <div className="max-w-[800px] mx-auto">
          <motion.div {...animProps} className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <Badge variant="primary">How It Works</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              From brief to payment, fully protected
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 text-lg text-[var(--color-text-secondary)] max-w-[550px] mx-auto">
              Four simple steps to a risk-free freelance collaboration.
            </motion.p>
          </motion.div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Create a Project",
                description: "Describe your project and budget. Our AI generates a smart contract with milestone-based payments tailored to your needs.",
                icon: Layers,
              },
              {
                step: "02",
                title: "Fund Escrow",
                description: "Deposit funds into escrow. Your money is held securely and only released when milestones pass AI validation.",
                icon: Wallet,
              },
              {
                step: "03",
                title: "Work & Submit",
                description: "Freelancers submit work through milestones. AI automatically validates each deliverable against your contract terms.",
                icon: FileCheck,
              },
              {
                step: "04",
                title: "Release Payment",
                description: "Approved milestones trigger automatic payment release. Disputes? Our AI resolves them in minutes, not months.",
                icon: CheckCircle2,
              },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex gap-6 md:gap-10 group"
                >
                  {/* Number + Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-hover)] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                      {item.step}
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-gradient-to-b from-[var(--color-accent-primary)]/30 to-transparent mt-2" />}
                  </div>
                  {/* Content */}
                  <div className="pb-12 last:pb-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-[var(--color-accent-primary)]" strokeWidth={1.5} />
                      <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                    </div>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-base">{item.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 md:py-32 px-6 bg-[var(--color-bg-surface)]">
        <div className="max-w-[1100px] mx-auto">
          <motion.div {...animProps} className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <Badge variant="primary">Testimonials</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              Trusted by freelancers and clients worldwide
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "The AI validation caught scope creep I would have missed. It's like having a project manager, lawyer, and accountant built into one platform.",
                name: "Sarah Chen",
                role: "Freelance Product Designer",
                rating: 5,
              },
              {
                quote: "We've reduced our dispute resolution time from 3 months to 3 days. The AI recommendation engine is scarily accurate — it's resolved 90% of disputes without human intervention.",
                name: "Marcus Johnson",
                role: "CTO, Nexus Digital Agency",
                rating: 5,
              },
              {
                quote: "As a freelancer, escrow gave me peace of mind. I stopped chasing payments and started focusing on the work. The AI validation actually helps me improve my deliverables.",
                name: "Elena Rodriguez",
                role: "Full-Stack Developer",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] hover:shadow-card-hover transition-all duration-300 flex flex-col"
              >
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-[var(--color-accent-primary)]/20" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
                  <Avatar name={testimonial.name} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{testimonial.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, s) => (
                      <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--color-warning)" stroke="var(--color-warning)" strokeWidth="1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="py-24 md:py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent-primary)]/5 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-[700px] mx-auto text-center relative">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="primary" size="lg" className="mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Get Started Free
            </Badge>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
              Ready to build trust in every project?
            </h2>
            <p className="mt-4 text-lg text-[var(--color-text-secondary)] max-w-[500px] mx-auto leading-relaxed">
              Join thousands of freelancers and clients who have already eliminated payment disputes and delivery uncertainty with AI-powered accountability.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signin">
                <Button size="xl" className="shadow-lg text-base">
                  Start Free Trial
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="ghost" size="xl" className="text-base">
                  Learn More
                </Button>
              </a>
            </div>
            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
              No credit card required · Free for solo freelancers · Team plans from $29/mo
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border-subtle)] py-12 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[var(--color-accent-primary)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-semibold text-sm">TrustFlow</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[220px]">
                AI-powered accountability for modern freelance teams.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Product</h4>
              <div className="space-y-2.5">
                <a href="#features" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Features</a>
                <a href="#cta" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Get Started</a>
                <a href="#how-it-works" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">How it Works</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Company</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">About</a>
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Blog</a>
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Careers</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">Legal</h4>
              <div className="space-y-2.5">
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Terms</a>
                <a href="#" className="block text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Security</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--color-border-subtle)]">
            <p className="text-xs text-[var(--color-text-muted)]">&copy; {new Date().getFullYear()} TrustFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
