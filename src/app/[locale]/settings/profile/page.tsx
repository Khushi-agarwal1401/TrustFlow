"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface FreelancerProfile {
  title: string | null
  bio: string | null
  skills: string[]
  hourlyRate: number | null
  availability: string | null
  portfolio: Record<string, unknown> | null
}

export default function ProfileEditPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [hourlyRate, setHourlyRate] = useState("")
  const [availability, setAvailability] = useState("")

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: FreelancerProfile | null) => {
        if (data) {
          setTitle(data.title || "")
          setBio(data.bio || "")
          setSkills(data.skills || [])
          setHourlyRate(data.hourlyRate ? (data.hourlyRate / 100).toString() : "")
          setAvailability(data.availability || "")
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function addSkill() {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
    }
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          bio,
          skills,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
          availability,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to save profile")
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const profileUrl = session?.user?.id ? `/profile/${session.user.id}` : null

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
      <div className="card-double"><div className="card-inner space-y-4">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-10 w-full" />
      </div></div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Edit Profile</h1>
        </div>
        {profileUrl && (
          <Link href={profileUrl} className="btn-ghost text-xs">View Public Profile</Link>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Professional Title</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full-Stack Developer, UI/UX Designer"
              />
              <p className="text-[10px] text-text-muted mt-1">Appears on your public profile next to your name</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="card-double animate-fade-up stagger-2">
          <div className="card-inner space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Bio</label>
              <textarea
                className="input min-h-[160px] resize-y leading-relaxed"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential clients about your experience, expertise, and what makes you stand out..."
              />
              <p className="text-[10px] text-text-muted mt-1">Markdown is supported for formatting</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card-double animate-fade-up stagger-3">
          <div className="card-inner space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Skills</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                />
                <button type="button" onClick={addSkill} disabled={!skillInput.trim()} className="btn-primary text-sm whitespace-nowrap">
                  Add
                </button>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="badge bg-accent-subtle text-accent-primary flex items-center gap-1.5 group"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-accent-primary/60 hover:text-danger transition"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-muted mt-2">No skills added yet. Add skills that represent your expertise.</p>
              )}
            </div>
          </div>
        </div>

        {/* Hourly Rate & Availability */}
        <div className="card-double animate-fade-up stagger-4">
          <div className="card-inner space-y-4">
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Rate & Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Hourly Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                  <input
                    className="input pl-7"
                    type="number"
                    min="0"
                    step="0.01"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Availability</label>
                <select
                  className="input"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <option value="">Select availability</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="WEEKENDS">Weekends Only</option>
                  <option value="NOT_AVAILABLE">Not Available</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="p-4 bg-danger/10 rounded-xl text-sm text-danger animate-fade-in">{error}</div>
        )}
        {saved && (
          <div className="p-4 bg-success/10 rounded-xl text-sm text-success animate-fade-in flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Profile saved successfully!
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 animate-fade-up stagger-5">
          <Link href={profileUrl || "/"} className="btn-ghost">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}
