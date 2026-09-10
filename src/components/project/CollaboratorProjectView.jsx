import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getRoleOccupancy } from './projectRoleUtils'
import ProjectDetailsCard from './ProjectDetailsCard'
import { formatBudgetRange } from '../../utils/projectDetailsFormatters'

function RoleIcon({ role }) {
  const r = (role || '').toLowerCase()

  // Camera / Cinematography
  if (r.includes('camera') || r.includes('cinematograph') || r.includes('dp') || r.includes('dop') || r.includes('photo') || r.includes('steadicam') || r.includes('dit')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
      </svg>
    )
  }

  // Film Editing / Post-Production / VFX
  if (r.includes('edit') || r.includes('vfx') || r.includes('visual effects') || r.includes('colorist') || r.includes('post')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
      </svg>
    )
  }

  // Music / Composer / Score
  if (r.includes('music') || r.includes('compos') || r.includes('score') || r.includes('soundtrack')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-2.274-1.733V12.75m5.226-6.303v7.303M9 14.25v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377A1.803 1.803 0 0 1 3.774 18.807V9.75a2.25 2.25 0 0 1 1.632-2.163l4.5-1.286A2.25 2.25 0 0 1 12.5 8.464V12" />
      </svg>
    )
  }

  // Sound / Audio / Foley / Boom
  if (r.includes('sound') || r.includes('audio') || r.includes('boom') || r.includes('foley') || r.includes('mic')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0V12a3 3 0 0 1-3 3Z" />
      </svg>
    )
  }

  // Acting / Cast / Voice / Talent
  if (r.includes('actor') || r.includes('actress') || r.includes('cast') || r.includes('talent') || r.includes('voice') || r.includes('stunt')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    )
  }

  // Direction / AD / Continuity
  if (r.includes('direct') || r.includes('ad') || r.includes('continuity') || r.includes('script supervisor')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.25 6H3.75m16.5 0-3 4.5M3.75 6l3 4.5m10.5-4.5-3 4.5M10.5 6l3 4.5" />
      </svg>
    )
  }

  // Grip / Electric / Lighting
  if (r.includes('gaffer') || r.includes('grip') || r.includes('electric') || r.includes('light')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    )
  }

  // Art Department / Production Design / Props / Set
  if (r.includes('art') || r.includes('design') || r.includes('prop') || r.includes('set') || r.includes('scenic')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.39m3.42 3.42a15.995 15.995 0 0 0 4.764-4.635m-4.764 4.635a15.996 15.996 0 0 1-4.635-4.764m4.764 4.635 2.828 2.829a2.25 2.25 0 0 0 3.182-3.182l-2.828-2.828" />
      </svg>
    )
  }

  // Writing / Screenplay
  if (r.includes('writ') || r.includes('screenplay') || r.includes('script')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    )
  }

  // Default / Production / Management / Briefcase
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.25v4.242a2.25 2.25 0 0 1-.659 1.591l-1.5 1.5A2.25 2.25 0 0 1 16.5 22.25H7.5a2.25 2.25 0 0 1-1.591-.659l-1.5-1.5A2.25 2.25 0 0 1 3.75 18.492V14.25m16.5 0v-4.5a2.25 2.25 0 0 0-2.25-2.25h-12a2.25 2.25 0 0 0-2.25 2.25v4.5m16.5 0a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 14.25m16.5 0H3m13.5-6.75V5.25A2.25 2.25 0 0 0 14.25 3h-4.5A2.25 2.25 0 0 0 7.5 5.25v2.25" />
    </svg>
  )
}

