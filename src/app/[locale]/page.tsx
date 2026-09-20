"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { 
  FileText, Wallet, FolderCheck, ScanSearch, AlertTriangle, 
  Scale, Shield, Lock, FileKey, History, Eye, CheckCircle2,
  Edit3, Activity, Sparkles
} from "lucide-react"

import { LandingNavbar } from "@/components/landing/LandingNavbar"
import { GlassCard } from "@/components/landing/GlassCard"
import { FeatureGrid } from "@/components/landing/FeatureGrid"
import { DashboardPreview } from "@/components/landing/DashboardPreview"
import { TrustBar } from "@/components/landing/TrustBar"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-inter selection:bg-brand-primary/20 overflow-x-hidden">
      <LandingNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden px-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-brand-primary/30 to-brand-secondary/10 blur-[120px] rounded-full -z-10 opacity-70" />
          
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <p className="text-brand-cyan font-semibold tracking-widest text-xs uppercase mb-6">
                AI-Powered Freelance Accountability
              </p>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-poppins font-bold text-white tracking-tight leading-[1.1] mb-8">
                Work with freelancers you trust.<br className="hidden md:block" /> Even when things go wrong.
              </h1>
              <p className="text-lg md:text-xl text-brand-text-secondary leading-relaxed max-w-3xl mx-auto mb-10">
                TrustFlow AI adds contracts, escrow, evidence-based progress verification, and dispute protection to the freelancer relationships you already have — without forcing you into a marketplace.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/auth/signin?mode=signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.02]">
                  Get Started Free
                </Link>
                <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-surface border border-[rgba(255,255,255,0.1)] text-white font-semibold hover:bg-[rgba(255,255,255,0.05)] transition-all">
                  See How It Works
                </Link>
              </div>
              
              <p className="text-sm text-brand-text-muted">
                No freelancer marketplace. No migration. Just a safer way to work together.
              </p>
            </motion.div>
          </div>
        </section>

        {/* HERO PRODUCT VISUAL */}
        <section className="px-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <DashboardPreview />
          </motion.div>
        </section>

        {/* TRUST BAR */}
        <TrustBar />

        {/* PROBLEM SECTION */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="problem">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
              Freelance work breaks down when trust isn&apos;t structured.
            </h2>
            <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
              You already know who you want to work with. The problem is everything that happens after the agreement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-8" glow="purple" hoverEffect>
              <Edit3 className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-white mb-3">&quot;We agreed on it in WhatsApp.&quot;</h3>
              <p className="text-brand-text-secondary leading-relaxed">Scope gets buried in conversations, leaving both sides with different definitions of &quot;done.&quot;</p>
            </GlassCard>
            <GlassCard className="p-8" glow="blue" hoverEffect>
              <Lock className="w-8 h-8 text-brand-secondary mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-white mb-3">&quot;Should I pay before seeing the work?&quot;</h3>
              <p className="text-brand-text-secondary leading-relaxed">Clients hesitate to pay upfront. Freelancers hesitate to start without payment certainty.</p>
            </GlassCard>
            <GlassCard className="p-8" glow="cyan" hoverEffect>
              <Activity className="w-8 h-8 text-brand-cyan mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-white mb-3">&quot;Is the project actually on track?&quot;</h3>
              <p className="text-brand-text-secondary leading-relaxed">There is often no structured evidence showing what has been completed against the agreed milestone.</p>
            </GlassCard>
            <GlassCard className="p-8" glow="purple" hoverEffect>
              <Scale className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-white mb-3">&quot;Who decides what was actually agreed?&quot;</h3>
              <p className="text-brand-text-secondary leading-relaxed">When work gets disputed, conversations become evidence — but there is rarely a structured process to evaluate them.</p>
            </GlassCard>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="py-24 px-6 bg-brand-surface/20 border-y border-[rgba(255,255,255,0.06)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
                From &quot;Trust me.&quot; to &quot;Here&apos;s the evidence.&quot;
              </h2>
              <p className="text-lg text-brand-text-secondary max-w-2xl mx-auto">
                TrustFlow creates a clear, auditable path from agreement to payment.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Before */}
              <GlassCard className="p-8 opacity-70 bg-transparent border-dashed">
                <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-6">Before TrustFlow</h3>
                <div className="space-y-4">
                  <div className="bg-brand-surface p-3 rounded-lg rounded-tl-none w-3/4"><p className="text-sm">Can you add this too?</p></div>
                  <div className="bg-brand-primary/20 p-3 rounded-lg rounded-tr-none w-3/4 ml-auto text-right"><p className="text-sm">Yeah, should be fine.</p></div>
                  <div className="bg-brand-surface p-3 rounded-lg rounded-tl-none w-3/4"><p className="text-sm">Did you finish the design?</p></div>
                  <div className="bg-brand-primary/20 p-3 rounded-lg rounded-tr-none w-3/4 ml-auto text-right"><p className="text-sm">Almost.</p></div>
                </div>
              </GlassCard>

              {/* After */}
              <GlassCard className="p-8" glow="blue">
                <h3 className="text-sm font-semibold text-brand-secondary uppercase tracking-wider mb-6">With TrustFlow</h3>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={16} className="text-brand-success" /> Contract Accepted
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={16} className="text-brand-success" /> Milestone 1 Funded
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={16} className="text-brand-success" /> Evidence Submitted
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 size={16} className="text-brand-success" /> ₹30,000 Released
                  </div>
                  <div className="mt-6 p-4 rounded-lg bg-brand-surface border border-brand-success/20">
                    <p className="text-xs text-brand-success font-bold mb-1">RISK: GREEN</p>
                    <p className="text-xs text-brand-text-secondary font-sans">Activity detected 1 day ago. Deadline in 5 days.</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="how-it-works">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
              One relationship. One clear workflow.
            </h2>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-[rgba(255,255,255,0.06)] -z-10" />
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
              {[
                { step: "01", title: "Define", desc: "Describe the project in plain language." },
                { step: "02", title: "Contract", desc: "AI turns your scope into clear milestones." },
                { step: "03", title: "Fund", desc: "Put milestone funds in escrow." },
                { step: "04", title: "Submit", desc: "Freelancer delivers evidence." },
                { step: "05", title: "Verify", desc: "AI compares the evidence with the deliverable." },
                { step: "06", title: "Approve & Pay", desc: "Client approves. Payment is released." }
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                  <div className="w-12 h-12 rounded-full bg-brand-surface border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-bold text-brand-primary mb-4 shrink-0 shadow-lg">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-poppins font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-brand-text-secondary leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE FEATURES */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
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

        {/* AI TRUST SECTION */}
        <section className="py-24 px-6 bg-brand-surface/30 border-y border-[rgba(255,255,255,0.06)] relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-cyan/10 blur-[120px] rounded-full -z-10" />
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
                AI that assists.<br/>Never AI that decides.
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <GlassCard className="p-8" glow="cyan">
                <h3 className="text-lg font-poppins font-semibold text-white mb-3">AI Contract Generator</h3>
                <p className="text-brand-text-secondary text-sm mb-4">Creates the first draft. The client can review and edit every term.</p>
              </GlassCard>
              <GlassCard className="p-8" glow="cyan">
                <h3 className="text-lg font-poppins font-semibold text-white mb-3">AI Scope Validation</h3>
                <p className="text-brand-text-secondary text-sm mb-4">Checks the evidence against the agreed deliverable. It provides a summary and confidence level.</p>
              </GlassCard>
              <GlassCard className="p-8" glow="cyan">
                <h3 className="text-lg font-poppins font-semibold text-white mb-3">AI Dispute Assistant</h3>
                <p className="text-brand-text-secondary text-sm mb-4">Analyzes both parties&apos; evidence. Produces a non-binding suggested resolution citing relevant clauses.</p>
              </GlassCard>
            </div>
            
            <div className="inline-flex items-center gap-3 bg-[rgba(103,232,249,0.1)] border border-[rgba(103,232,249,0.2)] rounded-lg px-4 py-3 text-sm text-brand-cyan">
              <Sparkles size={16} />
              <span>Every AI-generated result is clearly labeled: <strong className="font-semibold">AI-generated — review before relying on it.</strong></span>
            </div>
          </div>
        </section>

        {/* SECURITY & TRUST */}
        <section className="py-24 px-6 max-w-6xl mx-auto" id="security">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-6">
              Built for projects where money and accountability matter.
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
              <GlassCard key={i} className="p-6 flex items-start gap-4">
                <div className="text-brand-text-muted">{item.icon}</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-brand-text-secondary">{item.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <GlassCard glow="purple" className="p-12 text-center border-[rgba(255,255,255,0.15)] shadow-[0_0_50px_rgba(139,92,246,0.15)]">
            <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white mb-6 tracking-tight">
              Bring your next freelance project into focus.
            </h2>
            <p className="text-xl text-brand-text-secondary mb-10 max-w-2xl mx-auto">
              Clear scope. Protected milestones. Evidence when it matters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/auth/signin?mode=signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-[1.02]">
                Get Started Free
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.05)] text-white font-semibold transition-all">
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-brand-text-muted">
              Bring your existing freelancer. No marketplace migration required.
            </p>
          </GlassCard>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] bg-brand-bg pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-poppins font-bold text-xl text-white tracking-tight">
                TrustFlow <span className="text-brand-text-muted">AI</span>
              </span>
            </Link>
            <p className="text-brand-text-secondary max-w-sm">
              Freelance work, with accountability built in.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#how-it-works" className="text-sm text-brand-text-secondary hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="#features" className="text-sm text-brand-text-secondary hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#security" className="text-sm text-brand-text-secondary hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-brand-text-secondary hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-brand-text-secondary hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-text-muted">
            © 2026 TrustFlow AI
          </p>
          <p className="text-sm text-brand-text-muted font-medium">
            AI-assisted. Evidence-backed. Human-decided.
          </p>
        </div>
      </footer>
    </div>
  )
}
