import { Link } from 'react-router-dom'
import { STATUS_COLORS } from './projectRoleUtils'

export default function CreatorProjectCard({ project }) {
  const {
    id,
    title,
    genre,
    location,
    status: rawStatus = 'Open',
    thumbnail,
    poster_url,
    totalRequired = 0,
    totalFilled = 0,
    pendingApplications = 0,
    teamMembers = 0,
  } = project

  // Normalize status safely to match canonical project statuses
  const sUpper = String(rawStatus || '').toUpperCase()
  const status = sUpper === 'OPEN' || sUpper === 'OPEN FOR COLLABORATION'
    ? 'Open'
    : sUpper === 'IN_PRODUCTION' || sUpper === 'IN PRODUCTION'
      ? 'In Production'
      : sUpper === 'COMPLETED'
        ? 'Completed'
        : sUpper === 'CLOSED'
          ? 'Closed'
          : rawStatus

  // Calculate percentage safely
  const percentage = totalRequired > 0
    ? Math.min(100, Math.max(0, Math.round((totalFilled / totalRequired) * 100)))
    : 0

  const isFullyStaffed = totalRequired > 0 && totalFilled >= totalRequired

  // Build metadata string without orphaned bullets
  const metaParts = []
  if (genre) metaParts.push(genre)
  if (location && location !== 'Remote') metaParts.push(location)

  return (
    <div className="bg-[#111111] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-5 group shadow-lg hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]">
      {/* 2:3 Aspect Portrait Poster */}
      <div className="w-24 sm:w-32 md:w-36 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-[#1A1A22] relative group/poster self-start">
        <img
          src={thumbnail || poster_url || '/images/hero-bg.png'}
          alt={`${title} poster`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover/poster:scale-105"
          onError={(e) => {
            if (e.target.src !== window.location.origin + '/images/hero-bg.png' && !e.target.src.endsWith('/images/hero-bg.png')) {
              e.target.src = '/images/hero-bg.png'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      </div>

      {/* Details and Operational Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Top Row: Title, Status, and Attention Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-['Bebas_Neue',_sans-serif] text-xl sm:text-2xl font-normal text-white tracking-wide break-words group-hover:text-purple-light transition-colors leading-tight">
                <Link
                  to={`/project/${id}`}
                  className="hover:text-purple-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded"
                >
                  {title}
                </Link>
              </h3>
              {metaParts.length > 0 && (
                <p className="text-xs text-white/50 mt-1 font-medium">
                  {metaParts.join(' • ')}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[status] || 'border-white/20 text-white/60 bg-white/5'}`}>
                {status}
              </span>
              {pendingApplications > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold text-purple-light bg-purple/15 border border-purple/30 rounded-full flex items-center gap-1 animate-pulse motion-reduce:animate-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple" aria-hidden="true" />
                  Needs Review
                </span>
              )}
            </div>
          </div>

          {/* Staffing Progress */}
          <div className="mt-3.5 mb-3">
            <div className="flex items-baseline justify-between text-xs text-white/60 mb-1.5">
              <span className="font-medium text-white/80">
                {totalRequired > 0 ? (
                  <>
                    <span className="text-white font-semibold">{totalFilled}</span> / {totalRequired}{' '}
                    <span className="text-white/50 font-normal">positions filled</span>
                  </>
                ) : (
                  <span className="text-white/50 italic">No roles added yet</span>
                )}
              </span>
              {totalRequired > 0 && (
                <span className="text-[11px] text-white/50 font-medium">
                  {isFullyStaffed ? 'Fully staffed' : `${percentage}%`}
                </span>
              )}
            </div>

            {totalRequired > 0 ? (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                aria-label={`Team staffing: ${totalFilled} of ${totalRequired} positions filled (${percentage}%)`}
                className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFullyStaffed ? 'bg-purple-light/70' : 'bg-purple'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            ) : null}
          </div>

          {/* Secondary Management Indicators */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs pt-2 text-white/50">
            {pendingApplications > 0 ? (
              <span className="font-medium text-purple-light flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pendingApplications} {pendingApplications === 1 ? 'application needs review' : 'applications need review'}
              </span>
            ) : (
              <span className="text-white/50">No pending applications</span>
            )}

            <span className="text-white/20 select-none" aria-hidden="true">•</span>

            <span>
              {teamMembers > 0
                ? `${teamMembers} ${teamMembers === 1 ? 'team member' : 'team members'}`
                : 'No team members yet'}
            </span>
          </div>
        </div>

        {/* Action Row: Primary CTA + Edit Action */}
        <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
          <Link
            to={`/project/${id}?edit=true`}
            id={`edit-project-${id}-btn`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 hover:border-purple/40 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <span>Edit</span>
          </Link>

          {pendingApplications > 0 ? (
            <Link
              to={`/project/${id}?tab=applications`}
              id={`review-applicants-${id}-btn`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <span>Review Applicants ({pendingApplications})</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <Link
              to={`/project/${id}`}
              id={`manage-project-${id}-btn`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_18px_rgba(98,57,191,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <span>Manage Project</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
