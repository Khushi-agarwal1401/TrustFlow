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

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>
  if (!profile) return <div className="p-6 text-text-muted">User not found</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/marketplace" className="text-text-secondary text-sm hover:text-text-primary">&larr; Marketplace</Link>

      <div className="mt-4 grid grid-cols-3 gap-6">
        <div className="card p-4 text-center">
          <div className="w-20 h-20 rounded-full bg-accent-primary mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold">{profile.name}</h1>
          <p className="text-text-secondary text-sm">{profile.profile?.title || "No title"}</p>
          {profile.profile?.hourlyRate && (
            <p className="text-accent-primary font-semibold mt-2">${(profile.profile.hourlyRate / 100).toFixed(2)}/hr</p>
          )}
        </div>

        <div className="col-span-2 space-y-4">
          {profile.profile?.bio && (
            <div className="card p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-text-secondary">{profile.profile.bio}</p>
            </div>
          )}

          {profile.profile?.skills && profile.profile.skills.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.profile.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-accent-subtle text-accent-primary text-xs rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-accent-primary">{profile.stats.completedProjects}</p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{profile.stats.avgRating?.toFixed(1) || "—"}</p>
                <p className="text-xs text-text-muted">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{profile.stats.totalReviews}</p>
                <p className="text-xs text-text-muted">Reviews</p>
              </div>
            </div>
          </div>

          {profile.recentReviews.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Recent Reviews</h3>
              <div className="space-y-2">
                {profile.recentReviews.map((r) => (
                  <div key={r.id} className="p-2 bg-bg-elevated rounded">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{r.rater.name}</span>
                      <span className="text-warning">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                    </div>
                    {r.comment && <p className="text-xs text-text-muted mt-1">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
