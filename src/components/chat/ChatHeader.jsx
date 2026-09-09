export default function ChatHeader({
  projectTitle = 'Production Chat',
  members = [],
  isMembersOpen = true,
  onToggleMembers,
  onBack,
}) {
  return (
    <header className="h-16 shrink-0 bg-[#0C0C10] border-b border-white/[0.08] px-3 sm:px-5 flex items-center justify-between gap-3 select-none z-30">
      {/* ── Left Group: Back Button + Project Title + Member Cluster ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to project or dashboard"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-all duration-200 flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
        >
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <div className="min-w-0 flex items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-['Bebas_Neue',_sans-serif] text-xl sm:text-2xl font-normal text-white tracking-wide truncate leading-none">
              {projectTitle}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-purple-light/80 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-purple" aria-hidden="true" />
              <span>Team Production Room</span>
            </div>
          </div>

          {/* Member Avatars Cluster */}
          {members.length > 0 && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-white/[0.1] shrink-0">
              <div className="flex -space-x-2 overflow-hidden">
                {members.slice(0, 3).map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-[#0C0C10] bg-[#6239BF]/30 text-[10px] font-bold text-purple-light overflow-hidden"
                    title={`${m.name} (${(m.roles || []).join(', ') || (m.is_creator ? 'Creator' : 'Collaborator')})`}
                  >
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{m.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                ))}
              </div>
              <span className="text-xs text-white/50 font-medium whitespace-nowrap">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Group: Real Member Badge + Member Toggle ── */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Real Crew Member Count Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple/15 border border-purple/30 text-purple-light text-xs font-semibold">
          <svg className="w-3.5 h-3.5 text-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="whitespace-nowrap">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
        </div>

        {/* Member Sidebar Toggle */}
        <button
          type="button"
          onClick={onToggleMembers}
          aria-label={isMembersOpen ? 'Hide members sidebar' : 'Show members sidebar'}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] ${
            isMembersOpen
              ? 'bg-[#6239BF]/20 text-purple-light border-[#6239BF]/40 hover:bg-[#6239BF]/30'
              : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span className="hidden sm:inline">
            {isMembersOpen ? 'Hide members' : 'Show members'}
          </span>
        </button>
      </div>
    </header>
  )
}
