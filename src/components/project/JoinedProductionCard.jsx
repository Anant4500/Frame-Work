import { Link } from 'react-router-dom'

export default function JoinedProductionCard({ production }) {
  const isCompleted = production.isCompleted || (production.rawProjectStatus || '').toUpperCase() === 'COMPLETED'
  const isClosed = !isCompleted && ((production.rawProjectStatus || '').toUpperCase() === 'CLOSED' || production.projectStatus === 'Closed')
  const isInProduction = !isCompleted && !isClosed && (production.projectStatus === 'In Production' || (production.rawProjectStatus || '').toUpperCase() === 'IN_PRODUCTION' || (production.rawProjectStatus || '').toUpperCase() === 'IN PRODUCTION')

  const statusLabel = isCompleted
    ? 'Completed Credit'
    : isInProduction
    ? 'In Production'
    : isClosed
    ? 'Closed Production'
    : 'Open Production'

  const statusStyle = isCompleted
    ? { badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-400' }
    : isInProduction
    ? { badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10', dot: 'bg-amber-400' }
    : isClosed
    ? { badge: 'border-white/20 text-white/70 bg-white/5', dot: 'bg-white/40' }
    : { badge: 'border-purple/30 text-purple-light bg-purple/10', dot: 'bg-purple' }

  return (
    <div className="group bg-[#111111] border border-white/[0.08] hover:border-purple/30 rounded-2xl p-4 sm:p-4.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 flex flex-col justify-between h-full">
      {/* ── Upper Content Area ── */}
      <div>
        {/* ── Top Section: Poster (Left) + Role & Status (Right) ── */}
        <div className="flex gap-3 sm:gap-3.5 items-start">
          {/* Left: Compact Portrait Poster */}
          <div className="w-[88px] sm:w-[98px] shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.1] bg-black/40 relative shadow-md">
            <img
              src={production.poster || '/images/hero-bg.png'}
              alt={`${production.title || 'Production'} poster`}
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

          {/* Right: Status, Genre & Dedicated Green Role Block */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Status Badge + Optional Genre Chip */}
            <div className="flex items-center flex-wrap gap-1.5 mb-2.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-full border ${statusStyle.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} aria-hidden="true" />
                <span className="truncate max-w-[100px]">{statusLabel}</span>
              </span>
              {production.genre && (
                <span className="px-1.5 py-0.5 text-[9.5px] font-medium text-white/50 bg-white/[0.04] border border-white/[0.08] rounded-full truncate max-w-[80px]">
                  {production.genre}
                </span>
              )}
            </div>

            {/* Compact Green Role Block — directly below pills, expands downward */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 sm:px-3.5 py-2.5">
              <div className="flex items-center gap-1 text-[9px] font-bold tracking-[0.14em] uppercase text-emerald-400 mb-1">
                <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>YOUR ROLE</span>
              </div>
              <p
                className="font-semibold text-white text-[13px] sm:text-[14px] leading-snug line-clamp-2 break-words"
                title={production.role}
              >
                {production.role || 'Collaborator'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Full Width Project Title ── */}
        <h3 className="font-['Bebas_Neue',_sans-serif] text-xl sm:text-2xl font-normal text-white leading-tight mt-3 tracking-wide line-clamp-2 group-hover:text-purple-light transition-colors">
          <Link
            to={`/project/${production.projectId}`}
            className="hover:text-purple-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded"
          >
            {production.title || 'Untitled Production'}
          </Link>
        </h3>

        {/* ── Metadata: Creator & Location ── */}
        <div className="mt-2 flex flex-col gap-1 text-[11.5px] text-white/50">
          {/* Creator */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-white/50 shrink-0">Created by</span>
            {production.creatorId ? (
              <Link
                to={`/profile/${production.creatorId}`}
                className="text-white/80 hover:text-purple-light transition-colors font-medium truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded"
              >
                {production.creatorName || 'Creator'}
              </Link>
            ) : (
              <span className="text-white/70 font-medium truncate">{production.creatorName || 'Creator'}</span>
            )}
          </div>

          {/* Location */}
          {production.location && (
            <div className="flex items-center gap-1 text-white/50 min-w-0">
              <svg className="w-3 h-3 text-purple/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="truncate">{production.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="border-t border-white/[0.06] mt-3.5 pt-3">
        <Link
          to={`/project/${production.projectId}`}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-white/80 bg-white/[0.04] border border-white/[0.08] hover:border-[#6239BF]/50 hover:bg-[#6239BF]/10 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 group/btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          <span>Open Project</span>
          <span className="transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  )
}