export default function CollaboratorProjectView({
  project,
  user,
  signedScriptUrl,
  onApplyRole,
  applicationsError = false,
  onRetryApplications,
  onEnsureScriptUrl,
}) {
  const [showScriptPreview, setShowScriptPreview] = useState(false)
  const [isOpeningScript, setIsOpeningScript] = useState(false)

  const rawStatus = String(project?.rawStatus || project?.status || '').toUpperCase()
  const isProjectOpen = rawStatus === 'OPEN'
  const isProjectCompleted = rawStatus === 'COMPLETED'

  const handleOpenScript = async (e) => {
    e.preventDefault()
    if (onEnsureScriptUrl) {
      try {
        setIsOpeningScript(true)
        const freshUrl = await onEnsureScriptUrl()
        if (freshUrl) {
          window.open(freshUrl, '_blank', 'noopener,noreferrer')
        }
      } finally {
        setIsOpeningScript(false)
      }
    } else if (signedScriptUrl) {
      window.open(signedScriptUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleTogglePreview = async () => {
    if (!showScriptPreview && onEnsureScriptUrl) {
      const freshUrl = await onEnsureScriptUrl()
      if (freshUrl) {
        setShowScriptPreview(true)
      }
      return
    }
    setShowScriptPreview(!showScriptPreview)
  }

  // Derived application data
  const applicants = useMemo(() => project?.applicants || [], [project?.applicants])
  const teamMembers = useMemo(
    () => applicants.filter((a) => (a.status || '').toLowerCase() === 'accepted'),
    [applicants]
  )

  // Capacity calculations across all roles
  const { totalRequired, openRolesCount } = useMemo(() => {
    const rawRoles = Array.isArray(project?.rawRoles) ? project.rawRoles : []
    let reqSum = 0
    let fillSum = 0
    let openCount = 0

    rawRoles.forEach((r) => {
      const { requiredCount, acceptedCount, isFilled, isAvailable } = getRoleOccupancy(r, applicants)
      reqSum += requiredCount
      if (isAvailable && acceptedCount != null) {
        fillSum += acceptedCount
      }
      if (!isFilled) openCount++
    })

    return {
      totalRequired: reqSum,
      totalFilled: fillSum,
      openRolesCount: openCount,
    }
  }, [project?.rawRoles, applicants])

  const hasRoles = Array.isArray(project?.roles) && project.roles.length > 0 && totalRequired > 0

  // Current user's application status on this project
  const myApplication = useMemo(() => {
    if (!user || !applicants || applicants.length === 0) return null
    return applicants.find((a) =>
      user.id && (a.applicant_id === user.id || a.applicant?.id === user.id)
    )
  }, [user, applicants])

  const myAppStatus = myApplication ? String(myApplication.status || '').toUpperCase() : null

  // Creator profile link destination
  const creatorId = project?.creator?.id || project?.creator_id || null

  const statusConfig = useMemo(() => {
    const s = String(project?.status || '').trim()
    const raw = String(project?.rawStatus || '').toUpperCase()

    if (s === 'Open' || raw === 'OPEN') {
      return {
        label: 'Actively Recruiting',
        border: 'border-purple/40',
        text: 'text-purple-light',
        dot: 'bg-purple animate-pulse motion-reduce:animate-none',
      }
    }
    if (s === 'In Production' || raw === 'IN_PRODUCTION') {
      return {
        label: 'In Production',
        border: 'border-amber-400/40',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
      }
    }
    if (s === 'Completed' || raw === 'COMPLETED') {
      return {
        label: 'Completed',
        border: 'border-emerald-400/40',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
      }
    }
    return {
      label: s || 'Closed',
      border: 'border-white/20',
      text: 'text-white/60',
      dot: 'bg-white/40',
    }
  }, [project?.status, project?.rawStatus])

  const formattedBudgetRange = formatBudgetRange(project?.budget_min, project?.budget_max, project?.budget)

  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in">
      {/* ════════════════════════════════════════════════════
          STANDALONE PROJECT HEADER
          (Breadcrumb above → Poster on Left | Title, Logline, Metadata on Right)
          ════════════════════════════════════════════════════ */}
      <header className="w-full">
        {/* Breadcrumb Navigation: Home › Explore › [Project Name] */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs text-white/50 font-normal flex-wrap font-['DM_Sans',_sans-serif]">
            <li>
              <Link
                to="/"
                className="text-white/50 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
              >
                Home
              </Link>
            </li>
            <li className="text-white/25 select-none" aria-hidden="true">
              ›
            </li>
            <li>
              <Link
                to="/explore"
                className="text-white/50 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
              >
                Explore
              </Link>
            </li>
            <li className="text-white/25 select-none" aria-hidden="true">
              ›
            </li>
            <li className="text-white/80 truncate max-w-xs sm:max-w-md font-medium" aria-current="page">
              {project?.title || 'Project Details'}
            </li>
          </ol>
        </nav>

        {/* Horizontal Header: Poster (Left) + Text Column (Right) */}
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 lg:gap-10">
          {/* Portrait Poster (2:3 Aspect Ratio, display size reduced by 35%) */}
          <div className="w-[104px] sm:w-[125px] lg:w-[146px] shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-[#14141C] relative">
            <img
              src={project?.poster_url || project?.thumbnail || '/images/hero-bg.png'}
              alt={project?.title || 'Project poster'}
              decoding="async"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/images/hero-bg.png' }}
            />
          </div>

          {/* Text Column (Title, Logline, Metadata) */}
          <div className="flex-1 min-w-0 flex flex-col justify-start">
            {/* Very Large Project Title (Bebas Neue) */}
            <h1 className="font-['Bebas_Neue',_sans-serif] text-[clamp(3.5rem,6vw,6rem)] leading-[0.95] tracking-wide text-white uppercase break-words mb-3 sm:mb-4">
              {project?.title}
            </h1>

            {/* Logline (DM Sans, Light 300, 18px) */}
            {project?.logline && (
              <p className="font-['DM_Sans',_sans-serif] text-lg font-light text-white/70 leading-relaxed max-w-3xl break-words mb-6">
                {project.logline}
              </p>
            )}

            {/* Compact Metadata Row */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 font-['DM_Sans',_sans-serif]">
              {/* Genre Pill */}
              {project?.genre && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] border border-white/10 rounded-full text-xs text-white/70 font-medium">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
                  </svg>
                  <span>{project.genre}</span>
                </span>
              )}

              {/* Location Pill */}
              {project?.location && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] border border-white/10 rounded-full text-xs text-white/70 font-medium">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{project.location}</span>
                </span>
              )}

              {/* Date / Timeline Pill */}
              {project?.timeline && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] border border-white/10 rounded-full text-xs text-white/70 font-medium">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span>{project.timeline}</span>
                </span>
              )}

              {/* Production Budget Pill (Preserved when available) */}
              {formattedBudgetRange && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#000000] border border-white/10 rounded-full text-xs text-white/70 font-medium">
                  {formattedBudgetRange.startsWith('₹') ? (
                    <>
                      <span className="text-emerald-400 font-semibold">₹</span>
                      <span>{formattedBudgetRange.slice(1)}</span>
                    </>
                  ) : (
                    <span>{formattedBudgetRange}</span>
                  )}
                </span>
              )}

              {/* Current Status Pill */}
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#000000] border ${statusConfig.border} rounded-full text-xs font-semibold ${statusConfig.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} aria-hidden="true" />
                <span>{statusConfig.label}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════
          2. ABOUT THE PROJECT & PROJECT DETAILS SECTION
          (Desktop: Two equal columns minmax(0, 1fr) — About Left, Project Details Right)
          ════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
        {/* Left Column: Existing About Section */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl font-normal tracking-wide text-white">
              About the Project
            </h2>
          </div>
          <div className="h-px bg-white/[0.08] mb-6 sm:mb-8" />

          {project?.description ? (
            <p className="text-white/75 text-base sm:text-lg leading-[1.85] whitespace-pre-line break-words font-normal">
              {project.description}
            </p>
          ) : (
            <p className="text-white/50 text-sm italic">Project description not available yet.</p>
          )}
        </div>

        {/* Right Column: Project Details Card */}
        <div className="min-w-0">
          <ProjectDetailsCard project={project} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          3. READ THE SCRIPT / SCRIPT PREVIEW SECTION
          ════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl font-normal tracking-wide text-white">
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
              <span className="text-xs text-white/50 font-medium flex items-center gap-1.5 shrink-0">
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
                onClick={handleTogglePreview}
                className="flex-1 sm:flex-initial px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1 focus-visible:ring-offset-[#111116]"
              >
                <span>{showScriptPreview ? 'Hide Preview' : 'Preview Script'}</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showScriptPreview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={handleOpenScript}
                disabled={isOpeningScript}
                className="flex-1 sm:flex-initial px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-1 focus-visible:ring-offset-[#111116] disabled:opacity-50"
              >
                <span>{isOpeningScript ? 'Opening...' : 'Open Full Screen'}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </button>
            </div>

            {/* Contained Script Preview Iframe (Opens directly inside this panel) */}
            {showScriptPreview && (
              <div className="pt-2 animate-fade-in space-y-2">
                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>Script Document Viewer</span>
                  <button
                    type="button"
                    onClick={handleOpenScript}
                    className="text-purple-light hover:text-white transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
                  >
                    <span>Open in new tab</span>
                    <span>↗</span>
                  </button>
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

              {isProjectOpen && (!myAppStatus || (myAppStatus !== 'REJECTED' && myAppStatus !== 'WITHDRAWN')) && (
                <div className="pt-1">
                  <a
                    href="#roles-section"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
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
                  <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse motion-reduce:animate-none" />
                  Application Pending Review
                </div>
              )}
            </div>
          )
        ) : (
          /* No script uploaded on project */
          <div className="p-6 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2.5 text-white/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-white/60 text-sm font-medium mb-1">Script not available yet</p>
            <p className="text-white/50 text-xs">The creator hasn't uploaded a screenplay for this project.</p>
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════
          4. ROLES NEEDED SECTION
          ════════════════════════════════════════════════════ */}
      <section id="roles-section" className="scroll-mt-28">
        <div className="w-full lg:w-3/4 rounded-[18px] bg-[#111111] border border-white/[0.08] overflow-hidden">
          {/* Header Bar: 20px top, 24px left/right, 18px bottom */}
          <div className="flex items-center justify-between pt-5 px-6 pb-[18px] border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-purple shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                />
              </svg>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                ROLES NEEDED
              </h2>
            </div>
            <span className="text-xs text-white/50 tracking-normal">
              {!hasRoles
                ? 'No open roles'
                : applicationsError
                ? 'Availability unavailable'
                : !isProjectOpen
                ? isProjectCompleted
                ? 'Project completed'
                : 'Applications closed'
                : `${openRolesCount} of ${project.roles.length} open`}
            </span>
          </div>

          {/* Section Body: 20px top, 24px left/right, 24px bottom */}
          <div className="pt-5 px-5 sm:px-6 pb-6">
            {hasRoles ? (
              <div className="flex flex-col gap-2.5">
                {project.roles.map((role) => {
                  const rawRole = Array.isArray(project.rawRoles)
                    ? project.rawRoles.find((r) => r.role === role)
                    : null
                  const { requiredCount, acceptedCount, isFilled, isAvailable } = getRoleOccupancy(
                    rawRole,
                    applicants
                  )
                  const percentage = isAvailable && acceptedCount != null && requiredCount > 0
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
                  const isRoleOpen = isAvailable !== false && !isFilled && isProjectOpen && !userApplication && !applicationsError

                  return (
                    <div
                      key={role}
                      className={`relative w-full rounded-[12px] px-[18px] py-[14px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors duration-200 bg-[#141414] ${
                        isRoleOpen
                          ? 'border border-white/[0.08] hover:border-purple/50'
                          : 'border border-white/[0.04]'
                      }`}
                    >
                      {/* Left: Icon, Title + Experience, Metadata line with progress bar */}
                      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                        {/* 40x40 Icon Container with 10px radius */}
                        <div
                          className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border ${
                            isRoleOpen
                              ? 'bg-purple/10 border-purple/20 text-purple'
                              : 'bg-white/[0.03] border-white/[0.06] text-white/30'
                          }`}
                          aria-hidden="true"
                        >
                          <RoleIcon role={role} />
                        </div>

                        {/* Role Details: 2px gap between name and metadata */}
                        <div className="min-w-0 flex-1 flex flex-col gap-[2px]">
                          {/* Role name (approx 14px) + experience */}
                          <div className="flex flex-wrap items-baseline gap-x-2">
                            <h3
                              className={`text-sm font-semibold leading-snug break-words ${
                                isRoleOpen ? 'text-white' : 'text-white/50'
                              }`}
                            >
                              {role}
                            </h3>
                            {experience && (
                              <span className="text-xs text-white/40 font-normal">
                                · {experience}
                              </span>
                            )}
                          </div>

                          {/* Metadata line: approx 11.5px, slots, progress bar, filled count */}
                          <div className="flex items-center gap-2.5 sm:gap-3 text-[11.5px] text-white/50 flex-wrap">
                            <span>
                              {requiredCount} {requiredCount === 1 ? 'slot' : 'slots'}
                            </span>

                            {applicationsError || !isAvailable || acceptedCount == null ? (
                              <span className="text-white/40">· Occupancy unavailable</span>
                            ) : (
                              <>
                                <div
                                  className="w-20 sm:w-24 h-1.5 bg-white/[0.08] rounded-full overflow-hidden shrink-0"
                                  role="progressbar"
                                  aria-label={`${role}: ${acceptedCount} of ${requiredCount} slots filled`}
                                  aria-valuenow={acceptedCount}
                                  aria-valuemin={0}
                                  aria-valuemax={requiredCount}
                                >
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
                                      isFilled ? 'bg-purple-light/70' : 'bg-purple'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span>
                                  {acceptedCount}/{requiredCount} filled
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge + Action Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-0 shrink-0">
                        {userApplication ? (
                          appStatus === 'accepted' ? (
                            <>
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                ACCEPTED
                              </span>
                              <button
                                type="button"
                                disabled
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-emerald-500/10 text-emerald-400 text-xs sm:text-sm font-semibold rounded-full border border-emerald-500/20 cursor-default flex items-center justify-center"
                              >
                                On Team
                              </button>
                            </>
                          ) : appStatus === 'rejected' ? (
                            <>
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/[0.05] text-white/40 border border-white/10">
                                CLOSED
                              </span>
                              <button
                                type="button"
                                disabled
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-white/[0.04] text-white/30 text-xs sm:text-sm font-semibold rounded-full border border-white/[0.06] cursor-not-allowed flex items-center justify-center"
                              >
                                Not Selected
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-purple/10 text-purple-light border border-purple/30">
                                APPLIED
                              </span>
                              <button
                                type="button"
                                disabled
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-white/[0.04] text-white/40 text-xs sm:text-sm font-medium rounded-full border border-white/[0.08] cursor-default flex items-center justify-center"
                              >
                                Pending
                              </button>
                            </>
                          )
                        ) : applicationsError || !isAvailable ? (
                          <>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/[0.05] text-white/40 border border-white/10">
                              UNAVAILABLE
                            </span>
                            {onRetryApplications ? (
                              <button
                                type="button"
                                onClick={onRetryApplications}
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-purple/20 hover:bg-purple/30 text-purple-light text-xs sm:text-sm font-semibold rounded-full border border-purple/30 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
                              >
                                Retry
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="px-4 sm:px-5 py-1.5 sm:py-2 bg-white/[0.04] text-white/30 text-xs sm:text-sm font-semibold rounded-full border border-white/[0.06] cursor-not-allowed flex items-center justify-center"
                              >
                                Unavailable
                              </button>
                            )}
                          </>
                        ) : !isProjectOpen ? (
                          <>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/[0.05] text-white/40 border border-white/10">
                              {isProjectCompleted ? 'COMPLETED' : 'CLOSED'}
                            </span>
                            <button
                              type="button"
                              disabled
                              className="w-20 sm:w-[88px] py-1.5 sm:py-2 bg-white/[0.04] text-white/30 text-xs sm:text-sm font-semibold rounded-full border border-white/[0.06] cursor-not-allowed flex items-center justify-center"
                            >
                              {isProjectCompleted ? 'Completed' : 'Closed'}
                            </button>
                          </>
                        ) : isFilled ? (
                          <>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-white/[0.05] text-white/40 border border-white/10">
                              FILLED
                            </span>
                            <button
                              type="button"
                              disabled
                              className="w-20 sm:w-[88px] py-1.5 sm:py-2 bg-white/[0.04] text-white/30 text-xs sm:text-sm font-semibold rounded-full border border-white/[0.06] cursor-not-allowed flex items-center justify-center"
                            >
                              Filled
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#14251B] text-[#1A713A] border border-[#1A713A]/30">
                              OPEN
                            </span>
                            <button
                              type="button"
                              onClick={() => onApplyRole(role)}
                              className="w-20 sm:w-[88px] py-1.5 sm:py-2 bg-purple hover:bg-purple-dark text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 hover:shadow-[0_0_16px_rgba(124,58,237,0.35)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple flex items-center justify-center"
                            >
                              Apply
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 sm:p-10 text-center">
                <p className="text-white/50 text-sm">No roles are currently open for this project.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          5. TEAM & CREDITS (Editorial Production Roster)
          ════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl font-normal tracking-wide text-white">
            Team & Credits
          </h2>
          <span className="text-xs text-white/50 font-medium">
            {applicationsError ? (
              'Team roster unavailable'
            ) : (
              `${(project?.creator ? 1 : 0) + teamMembers.length} ${(project?.creator ? 1 : 0) + teamMembers.length === 1 ? 'collaborator' : 'collaborators'} announced`
            )}
          </span>
        </div>
        <div className="h-px bg-white/[0.08] mb-8" />

        {applicationsError ? (
          <div className="p-8 text-center bg-[#111116]/50 border border-white/[0.06] rounded-2xl max-w-md mx-auto">
            <p className="text-white/50 text-sm font-medium mb-2">Unable to load confirmed team members.</p>
            {onRetryApplications && (
              <button
                type="button"
                onClick={onRetryApplications}
                className="text-xs text-purple-light hover:text-white font-semibold underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
              >
                Retry
              </button>
            )}
          </div>
        ) : (project?.creator || teamMembers.length > 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Creator / Director Card */}
            {project?.creator && (
              <div
                key="creator"
                className="p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl transition-all duration-200 flex flex-col items-center text-center gap-3 group"
              >
                {creatorId ? (
                  <Link to={`/profile/${creatorId}`} className="block group/avatar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple rounded-full">
                    <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 group-hover/avatar:border-purple flex items-center justify-center overflow-hidden transition-colors">
                      {project.creator.avatar ? (
                        <img src={project.creator.avatar} alt={project.creator.name} decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-purple">{(project.creator.name || 'C').charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden">
                    {project.creator.avatar ? (
                      <img src={project.creator.avatar} alt={project.creator.name} decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-purple">{(project.creator.name || 'C').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                )}

                <div className="min-w-0 w-full">
                  {creatorId ? (
                    <Link
                      to={`/profile/${creatorId}`}
                      className="text-sm font-semibold text-white hover:text-purple-light transition-colors truncate block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
                    >
                      {project.creator.name || 'Creator'}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-white truncate">{project.creator.name || 'Creator'}</p>
                  )}
                  <p className="text-xs text-purple-light font-medium mt-0.5">{project.creator.role || 'Creator'}</p>
                  {project.creator.location && (
                    <p className="text-[11px] text-white/50 mt-1">{project.creator.location}</p>
                  )}
                </div>
              </div>
            )}
            {teamMembers.map((member) => {
              const profileId = member.applicant_id || member.applicant?.id || null
              const profileUrl = profileId ? `/profile/${profileId}` : null

              return (
                <div
                  key={member.id}
                  className="p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl transition-all duration-200 flex flex-col items-center text-center gap-3 group"
                >
                  {profileUrl ? (
                    <Link to={profileUrl} className="block group/avatar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple rounded-full">
                      <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 group-hover/avatar:border-purple flex items-center justify-center overflow-hidden transition-colors">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} decoding="async" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 w-full">
                    {profileUrl ? (
                      <Link
                        to={profileUrl}
                        className="text-sm font-semibold text-white hover:text-purple-light transition-colors truncate block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple rounded"
                      >
                        {member.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                    )}
                    <p className="text-xs text-purple-light font-medium mt-0.5">{member.role}</p>
                    {member.location && (
                      <p className="text-[11px] text-white/50 mt-1">{member.location}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#111116]/50 border border-white/[0.06] rounded-2xl max-w-md mx-auto">
            <p className="text-white/50 text-sm font-medium mb-1">Team forming</p>
            <p className="text-white/50 text-xs">No collaborators have been announced yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
