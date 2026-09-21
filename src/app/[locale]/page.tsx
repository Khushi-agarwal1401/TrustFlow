"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  FileText, Wallet, FolderCheck, ScanSearch, AlertTriangle, 
  Scale, Shield, Lock, FileKey, History, Eye, CheckCircle2,
  Edit3, Activity, ArrowRight
} from "lucide-react"

import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { GlassCard } from "@/components/landing/GlassCard"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { TrustBar } from "@/components/landing/TrustBar"

const emilEase = [0.23, 1, 0.32, 1] as [number, number, number, number]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: emilEase } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-accent-subtle overflow-x-hidden">
      <LandingNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden" 
              animate="visible" 
              variants={staggerContainer}
              className="max-w-2xl"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface border border-border-default mb-8 shadow-sm">
                <Shield size={14} className="text-accent-primary" />
                <span className="text-text-secondary font-medium text-xs tracking-wide uppercase">
                  AI-Powered Freelance Accountability
                </span>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-semibold text-text-primary tracking-tight leading-[1.1] mb-6">
                Work with freelancers you trust.
                <br className="hidden md:block" />
                <span className="text-text-secondary">Even when things go wrong.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-text-secondary leading-relaxed mb-10 max-w-xl">
                TrustFlow adds contracts, escrow, evidence-based progress verification, and dispute protection to the freelancer relationships you already have. No marketplace lock-in.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link 
                  href="/auth/signin?mode=signup" 
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white font-semibold shadow-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  href="#how-it-works" 
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-bg-surface border border-border-default text-text-primary font-medium hover:bg-bg-hover transition-all active:scale-[0.97] flex items-center justify-center"
                >
                  See How It Works
                </Link>
              </motion.div>
              
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: emilEase, delay: 0.2 }}
              className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-border-subtle bg-bg-surface shadow-card"
            >
              <Image 
                src="/images/hero_abstract_light.jpg" 
                alt="Abstract representation of secure escrow flow" 
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent opacity-50" />
            </motion.div>

          </div>
        </section>

        {/* TRUST BAR */}
        <div className="border-y border-border-subtle bg-bg-surface">
          <TrustBar />
        </div>

        {/* PROBLEM SECTION */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="problem">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
              Freelance work breaks down when trust isn&apos;t structured.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-text-secondary max-w-2xl">
              You already know who you want to work with. The problem is everything that happens after the agreement.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {[
              { icon: <Edit3 />, title: "\"We agreed on it in WhatsApp.\"", desc: "Scope gets buried in conversations, leaving both sides with different definitions of \"done.\"" },
              { icon: <Lock />, title: "\"Should I pay before seeing the work?\"", desc: "Clients hesitate to pay upfront. Freelancers hesitate to start without payment certainty." },
              { icon: <Activity />, title: "\"Is the project actually on track?\"", desc: "There is often no structured evidence showing what has been completed against the agreed milestone." },
              { icon: <Scale />, title: "\"Who decides what was actually agreed?\"", desc: "When work gets disputed, conversations become evidence — but there is rarely a structured process to evaluate them." }
            ].map((item, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <GlassCard className="p-8 h-full" hoverEffect>
                  <div className="w-10 h-10 rounded-full bg-bg-surface border border-border-default flex items-center justify-center text-accent-primary mb-6 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-medium text-text-primary mb-3">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{item.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="py-24 px-6 bg-bg-elevated border-y border-border-subtle">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
                From &quot;Trust me&quot; to &quot;Here&apos;s the evidence&quot;.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-text-secondary max-w-2xl mx-auto">
                TrustFlow creates a clear, auditable path from agreement to payment.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Before */}
              <GlassCard className="p-8 opacity-70 bg-transparent border-dashed">
                <h3 className="text-sm font-medium text-text-muted uppercase tracking-widest mb-8">Before TrustFlow</h3>
                <div className="space-y-4">
                  <div className="bg-bg-surface p-4 rounded-xl rounded-tl-none w-[80%] border border-border-default shadow-sm"><p className="text-sm text-text-primary">Can you add this too?</p></div>
                  <div className="bg-accent-subtle p-4 rounded-xl rounded-tr-none w-[80%] ml-auto text-right"><p className="text-sm text-accent-primary font-medium">Yeah, should be fine.</p></div>
                  <div className="bg-bg-surface p-4 rounded-xl rounded-tl-none w-[80%] border border-border-default shadow-sm"><p className="text-sm text-text-primary">Did you finish the design?</p></div>
                  <div className="bg-accent-subtle p-4 rounded-xl rounded-tr-none w-[80%] ml-auto text-right"><p className="text-sm text-accent-primary font-medium">Almost.</p></div>
                </div>
              </GlassCard>

              {/* After */}
              <GlassCard className="p-8 border-accent-ring shadow-card-hover">
                <h3 className="text-sm font-medium text-accent-primary uppercase tracking-widest mb-8">With TrustFlow</h3>
                <div className="space-y-5 text-sm">
                  <div className="flex items-center gap-4 text-text-primary font-medium">
                    <CheckCircle2 size={18} className="text-success" /> Contract Accepted
                  </div>
                  <div className="flex items-center gap-4 text-text-primary font-medium">
                    <CheckCircle2 size={18} className="text-success" /> Milestone 1 Funded
                  </div>
                  <div className="flex items-center gap-4 text-text-primary font-medium">
                    <CheckCircle2 size={18} className="text-success" /> Evidence Submitted
                  </div>
                  <div className="flex items-center gap-4 text-text-primary font-medium">
                    <CheckCircle2 size={18} className="text-success" /> ₹30,000 Released
                  </div>
                  <div className="mt-8 p-5 rounded-xl bg-bg-base border border-border-default shadow-inner">
                    <p className="text-xs text-success font-semibold tracking-wider mb-2">RISK: GREEN</p>
                    <p className="text-sm text-text-secondary">Activity detected 1 day ago. Deadline in 5 days.</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="how-it-works">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
              One relationship. One clear workflow.
            </h2>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-px bg-border-default -z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
              {[
                { step: "01", title: "Define", desc: "Describe the project in plain language." },
                { step: "02", title: "Contract", desc: "AI turns your scope into clear milestones." },
                { step: "03", title: "Fund", desc: "Put milestone funds in escrow." },
                { step: "04", title: "Submit", desc: "Freelancer delivers evidence." },
                { step: "05", title: "Verify", desc: "AI compares evidence with the deliverable." },
                { step: "06", title: "Approve & Pay", desc: "Client approves. Payment is released." }
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="w-12 h-12 rounded-full bg-bg-surface border border-border-default flex items-center justify-center font-semibold text-text-primary mb-6 shadow-sm">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">{s.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section className="py-24 px-6 max-w-6xl mx-auto bg-bg-subtle rounded-3xl border border-border-subtle" id="features">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary mb-4 tracking-tight">
              Everything you need to keep freelance work accountable.
            </h2>
          </div>
          
          <FeatureGrid features={[
            {
              title: "AI Contract Generation",
              description: "Turn plain-language project requirements into structured milestones and deliverables.",
              icon: <FileText />
            },
            {
              title: "Milestone Escrow",
              description: "Hold funds until the agreed milestone is approved.",
              icon: <Wallet />
            },
            {
              title: "Evidence-Based Submission",
              description: "Attach files, GitHub commits, Figma files, Drive folders, or deployed URLs.",
              icon: <FolderCheck />
            },
            {
              title: "AI Scope Validation",
              description: "Compare submitted evidence against the agreed milestone.",
              icon: <ScanSearch />
            },
            {
              title: "Risk Signals",
              description: "See Green, Amber, or Red risk indicators with the actual reason behind the signal.",
              icon: <AlertTriangle />
            },
            {
              title: "Dispute Resolution",
              description: "Both parties submit evidence. AI provides a non-binding suggested resolution citing the contract.",
              icon: <Scale />
            }
          ]} />
        </section>

        {/* SECURITY & TRUST */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="security">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
              Built for projects where accountability matters.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Secure Payments", desc: "Payment processing handled through payment providers.", icon: <Wallet /> },
              { title: "Access Control", desc: "Role-based permissions enforced server-side.", icon: <Lock /> },
              { title: "Private Evidence", desc: "Files use controlled access and signed URLs.", icon: <FileKey /> },
              { title: "Audit Trail", desc: "Important project actions are recorded as immutable events.", icon: <History /> },
              { title: "AI Transparency", desc: "AI outputs are labeled and retained for auditability.", icon: <Eye /> },
              { title: "Data Protection", desc: "Use secure encrypted transport and managed storage infrastructure.", icon: <Shield /> }
            ].map((item, i) => (
              <GlassCard key={i} className="p-8 flex flex-col gap-4">
                <div className="text-text-muted">{item.icon}</div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">{item.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 px-6 max-w-5xl mx-auto">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-semibold text-text-primary mb-6 tracking-tight">
              Bring your next freelance project into focus.
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Clear scope. Protected milestones. Evidence when it matters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link 
                href="/auth/signin?mode=signup" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white font-semibold transition-all shadow-card active:scale-[0.97]"
              >
                Get Started Free
              </Link>
            </div>
            <p className="text-sm text-text-muted">
              Bring your existing freelancer. No marketplace migration required.
            </p>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-border-subtle bg-bg-surface pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-semibold text-xl text-text-primary tracking-tight">
                TrustFlow
              </span>
            </Link>
            <p className="text-text-secondary max-w-sm">
              Freelance work, with accountability built in.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#how-it-works" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">How It Works</Link></li>
              <li><Link href="#features" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Features</Link></li>
              <li><Link href="#security" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text-primary mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary hover:text-accent-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © 2026 TrustFlow
          </p>
          <p className="text-sm text-text-muted font-medium">
            AI-assisted. Evidence-backed. Human-decided.
          </p>
        </div>
      </footer>
    </div>
  )
}
