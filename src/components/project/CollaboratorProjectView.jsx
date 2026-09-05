import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getRoleOccupancy, STATUS_COLORS } from './projectRoleUtils'
import RoleCategoryImage from './RoleCategoryImage'

export default function CollaboratorProjectView({
  project,
  user,
  signedScriptUrl,
  onApplyRole,
}) {
  const [showScriptPreview, setShowScriptPreview] = useState(false)

  // Derived application data
  const applicants = useMemo(() => project?.applicants || [], [project?.applicants])
  const teamMembers = useMemo(
    () => applicants.filter((a) => (a.status || '').toLowerCase() === 'accepted'),
    [applicants]
  )

  // Capacity calculations across all roles
  const { totalRequired, totalFilled, openRolesCount } = useMemo(() => {
    const rawRoles = Array.isArray(project?.rawRoles) ? project.rawRoles : []
    let reqSum = 0
    let fillSum = 0
    let openCount = 0

    rawRoles.forEach((r) => {
      const { requiredCount, acceptedCount, isFilled } = getRoleOccupancy(r, applicants)
      reqSum += requiredCount
      fillSum += acceptedCount
      if (!isFilled) openCount++
    })

    return {
      totalRequired: reqSum,
      totalFilled: fillSum,
      openRolesCount: openCount,
    }
  }, [project?.rawRoles, applicants])

  const hasRoles = Array.isArray(project?.roles) && project.roles.length > 0 && totalRequired > 0
  const isAllRolesFilled = hasRoles && totalFilled >= totalRequired

  // Current user's application status on this project
  const myApplication = useMemo(() => {
    if (!user || !applicants || applicants.length === 0) return null
    return applicants.find((a) =>
      (user.id && (a.applicant_id === user.id || a.applicant?.id === user.id)) ||
      (user.name && a.name === user.name)
    )
  }, [user, applicants])

  const myAppStatus = myApplication ? String(myApplication.status || '').toUpperCase() : null

  // Creator profile link destination
  const creatorId = project?.creator?.id || project?.creator_id || null

  // Clean metadata strip without orphaned separators or NaN values
  const metadataItems = useMemo(() => {
    const items = []
    if (project?.location) {
      items.push({
        key: 'location',
        node: (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {project.location}
          </span>
        ),
      })
    }
    const numBudget = Number(project?.budget)
    if (project?.budget != null && project?.budget !== '' && !isNaN(numBudget) && numBudget > 0) {
      items.push({
        key: 'budget',
        node: (
          <span className="flex items-center gap-1 text-white/60">
            <span className="text-emerald-400 font-semibold">₹</span>
            {numBudget.toLocaleString('en-IN')}
          </span>
        ),
      })
    }
    if (project?.timeline) {
      items.push({
        key: 'timeline',
        node: (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {project.timeline}
          </span>
        ),
      })
    }
    return items
  }, [project?.location, project?.budget, project?.timeline])

  return (
    <div className="space-y-20 sm:space-y-24 animate-fade-in">
      {/* ─── Back Nav ─── */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 hover:text-white transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Explore Projects
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════
          1. CINEMATIC PROJECT HERO
          ════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-[#0E0E14] shadow-2xl">
        {/* Ambient atmospheric poster backdrop */}
        {project?.thumbnail && (
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: `url(${project.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(70px)',
              opacity: 0.08,
              transform: 'scale(1.15)',
            }}
          />
        )}
        {/* Soft radial overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/85 to-black/75 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14">
          {/* Portrait Poster (2:3 aspect ratio, ~280px-300px desktop) */}
          <div className="w-56 sm:w-64 lg:w-72 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.8)] bg-[#14141C] relative group">
            <img
              src={project?.thumbnail || '/images/hero-bg.png'}
              alt={project?.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => { e.target.src = '/images/hero-bg.png' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
          </div>

          {/* Project Identity & Pitch Information */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-2 text-center lg:text-left">
            <div>
              {/* Status & Genre Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full ${STATUS_COLORS[project?.status] || 'border-white/20 text-white/60'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${project?.status === 'Open' ? 'bg-purple animate-pulse' : project?.status === 'In Production' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {project?.status}
                </span>
                {project?.genre && (
                  <span className="px-3 py-1 text-xs font-semibold tracking-widest uppercase text-white/50 bg-white/[0.04] border border-white/10 rounded-full">
                    {project.genre}
                  </span>
                )}
              </div>

              {/* Title (Natural wrap, break-words) */}
              <h1 className="font-['Fraunces',_serif] text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.02em] leading-[1.08] text-white mb-5 break-words">
                {project?.title}
              </h1>

              {/* Logline (Short pitch) */}
              {project?.logline && (
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl mx-auto lg:mx-0 font-normal break-words">
                  {project.logline}
                </p>
              )}

              {/* Production Metadata Strip */}
              {metadataItems.length > 0 && (
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3.5 gap-y-2 text-xs sm:text-sm text-white/45 mb-8">
                  {metadataItems.map((item, idx) => (
                    <span key={item.key} className="flex items-center gap-3.5">
                      {idx > 0 && <span className="text-white/20 select-none">•</span>}
                      {item.node}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Hero: Creator Credibility + Primary CTA */}
            <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Creator Block */}
              {project?.creator && (
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
                    {project.creator.avatar ? (
                      <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-purple">{(project.creator.name || 'C').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-white/35 font-medium uppercase tracking-wider">Created by</p>
                    <p className="text-sm font-semibold text-white leading-tight">{project.creator.name || 'Unknown Creator'}</p>
                    {creatorId ? (
                      <Link
                        to={`/profile/${creatorId}`}
                        className="text-xs text-purple-light hover:text-white transition-colors inline-flex items-center gap-1 mt-0.5"
                      >
                        View Profile →
                      </Link>
                    ) : (
                      <span className="text-xs text-white/40 mt-0.5 block">{project.creator.role || 'Creator'}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Primary CTA & Capacity Summary */}
              <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                {!hasRoles ? (
                  <button
                    disabled
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.04] text-white/35 text-sm font-semibold rounded-xl border border-white/10 cursor-not-allowed"
                  >
                    No Open Roles
                  </button>
                ) : isAllRolesFilled ? (
                  <button
                    disabled
                    type="button"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.05] text-white/40 text-sm font-semibold rounded-xl border border-white/10 cursor-not-allowed"
                  >
                    All Roles Filled
                  </button>
                ) : (
                  <a
                    href="#roles-section"
                    className="inline-flex items-center gap-2 px-7 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_28px_rgba(98,57,191,0.4)] active:scale-95"
                  >
                    <span>View Open Roles</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                )}

                <p className="text-[11px] text-white/40">
                  {!hasRoles
                    ? 'No positions currently open'
                    : isAllRolesFilled
                    ? 'All positions filled'
                    : `${openRolesCount} role${openRolesCount === 1 ? '' : 's'} open • ${totalFilled} / ${totalRequired} positions filled`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          2. ROLES / JOIN THE PROJECT (First section after Hero)
          ════════════════════════════════════════════════════ */}
      <section id="roles-section" className="scroll-mt-28">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
          <div>
            <h2 className="font-['Fraunces',_serif] text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-white">
              Join the Project
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Explore available roles and find where you can contribute to this production.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-light/90 bg-purple/10 border border-purple/20 px-3 py-1 rounded-full self-start sm:self-auto">
            {!hasRoles
              ? 'No positions currently open'
              : `${openRolesCount} open role${openRolesCount === 1 ? '' : 's'} • ${totalFilled} / ${totalRequired} positions filled`}
          </span>
        </div>

        <div className="h-px bg-white/[0.08] mb-8" />

        {hasRoles ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {project.roles.map((role) => {
              const rawRole = Array.isArray(project.rawRoles)
                ? project.rawRoles.find((r) => r.role === role)
                : null
              const { requiredCount, acceptedCount, isFilled, remainingSlots } = getRoleOccupancy(
                rawRole,
                applicants
              )
              const percentage = requiredCount > 0
                ? Math.min(100, Math.max(0, Math.round((acceptedCount / requiredCount) * 100)))
                : 0
              const experience = rawRole?.experience_level || rawRole?.experience || null

              // Check if authenticated user has an application for this specific role
              const userApplication = user && applicants
                ? applicants.find((a) =>
                    ((user.id && (a.applicant_id === user.id || a.applicant?.id === user.id)) ||
                     (user.name && a.name === user.name)) &&
                    (rawRole?.id && a.project_role_id
                      ? String(a.project_role_id) === String(rawRole.id)
                      : a.role === role)
                  )
                : null

              const appStatus = (userApplication?.status || '').toLowerCase()

              return (
                <div
                  key={role}
                  className="w-full min-w-0 group flex flex-col justify-between p-4 sm:p-5 bg-[#111116] border border-white/[0.08] hover:border-purple/30 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                >
                  <div>
                    {/* Header: Role Name & Experience Level with leading Category Image */}
                    <div className="flex items-center gap-3.5 mb-2.5">
                      <RoleCategoryImage role={role} />
                      <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                        <h3 className="text-base sm:text-[17px] font-semibold text-white leading-snug group-hover:text-purple-light transition-colors break-words">
                          {role}
                        </h3>
                        {experience && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-white/50 bg-white/[0.04] border border-white/10 rounded-md shrink-0">
                            {experience}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Occupancy counts */}
                    <div className="flex items-baseline justify-between gap-1 text-xs text-white/55 mb-1.5 min-w-0">
                      <span className="font-medium text-white/70 shrink-0">
                        {acceptedCount} / {requiredCount} <span className="text-white/40 font-normal">filled</span>
                      </span>
                      <span className="text-[11px] text-white/40 text-right">
                        {isFilled ? 'Role Filled' : `${remainingSlots} position${remainingSlots === 1 ? '' : 's'} remaining`}
                      </span>
                    </div>

                    {/* Slim Progress bar */}
                    <div className="h-1 w-full bg-white/[0.06] rounded-full overflow-hidden mb-3.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFilled ? 'bg-purple-light/70' : 'bg-purple'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Application Action / Status Slot (Compact footer row) */}
                  <div className="pt-1">
                    {userApplication ? (
                      appStatus === 'accepted' ? (
                        <div className="flex items-center justify-end w-full">
                          <div className="flex flex-col items-end text-right">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/90">
                              <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>You're on the Team</span>
                            </div>
                            <span className="text-[10px] text-emerald-400/60 mt-0.5">Application accepted</span>
                          </div>
                        </div>
                      ) : appStatus === 'rejected' ? (
                        <div className="flex items-center justify-end w-full">
                          <div className="flex flex-col items-end text-right">
                            <span className="text-xs font-semibold text-white/50">Application Closed</span>
                            <span className="text-[10px] text-white/30 mt-0.5">Not selected for this position</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end w-full">
                          <div className="flex flex-col items-end text-right">
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-light">
                              <svg className="w-3.5 h-3.5 text-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              <span>Application Submitted</span>
                            </div>
                            <span className="text-[10px] text-white/45 mt-0.5">Awaiting creator review</span>
                          </div>
                        </div>
                      )
                    ) : isFilled ? (
                      <div className="flex items-center justify-end w-full">
                        <div className="flex flex-col items-end text-right">
                          <span className="text-xs font-semibold text-white/40">Role Filled</span>
                          <span className="text-[10px] text-white/25 mt-0.5">All positions filled</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-light/80 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                          Open
                        </span>
                        <button
                          type="button"
                          onClick={() => onApplyRole(role)}
                          className="px-4 py-1.5 bg-purple text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(98,57,191,0.35)] active:scale-[0.98] inline-flex items-center justify-center gap-1.5 shrink-0"
                        >
                          <span>Apply for Role</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
            <p className="text-white/40 text-sm">No roles are currently open for this project.</p>
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
          3. ABOUT THE PROJECT + READ THE SCRIPT (Two-Column Desktop)
          ════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
        {/* Left Column: About the Project (60% width) */}
        <div className="lg:col-span-3 min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-['Fraunces',_serif] text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-white">
              About the Project
            </h2>
          </div>
          <div className="h-px bg-white/[0.08] mb-6 sm:mb-8" />

          {project?.description ? (
            <p className="text-white/75 text-base sm:text-lg leading-[1.85] whitespace-pre-line break-words font-normal">
              {project.description}
            </p>
          ) : (
            <p className="text-white/40 text-sm italic">Project description not available yet.</p>
          )}
        </div>

        {/* Right Column: Read the Script (40% width) */}
        <div className="lg:col-span-2 min-w-0 self-start">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-['Fraunces',_serif] text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-white">
              Read the Script
            </h2>
            {signedScriptUrl ? (
              <span className="text-xs text-emerald-400/90 font-medium flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Screenplay Available
              </span>
            ) : project?.script_url ? (
              project.script_visibility === 'APPLICANTS' ? (
                <span className="text-xs text-purple-light font-medium flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                  Protected
                </span>
              ) : (
                <span className="text-xs text-white/45 font-medium flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  Private Screenplay
                </span>
              )
            ) : null}
          </div>
          <div className="h-px bg-white/[0.08] mb-6 sm:mb-8" />

          {signedScriptUrl ? (
            <div className="p-5 sm:p-6 bg-[#111116] border border-white/[0.08] rounded-2xl space-y-4">
              {/* Script Presentation Header */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple/15 border border-purple/30 flex items-center justify-center shrink-0 text-purple-light">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white">Project Screenplay</h3>
                  <p className="text-xs text-white/50 mt-0.5">Read the screenplay shared by the project creator.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowScriptPreview(!showScriptPreview)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>{showScriptPreview ? 'Hide Preview' : 'Preview Script'}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showScriptPreview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <a
                  href={signedScriptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] flex items-center justify-center gap-1.5"
                >
                  <span>Open Full Screen</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>

              {/* Contained Script Preview Iframe (Opens directly inside this right column panel) */}
              {showScriptPreview && (
                <div className="pt-2 animate-fade-in space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-white/45">
                    <span>Script Document Viewer</span>
                    <a
                      href={signedScriptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-light hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>Open in new tab</span>
                      <span>↗</span>
                    </a>
                  </div>
                  <div className="w-full rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a]" style={{ height: '520px' }}>
                    <iframe
                      src={signedScriptUrl}
                      title="Script Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : project?.script_url ? (
            /* Script exists on project, but current viewer is unauthorized */
            project.script_visibility === 'APPLICANTS' ? (
              <div className="p-6 bg-[#111116] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple/15 border border-purple/30 flex items-center justify-center shrink-0 text-purple-light">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">Screenplay Protected</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {myAppStatus === 'REJECTED' || myAppStatus === 'WITHDRAWN'
                        ? 'Script access is limited to active applicants and team members.'
                        : 'Apply for a role on this project to access the screenplay.'}
                    </p>
                  </div>
                </div>

                {(!myAppStatus || (myAppStatus !== 'REJECTED' && myAppStatus !== 'WITHDRAWN')) && (
                  <div className="pt-1">
                    <a
                      href="#roles-section"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] active:scale-95"
                    >
                      <span>View Open Roles</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* ACCEPTED_TEAM (or default) */
              <div className="p-6 bg-[#111116] border border-white/[0.08] rounded-2xl space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.10] flex items-center justify-center shrink-0 text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white">Private Screenplay</h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      {myAppStatus === 'PENDING'
                        ? 'Your application is awaiting review. Script access unlocks if you join the team.'
                        : myAppStatus === 'REJECTED' || myAppStatus === 'WITHDRAWN'
                        ? 'Script access is limited to confirmed cast and crew.'
                        : 'This screenplay is available to confirmed cast and crew.'}
                    </p>
                  </div>
                </div>

                {myAppStatus === 'PENDING' && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple/10 border border-purple/20 text-[11px] text-purple-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                    Application Pending Review
                  </div>
                )}
              </div>
            )
          ) : (
            /* No script uploaded on project */
            <div className="p-6 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2.5 text-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">Script not available yet</p>
              <p className="text-white/30 text-xs">The creator hasn't uploaded a screenplay for this project.</p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          4. TEAM & CREDITS (Editorial Production Roster)
          ════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-['Fraunces',_serif] text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-white">
            Team & Credits
          </h2>
          <span className="text-xs text-white/40 font-medium">
            {teamMembers.length} {teamMembers.length === 1 ? 'collaborator' : 'collaborators'} announced
          </span>
        </div>
        <div className="h-px bg-white/[0.08] mb-8" />

        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => {
              const profileId = member.applicant_id || member.applicant?.id || null
              const profileUrl = profileId ? `/profile/${profileId}` : null

              return (
                <div
                  key={member.id}
                  className="p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl transition-all duration-200 flex flex-col items-center text-center gap-3 group"
                >
                  {profileUrl ? (
                    <Link to={profileUrl} className="block group/avatar">
                      <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 group-hover/avatar:border-purple flex items-center justify-center overflow-hidden transition-colors">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 w-full">
                    {profileUrl ? (
                      <Link
                        to={profileUrl}
                        className="text-sm font-semibold text-white hover:text-purple-light transition-colors truncate block"
                      >
                        {member.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                    )}
                    <p className="text-xs text-purple-light font-medium mt-0.5">{member.role}</p>
                    {member.location && (
                      <p className="text-[11px] text-white/35 mt-1">{member.location}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#111116]/50 border border-white/[0.06] rounded-2xl max-w-md mx-auto">
            <p className="text-white/40 text-sm font-medium mb-1">Team forming</p>
            <p className="text-white/25 text-xs">No collaborators have been announced yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
