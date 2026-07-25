"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<{
    name: string; email: string; avatarUrl: string | null; roles: string[];
    profile: { title: string | null; bio: string | null; skills: string[]; hourlyRate: number | null; portfolio: unknown; availability: string | null } | null;
    stats: { completedProjects: number; avgRating: number | null; totalReviews: number };
    recentReviews: { id: string; score: number; comment: string | null; rater: { name: string } }[];
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/users/${id}`).then((r) => r.json()).then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="grid grid-cols-3 gap-6">
        <div className="card-double"><div className="card-inner space-y-3"><div className="skeleton w-20 h-20 rounded-full mx-auto" /><div className="skeleton h-5 w-24 mx-auto" /><div className="skeleton h-3 w-16 mx-auto" /></div></div>
        <div className="col-span-2 space-y-4"><div className="card-double"><div className="card-inner space-y-2"><div className="skeleton h-4 w-16" /><div className="skeleton h-3 w-full" /></div></div></div>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="card-double"><div className="card-inner text-center py-12"><p className="text-text-muted">User not found</p></div></div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Link href="/marketplace" className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Marketplace</Link>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner text-center">
            <div className="w-20 h-20 rounded-full bg-accent-primary mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>{profile.name}</h1>
            <p className="text-text-secondary text-sm mt-1">{profile.profile?.title || "No title"}</p>
            {profile.profile?.hourlyRate && (
              <p className="text-accent-primary font-semibold mt-2">${(profile.profile.hourlyRate / 100).toFixed(2)}/hr</p>
            )}
            {profile.profile?.availability && (
              <span className="badge bg-success/10 text-success mt-3">{profile.profile.availability}</span>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {profile.profile?.bio && (
            <div className="card-double animate-fade-up stagger-2">
              <div className="card-inner">
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-poppins)" }}>About</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{profile.profile.bio}</p>
              </div>
            </div>
          )}

          {profile.profile?.skills && profile.profile.skills.length > 0 && (
            <div className="card-double animate-fade-up stagger-2">
              <div className="card-inner">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.profile.skills.map((s) => (
                    <span key={s} className="badge bg-accent-subtle text-accent-primary">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card-double animate-fade-up stagger-3">
            <div className="card-inner">
              <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Completed", value: profile.stats.completedProjects, color: "text-accent-primary" },
                  { label: "Rating", value: profile.stats.avgRating?.toFixed(1) || "—", color: "text-warning" },
                  { label: "Reviews", value: profile.stats.totalReviews, color: "text-text-primary" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-bold ${s.color} tabular-nums`} style={{ fontFamily: "var(--font-poppins)" }}>{s.value}</p>
                    <p className="text-xs text-text-muted mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {profile.recentReviews.length > 0 && (
            <div className="card-double animate-fade-up stagger-4">
              <div className="card-inner">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Recent Reviews</h3>
                <div className="space-y-2">
                  {profile.recentReviews.map((r) => (
                    <div key={r.id} className="card-elevated rounded-xl p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{r.rater.name}</span>
                        <span className="text-warning text-xs">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                      </div>
                      {r.comment && <p className="text-xs text-text-muted mt-1">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
