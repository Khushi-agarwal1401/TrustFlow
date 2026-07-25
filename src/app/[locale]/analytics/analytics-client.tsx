"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"

export default function AnalyticsClient() {
  const [activeTab, setActiveTab] = useState("Overview")
  const tabs = ["Overview", "Financials", "Projects", "Freelancers", "Performance", "Risk Insights"]

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight mb-1 text-[var(--color-text-primary)]" style={{ fontFamily: "var(--font-poppins)" }}>
            Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Track your portfolio performance, financial health, and delivery insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            Apr 22 - May 22, 2025
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-500"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <button className="flex items-center gap-2 bg-white border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] shadow-sm hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            Filters
          </button>
          <button className="flex items-center gap-2 bg-white border border-[var(--color-border-default)] rounded-lg px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] shadow-sm hover:bg-gray-50 transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[var(--color-border-subtle)] mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[var(--color-accent-primary)] rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-6 animate-fade-up stagger-1">
        
        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-secondary)]">Total Spend</div>
              <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5 tabular-nums">₹18,75,000</div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-[var(--color-success)] flex items-center gap-1">
            ↑ 24% <span className="font-normal text-[var(--color-text-secondary)]">vs Apr 22 - Apr 21</span>
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-success-subtle)] text-[var(--color-success)] flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-secondary)]">Escrow Protected</div>
              <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5 tabular-nums">₹12,40,000</div>
            </div>
          </div>
          <div className="text-[10px] text-[var(--color-text-secondary)]">
            66% of total spend
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-info-subtle)] text-[var(--color-info)] flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-secondary)]">Active Projects</div>
              <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5 tabular-nums">8</div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-[var(--color-success)] flex items-center gap-1">
            ↑ 2 <span className="font-normal text-[var(--color-text-secondary)]">from last 30 days</span>
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-success-subtle)] text-[var(--color-success)] flex items-center justify-center shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--color-text-secondary)]">Completed Projects</div>
              <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5 tabular-nums">12</div>
            </div>
          </div>
          <div className="text-[10px] font-bold text-[var(--color-success)] flex items-center gap-1">
            ↑ 3 <span className="font-normal text-[var(--color-text-secondary)]">from last 30 days</span>
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)] relative overflow-hidden">
          <div className="text-[11px] font-bold text-[var(--color-text-secondary)] mb-4">Completion Rate</div>
          <div className="flex items-center justify-between">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-accent-primary)" strokeWidth="4" strokeDasharray="85 100"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--color-accent-primary)]">85%</div>
            </div>
            <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] tabular-nums">85%</div>
          </div>
          <div className="text-[10px] font-bold text-[var(--color-success)] flex items-center gap-1 mt-3">
            ↑ 8% <span className="font-normal text-[var(--color-text-secondary)]">from last 30 days</span>
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)] relative overflow-hidden">
          <div className="text-[11px] font-bold text-[var(--color-text-secondary)] mb-4">On-time Delivery</div>
          <div className="flex items-center justify-between">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-bg-elevated)" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-info)" strokeWidth="4" strokeDasharray="78 100"></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--color-info)]">78%</div>
            </div>
            <div className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] tabular-nums">78%</div>
          </div>
          <div className="text-[10px] font-bold text-[var(--color-danger)] flex items-center gap-1 mt-3">
            ↓ 4% <span className="font-normal text-[var(--color-text-secondary)]">from last 30 days</span>
          </div>
        </Card>

        <Card variant="default" className="col-span-1 p-5 shadow-sm border-[var(--color-border-subtle)]">
          <div className="text-[11px] font-bold text-[var(--color-text-secondary)] mb-4">Dispute Rate</div>
          <div className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] mt-0.5 tabular-nums mb-3">4.2%</div>
          <div className="text-[10px] font-bold text-[var(--color-danger)] flex items-center gap-1">
            ↓ 1.3% <span className="font-normal text-[var(--color-text-secondary)]">from last 30 days</span>
          </div>
        </Card>

      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-fade-up stagger-2">
        
        {/* Spend Over Time Chart */}
        <Card variant="default" className="col-span-1 lg:col-span-1 p-6 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--color-text-primary)]">Spend Over Time</h3>
            <select className="text-xs bg-white border border-[var(--color-border-default)] rounded-md px-2 py-1 font-semibold text-[var(--color-text-primary)] outline-none">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-primary)]"></div>
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Total Spend (₹)</span>
          </div>

          <div className="relative h-[200px] w-full">
            {/* Chart Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[2.5, 2, 1.5, 1, 0.5, 0].map(val => (
                <div key={val} className="flex items-center w-full">
                  <span className="text-[9px] text-[var(--color-text-muted)] w-8">{val === 0 ? '₹0' : `₹${val}L`}</span>
                  <div className="flex-1 h-px bg-[var(--color-border-subtle)]"></div>
                </div>
              ))}
            </div>
            {/* SVG Line Chart Representation */}
            <div className="absolute inset-0 ml-8 pb-4">
               <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="spend-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Fill */}
                  <path d="M0 160 L40 160 L80 140 L120 140 L160 120 L200 120 L240 100 L280 100 L320 80 L360 80 L400 60 L400 200 L0 200 Z" fill="url(#spend-gradient)" />
                  {/* Line */}
                  <path d="M0 160 L40 160 L80 140 L120 140 L160 120 L200 120 L240 100 L280 100 L320 80 L360 80 L400 60" fill="none" stroke="var(--color-accent-primary)" strokeWidth="3" />
                  
                  {/* Points */}
                  <circle cx="0" cy="160" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="40" cy="160" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="80" cy="140" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="120" cy="140" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="160" cy="120" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="200" cy="120" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="240" cy="100" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="280" cy="100" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="320" cy="80" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="360" cy="80" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
                  <circle cx="400" cy="60" r="4" fill="white" stroke="var(--color-accent-primary)" strokeWidth="2"/>
               </svg>
            </div>
            {/* X Axis Labels */}
            <div className="absolute bottom-[-20px] left-8 right-0 flex justify-between text-[9px] text-[var(--color-text-muted)] font-medium">
              <span>Apr 22</span>
              <span>Apr 27</span>
              <span>May 2</span>
              <span>May 7</span>
              <span>May 12</span>
              <span>May 17</span>
              <span>May 22</span>
            </div>
          </div>
        </Card>

        {/* Project Health Donut */}
        <Card variant="default" className="col-span-1 lg:col-span-1 p-6 shadow-sm border-[var(--color-border-subtle)] flex flex-col justify-between">
          <h3 className="font-bold text-[var(--color-text-primary)] mb-6">Project Health</h3>
          
          <div className="flex items-center gap-8 px-4">
            <div className="relative w-[140px] h-[140px] shrink-0 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-success)" strokeWidth="6" strokeDasharray="50 100"></circle>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-info)" strokeWidth="6" strokeDasharray="25 100" strokeDashoffset="-50"></circle>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-warning)" strokeWidth="6" strokeDasharray="12.5 100" strokeDashoffset="-75"></circle>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-danger)" strokeWidth="6" strokeDasharray="12.5 100" strokeDashoffset="-87.5"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold text-[var(--color-text-primary)] leading-none mb-1">8</span>
                <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">Active Projects</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-success)]"></div><span className="font-bold text-[var(--color-text-primary)]">On Track</span></div>
                <span className="text-[var(--color-text-secondary)]">4 (50%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-info)]"></div><span className="font-bold text-[var(--color-text-primary)]">At Risk</span></div>
                <span className="text-[var(--color-text-secondary)]">2 (25%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-warning)]"></div><span className="font-bold text-[var(--color-text-primary)]">Delayed</span></div>
                <span className="text-[var(--color-text-secondary)]">1 (12.5%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--color-danger)]"></div><span className="font-bold text-[var(--color-text-primary)]">Blocked</span></div>
                <span className="text-[var(--color-text-secondary)]">1 (12.5%)</span>
              </div>
            </div>
          </div>
          
          <button className="text-xs font-bold text-[var(--color-accent-primary)] mt-6 flex items-center gap-1 hover:underline">
            View all projects &rarr;
          </button>
        </Card>

        {/* AI Risk Insights */}
        <Card variant="default" className="col-span-1 lg:col-span-1 p-6 shadow-sm border-[var(--color-border-subtle)] flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="font-bold text-[var(--color-text-primary)]">AI Risk Insights</h3>
            <span className="bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] text-[9px] font-bold px-2 py-0.5 rounded-full">Beta</span>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {/* Warning Item */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-warning-subtle)] bg-[var(--color-warning-subtle)]/50">
              <div className="text-[var(--color-warning)] shrink-0 mt-0.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[11px] font-bold text-[var(--color-text-primary)]">1 project is at high risk</h4>
                  <button className="text-[10px] font-bold text-[var(--color-accent-primary)] hover:underline flex items-center gap-0.5">View &rarr;</button>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">Mobile App Development</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Payment delay and milestone overdue by 5 days.</p>
              </div>
            </div>

            {/* Caution Item */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-orange-100 bg-orange-50/50">
              <div className="text-orange-500 shrink-0 mt-0.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[11px] font-bold text-[var(--color-text-primary)]">2 projects might be delayed</h4>
                  <button className="text-[10px] font-bold text-[var(--color-accent-primary)] hover:underline flex items-center gap-0.5">View &rarr;</button>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">Milestones due in next 7 days with low activity.</p>
              </div>
            </div>

            {/* Success Item */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-[var(--color-success-subtle)] bg-[var(--color-success-subtle)]/50">
              <div className="text-[var(--color-success)] shrink-0 mt-0.5">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[11px] font-bold text-[var(--color-text-primary)]">Great! 4 projects are on track</h4>
                  <button className="text-[10px] font-bold text-[var(--color-accent-primary)] hover:underline flex items-center gap-0.5">View &rarr;</button>
                </div>
                <p className="text-[10px] text-[var(--color-text-secondary)]">Everything is running smoothly.</p>
              </div>
            </div>
          </div>
          
          <button className="text-xs font-bold text-[var(--color-accent-primary)] mt-4 flex items-center gap-1 hover:underline">
            View full risk report &rarr;
          </button>
        </Card>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 animate-fade-up stagger-3">
        
        {/* Milestone Performance */}
        <Card variant="default" className="p-6 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[var(--color-text-primary)]">Milestone Performance</h3>
            <select className="text-xs bg-white border border-[var(--color-border-default)] rounded-md px-2 py-1 font-semibold text-[var(--color-text-primary)] outline-none">
              <option>This Period</option>
            </select>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-[20px] font-bold text-[var(--color-text-primary)]">24</div>
              <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Total Milestones</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-[var(--color-text-primary)]">18</div>
              <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Completed</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-[var(--color-text-primary)]">4</div>
              <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">In Progress</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-[var(--color-danger)]">2</div>
              <div className="text-[10px] text-[var(--color-text-secondary)] font-medium">Overdue</div>
            </div>
          </div>

          <div className="flex w-full h-2 rounded-full overflow-hidden mb-6">
            <div className="bg-[var(--color-info)] h-full" style={{ width: '75%' }}></div>
            <div className="bg-gray-200 h-full" style={{ width: '15%' }}></div>
            <div className="bg-[var(--color-danger)] h-full" style={{ width: '10%' }}></div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">On-time Rate</div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[var(--color-text-primary)]">75%</span>
                <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 10%</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Overdue Milestones</div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-bold text-[var(--color-text-primary)]">2</span>
                <span className="text-[10px] font-bold text-[var(--color-danger)] flex items-center">↓ 3</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Freelancer Performance */}
        <Card variant="default" className="p-6 shadow-sm border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[var(--color-text-primary)]">Freelancer Performance</h3>
            <button className="text-xs font-bold text-[var(--color-accent-primary)] hover:underline">View all</button>
          </div>

          <div className="grid grid-cols-12 text-[10px] font-semibold text-[var(--color-text-secondary)] mb-3 px-1 border-b border-[var(--color-border-subtle)] pb-2">
            <div className="col-span-5">Freelancer</div>
            <div className="col-span-2 text-center">Projects</div>
            <div className="col-span-3">On-time Delivery</div>
            <div className="col-span-2 text-right">Rating</div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {[
              { name: "Aman Verma", projects: 4, rate: 88, rating: 4.9, color: "var(--color-success)" },
              { name: "Neha Sharma", projects: 3, rate: 75, rating: 4.7, color: "var(--color-success)" },
              { name: "Rohit Singh", projects: 2, rate: 70, rating: 4.5, color: "var(--color-warning)" },
              { name: "Pooja Patel", projects: 1, rate: 100, rating: 5.0, color: "var(--color-success)" },
              { name: "Vikram Joshi", projects: 2, rate: 60, rating: 4.2, color: "orange" },
            ].map((fl) => (
              <div key={fl.name} className="grid grid-cols-12 items-center px-1">
                <div className="col-span-5 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-bg-elevated)] shrink-0 overflow-hidden text-xs flex items-center justify-center font-bold text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">{fl.name.charAt(0)}</div>
                  <span className="text-[11px] font-semibold text-[var(--color-text-primary)] truncate">{fl.name}</span>
                </div>
                <div className="col-span-2 text-center text-[11px] font-bold text-[var(--color-text-primary)]">{fl.projects}</div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--color-text-secondary)] w-6">{fl.rate}%</span>
                  <div className="flex-1 h-1 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${fl.rate}%`, backgroundColor: fl.color }}></div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1 text-[11px] font-bold text-[var(--color-text-primary)]">
                  {fl.rating} <svg width="10" height="10" fill="var(--color-warning)" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Payment Activity */}
        <Card variant="default" className="p-6 shadow-sm border-[var(--color-border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[var(--color-text-primary)]">Recent Payment Activity</h3>
              <button className="text-xs font-bold text-[var(--color-accent-primary)] hover:underline">View all</button>
            </div>

            <div className="flex flex-col gap-5">
              {[
                { title: "Milestone Payment Released", desc: "Mobile App Development", amt: "₹75,000", date: "May 21, 2025", type: "Released", icon: <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>, color: "var(--color-success)", bg: "var(--color-success-subtle)" },
                { title: "Milestone Payment Released", desc: "Website Redesign", amt: "₹50,000", date: "May 19, 2025", type: "Released", icon: <path d="M5 10l7-7m0 0l7 7m-7-7v18"/>, color: "var(--color-success)", bg: "var(--color-success-subtle)" },
                { title: "Escrow Funded", desc: "E-commerce Platform", amt: "₹1,20,000", date: "May 18, 2025", type: "Funded", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, color: "var(--color-accent-primary)", bg: "var(--color-accent-subtle)" },
                { title: "Refund Processed", desc: "Logo & Branding", amt: "₹25,000", date: "May 16, 2025", type: "Refunded", icon: <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>, color: "var(--color-danger)", bg: "var(--color-danger-subtle)" },
              ].map((p, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: p.bg, color: p.color }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">{p.icon}</svg>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-tight">{p.title}</div>
                      <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{p.desc}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-tight">{p.amt}</div>
                    <div className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">{p.date}</div>
                  </div>
                  <div className="hidden sm:block">
                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: p.bg, color: p.color }}>{p.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="text-xs font-bold text-[var(--color-accent-primary)] mt-5 flex items-center gap-1 hover:underline">
            View all payments &rarr;
          </button>
        </Card>
      </div>

      {/* Portfolio Summary Bottom Bar */}
      <Card variant="default" className="p-6 shadow-sm border-[var(--color-border-subtle)] animate-fade-up stagger-4">
        <h3 className="font-bold text-[var(--color-text-primary)] mb-5">Portfolio Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Average Project Value</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">₹2,34,375</span>
              <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 18%</span>
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Total Freelancers</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">7</span>
              <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 1</span>
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Repeat Freelancer Rate</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">71%</span>
              <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 12%</span>
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Avg. Milestone Value</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">₹78,125</span>
              <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 15%</span>
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Disputed Amount</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">₹52,500</span>
              <span className="text-[10px] font-bold text-[var(--color-danger)] flex items-center">↓ 28%</span>
            </div>
          </div>
          
          <div>
            <div className="text-[11px] font-medium text-[var(--color-text-secondary)] mb-1">Resolution Rate</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">92%</span>
              <span className="text-[10px] font-bold text-[var(--color-success)] flex items-center">↑ 5%</span>
            </div>
          </div>

        </div>
      </Card>
      
    </div>
  )
}
