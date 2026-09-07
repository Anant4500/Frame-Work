import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function CollaboratorApplicationCard({ application }) {
  const [isMessageExpanded, setIsMessageExpanded] = useState(false)

  const isAccepted = application.status === 'Accepted'

  // Application status badge configuration
  const statusBadgeConfig = {
    Accepted: {
      label: 'Accepted',
      badgeClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/15',
      icon: (
        <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
    },
    Pending: {
      label: 'Pending',
      badgeClass: 'border-amber-400/25 text-amber-300 bg-amber-400/10',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />,
    },
    Rejected: {
      label: 'Not Selected',
      badgeClass: 'border-rose-500/20 text-rose-300/90 bg-rose-500/10',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" aria-hidden="true" />,
    },
    Withdrawn: {
      label: 'Withdrawn',
      badgeClass: 'border-white/10 text-white/50 bg-white/5',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" aria-hidden="true" />,
    },
  }

  const currentBadge = statusBadgeConfig[application.status] || statusBadgeConfig.Pending
  const formattedDate = application.dateApplied
    ? application.dateApplied.startsWith('Applied')
      ? application.dateApplied
      : `Applied ${application.dateApplied}`
    : null

  const pitchDrawerId = `app-pitch-${application.id}`

  return (
    <div
      className={`group bg-[#111118] border rounded-2xl p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between h-full ${
        isAccepted
          ? 'border-emerald-500/25 ring-1 ring-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
          : 'border-white/[0.08] hover:border-white/[0.14] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
      }`}
    >
      <div>
        {/* ── Top Row: Poster (Left) + Project & Role Info (Right) ── */}
        <div className="flex gap-3 items-start">
          {/* Left: Compact Portrait Poster */}
          <div className="w-[72px] sm:w-[78px] shrink-0 aspect-[2/3] rounded-lg overflow-hidden border border-white/[0.1] bg-black/40 relative shadow-sm">
            <img
              src={application.poster || '/images/hero-bg.png'}
              alt={`${application.title || 'Project'} poster`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/images/hero-bg.png' && !e.currentTarget.src.endsWith('/images/hero-bg.png')) {
                  e.currentTarget.src = '/images/hero-bg.png'
                }
              }}
            />
          </div>

          {/* Right: Title, Creator, and Applied Role */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Project Title */}
            <h3 className="font-['Bebas_Neue',_sans-serif] text-lg sm:text-xl font-normal text-white leading-tight tracking-wide line-clamp-2 group-hover:text-purple-light transition-colors">
              <Link
                to={`/project/${application.projectId}`}
                className="hover:text-purple-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded"
              >
                {application.title || 'Untitled Project'}
              </Link>
            </h3>

            {/* Creator Attribution */}
            <div className="flex items-center gap-1 text-[11px] text-white/50 mt-0.5 min-w-0">
              <span className="text-white/50 shrink-0">Created by</span>
              {application.creatorId ? (
                <Link
                  to={`/profile/${application.creatorId}`}
                  className="text-white/80 hover:text-purple-light transition-colors font-medium truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded"
                >
                  {application.creatorName || 'Creator'}
                </Link>
              ) : (
                <span className="text-white/70 font-medium truncate">{application.creatorName || 'Creator'}</span>
              )}
            </div>

            {/* Applied Role Section */}
            <div className="mt-2">
              <span className="text-[8.5px] font-bold tracking-[0.14em] uppercase text-white/50 block mb-0.5">
                APPLIED ROLE
              </span>
              <p
                className="font-semibold text-white text-[13px] sm:text-[13.5px] leading-snug break-words line-clamp-2"
                title={application.roleApplied}
              >
                {application.roleApplied || 'Collaborator'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Status & Applied Date Row ── */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/[0.06]">
          {/* Application Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold rounded-full border ${currentBadge.badgeClass}`}>
            {currentBadge.icon}
            <span>{currentBadge.label}</span>
          </span>

          {/* Applied Date */}
          {formattedDate && (
            <span className="text-[10.5px] text-white/50 shrink-0">
              {formattedDate}
            </span>
          )}
        </div>
      </div>

      {/* ── Collapsible Submitted Message / Pitch ── */}
      {application.message && (
        <div className="mt-2.5 pt-2 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => setIsMessageExpanded((prev) => !prev)}
            aria-expanded={isMessageExpanded}
            aria-controls={pitchDrawerId}
            className="w-full flex items-center justify-between text-[11px] font-medium text-white/60 hover:text-white py-0.5 transition-colors group/btn rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.502 49.177 49.177 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {isMessageExpanded ? 'Hide submitted pitch' : 'View submitted pitch'}
            </span>
            <svg
              className={`w-3 h-3 text-white/50 group-hover/btn:text-white transition-transform duration-200 ${
                isMessageExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {isMessageExpanded && (
            <div id={pitchDrawerId} className="mt-1.5 p-2.5 bg-black/35 rounded-lg border border-white/[0.05] animate-fade-in">
              <p className="text-[11px] text-white/70 leading-relaxed italic whitespace-pre-line">
                "{application.message}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
