import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function FreelancerTrackRecordPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params

  const freelancer = await prisma.user.findUnique({
    where: { id },
    include: {
      freelancerProfile: true,
      projectsAsFreelancer: {
        include: {
          client: { select: { id: true, name: true, avatarUrl: true } },
          milestones: {
            include: {
              submissions: { take: 1, orderBy: { submittedAt: "desc" } },
            },
            orderBy: { sequence: "asc" },
          },
          ratings: {
            where: { ratedUser: id },
            include: { rater: { select: { name: true, avatarUrl: true } } },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      ratingsReceived: {
        include: { rater: { select: { name: true, avatarUrl: true } }, project: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!freelancer) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#0F172A]">Freelancer not found</p>
          <Link href="/freelancers" className="text-sm text-[#4F46E5] hover:underline mt-2 inline-block">
            &larr; Back to freelancers
          </Link>
        </div>
      </div>
    )
  }

  // Check authorization: current user must be a client who has worked with this freelancer
  const isOwnProfile = freelancer.id === session.user.id
  const relatedProject = freelancer.projectsAsFreelancer.find((p) => p.clientId === session.user.id)
  const isAdmin = session.user.roles?.includes("ADMIN") ?? false
  const isAuthorized = isOwnProfile || !!relatedProject || isAdmin

  if (!isAuthorized) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#0F172A]">Unauthorized</p>
          <p className="text-sm text-[#64748B] mt-1">You don't have access to this freelancer's profile.</p>
          <Link href="/freelancers" className="text-sm text-[#4F46E5] hover:underline mt-2 inline-block">
            &larr; Back to freelancers
          </Link>
        </div>
      </div>
    )
  }

  const profile = freelancer.freelancerProfile
  const projects = freelancer.projectsAsFreelancer

  // Compute track record metrics from real data
  const completedProjects = projects.filter((p) => p.status === "COMPLETED")
  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING")
  const completedMilestones = projects.flatMap((p) => p.milestones.filter((m) => m.status === "APPROVED" || m.status === "PAID"))
  const allMilestones = projects.flatMap((p) => p.milestones)
  const paidMilestones = projects.flatMap((p) => p.milestones.filter((m) => m.status === "PAID"))
  const totalReleasedPayments = paidMilestones.reduce((sum, m) => sum + m.amount, 0)
  const onTimeMilestones = completedMilestones.filter((m) => m.dueDate && m.submissions?.[0]?.submittedAt <= m.dueDate)
  const onTimeDeliveryRate = completedMilestones.length > 0
    ? Math.round((onTimeMilestones.length / completedMilestones.length) * 100)
    : null
  const totalRatings = freelancer.ratingsReceived
  const averageRating = totalRatings.length > 0
    ? totalRatings.reduce((sum, r) => sum + r.score, 0) / totalRatings.length
    : null
  const disputedProjects = projects.filter((p) => p.status === "DISPUTED")
  const disputeRate = projects.length > 0
    ? Math.round((disputedProjects.length / projects.length) * 100)
    : 0
  const totalRevisionCount = allMilestones.reduce((sum, m) => sum + m.revisionCount, 0)

  const location = [profile?.city, profile?.country].filter(Boolean).join(", ")

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between hidden lg:flex shrink-0 h-screen overflow-y-auto">
        <div>
          <div className="h-[72px] flex items-center px-6 border-b border-transparent">
            <div className="flex items-center gap-2.5 text-[#4F46E5]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">TrustFlow</span>
            </div>
          </div>
          <nav className="px-4 py-6 flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
              Dashboard
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
              Projects
            </Link>
            <Link href="/freelancers" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Freelancers
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/freelancers" className="text-[#64748B] hover:text-[#0F172A] transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </Link>
            <span className="text-sm text-[#64748B]">/</span>
            <span className="text-sm font-semibold text-[#0F172A]">Freelancer Profile</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            {/* Profile Header */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 mb-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#4F46E5] flex items-center justify-center text-3xl font-bold text-white shrink-0 overflow-hidden">
                  {freelancer.avatarUrl ? (
                    <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-full h-full object-cover" />
                  ) : (
                    freelancer.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-[#0F172A]">{freelancer.name}</h1>
                      {profile?.title && (
                        <p className="text-sm text-[#64748B] mt-0.5">{profile.title}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#64748B]">
                        {location && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {location}
                          </span>
                        )}
                        {profile?.hourlyRate && (
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                            </svg>
                            ${(profile.hourlyRate / 100).toFixed(2)}/hr
                          </span>
                        )}
                        {profile?.availability && (
                          <span className="flex items-center gap-1 text-[#10B981]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            {profile.availability.replace("_", " ").toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwnProfile && (
                        <Link
                          href="/settings/profile"
                          className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit Profile
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {profile?.skills && profile.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  {profile?.bio && (
                    <p className="text-sm text-[#64748B] mt-4 leading-relaxed max-w-2xl">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Track Record Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              <MetricCard
                label="Completed Projects"
                value={completedProjects.length}
                icon={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="text-[#10B981]"
                bgColor="bg-[#ECFDF5]"
              />
              <MetricCard
                label="On-time Delivery"
                value={onTimeDeliveryRate !== null ? `${onTimeDeliveryRate}%` : "—"}
                subtitle={completedMilestones.length > 0 ? `${onTimeMilestones.length}/${completedMilestones.length} milestones` : "Not enough data"}
                icon={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="text-[#3B82F6]"
                bgColor="bg-[#EFF6FF]"
              />
              <MetricCard
                label="Average Rating"
                value={averageRating !== null ? `${averageRating.toFixed(1)}` : "—"}
                subtitle={totalRatings.length > 0 ? `${totalRatings.length} reviews` : "Not enough data"}
                icon={
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                }
                color="text-[#F59E0B]"
                bgColor="bg-[#FFFBEB]"
              />
              <MetricCard
                label="Payments Released"
                value={`$${(totalReleasedPayments / 100).toLocaleString()}`}
                icon={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                }
                color="text-[#8B5CF6]"
                bgColor="bg-[#F5F3FF]"
              />
              <MetricCard
                label="Dispute Rate"
                value={`${disputeRate}%`}
                subtitle={`${disputedProjects.length} disputes`}
                icon={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color={disputeRate > 10 ? "text-red-500" : "text-[#64748B]"}
                bgColor={disputeRate > 10 ? "bg-red-50" : "bg-gray-50"}
              />
              <MetricCard
                label="Revisions"
                value={totalRevisionCount}
                icon={
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
                color="text-[#64748B]"
                bgColor="bg-gray-50"
              />
            </div>

            {/* Main Grid */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Projects */}
              <div className="lg:w-[65%] space-y-4">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-[#0F172A] text-[15px]">Project History</h2>
                  </div>
                  {projects.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {projects.map((project) => {
                        const clientRating = project.ratings.find((r) => r.ratedBy === project.clientId)
                        const totalMilestones = project.milestones.length
                        const completedMs = project.milestones.filter((m) => m.status === "APPROVED" || m.status === "PAID").length

                        return (
                          <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#0F172A] truncate">{project.title}</span>
                                <span className={`
                                  text-[10px] font-bold px-2 py-0.5 rounded-full
                                  ${project.status === "COMPLETED" ? "bg-[#ECFDF5] text-[#10B981]" : ""}
                                  ${project.status === "IN_PROGRESS" ? "bg-[#EFF6FF] text-[#3B82F6]" : ""}
                                  ${project.status === "DISPUTED" ? "bg-red-50 text-red-500" : ""}
                                  ${project.status === "DRAFT" || project.status === "AWAITING_ACCEPTANCE" || project.status === "AWAITING_FUNDING" ? "bg-gray-100 text-gray-600" : ""}
                                `}>
                                  {project.status.replace(/_/g, " ").toLowerCase()}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-[#64748B]">
                                <span>Client: {project.client.name}</span>
                                <span>•</span>
                                <span>${(project.totalAmount / 100).toLocaleString()}</span>
                                <span>•</span>
                                <span>{completedMs}/{totalMilestones} milestones</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4 shrink-0">
                              {clientRating && (
                                <div className="flex items-center gap-1 text-[#F59E0B]">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="10" height="10" fill={star <= clientRating.score ? "currentColor" : "#E2E8F0"} viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                  ))}
                                </div>
                              )}
                              <svg width="16" height="16" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-gray-500 font-medium">No projects yet</p>
                      <p className="text-xs text-gray-400 mt-1">Project history will appear here after completing work.</p>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-[#0F172A] text-[15px]">Client Reviews</h2>
                  </div>
                  {totalRatings.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {totalRatings.slice(0, 5).map((rating) => (
                        <div key={rating.id} className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4F46E5] flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {rating.rater.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#0F172A]">{rating.rater.name}</span>
                                <div className="flex items-center gap-1 text-[#F59E0B]">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="10" height="10" fill={star <= rating.score ? "currentColor" : "#E2E8F0"} viewBox="0 0 24 24">
                                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              {rating.comment && (
                                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{rating.comment}</p>
                              )}
                              <p className="text-[10px] text-[#94A3B8] mt-1">
                                on {rating.project?.title || "a project"} • {new Date(rating.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-gray-500 font-medium">No reviews yet</p>
                      <p className="text-xs text-gray-400 mt-1">Reviews from clients will appear here after project completion.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Milestone Performance + Integrations */}
              <div className="lg:w-[35%] space-y-6">
                {/* Milestone Performance */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-5">Milestone Performance</h3>
                  <div className="space-y-4">
                    <PerfBar label="Completed" value={completedMilestones.length} total={allMilestones.length} color="bg-[#10B981]" />
                    <PerfBar label="On Time" value={onTimeMilestones.length} total={completedMilestones.length} color="bg-[#3B82F6]" />
                    <PerfBar label="In Progress" value={activeProjects.length} total={projects.length} color="bg-[#F59E0B]" />
                    <PerfBar label="Disputed" value={disputedProjects.length} total={projects.length} color="bg-red-500" />
                  </div>
                </div>

                {/* Integrations */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-5">Connected Integrations</h3>
                  <div className="space-y-3">
                    <IntegrationRow name="GitHub" connected={false} />
                    <IntegrationRow name="Google Drive" connected={false} />
                    <IntegrationRow name="Figma" connected={false} />
                    <IntegrationRow name="Slack" connected={false} />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link
                      href={`/projects?freelancer=${freelancer.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-[#0F172A] font-medium transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      View Projects
                    </Link>
                    <Link
                      href={`/messages?user=${freelancer.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-[#0F172A] font-medium transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Send Message
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  color,
  bgColor,
}: {
  label: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${bgColor} ${color} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="text-[11px] font-bold text-[#64748B]">{label}</div>
      </div>
      <div className={`text-[22px] font-bold text-[#0F172A] leading-none mb-1`}>{value}</div>
      {subtitle && <div className="text-[10px] text-[#64748B]">{subtitle}</div>}
    </div>
  )
}

function PerfBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-medium text-[#0F172A]">{label}</span>
        <span className="text-[#64748B]">{value}/{total} ({pct}%)</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function IntegrationRow({ name, connected }: { name: string; connected: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-[#0F172A]">{name}</span>
      {connected ? (
        <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full">Connected</span>
      ) : (
        <span className="text-[10px] text-[#64748B]">Not connected</span>
      )}
    </div>
  )
}
