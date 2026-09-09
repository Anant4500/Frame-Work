import { useState, useMemo } from 'react'

export default function ChatMembersSidebar({
  members = [],
  isOpen = true,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members
    const q = searchQuery.toLowerCase()
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        (Array.isArray(m.roles) && m.roles.some((r) => r.toLowerCase().includes(q))) ||
        (typeof m.role === 'string' && m.role.toLowerCase().includes(q))
    )
  }, [members, searchQuery])

  const creators = useMemo(
    () => filteredMembers.filter((m) => m.is_creator || m.isCreator),
    [filteredMembers]
  )
  const collaborators = useMemo(
    () => filteredMembers.filter((m) => !m.is_creator && !m.isCreator),
    [filteredMembers]
  )

  if (!isOpen) return null

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 right-0 bottom-0 z-50 lg:z-auto w-72 sm:w-80 shrink-0 bg-[#0E0E12] border-l border-white/[0.08] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="font-['Bebas_Neue',_sans-serif] text-xl font-normal text-white tracking-wide">
              Production Crew
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold text-purple-light bg-purple/15 rounded-full border border-purple/30">
              {members.length}
            </span>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close members sidebar"
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <svg
              className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter crew..."
              className="w-full bg-[#15151C] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6239BF] transition-colors"
            />
          </div>
        </div>

        {/* Member Lists (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Creator Section */}
          {creators.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 mb-2 text-[10px] font-bold tracking-wider text-purple-light uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                <span>Project Owner</span>
              </div>

              <div className="space-y-1">
                {creators.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-purple/5 border border-purple/20 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#6239BF]/25 border border-[#6239BF]/40 flex items-center justify-center overflow-hidden text-xs font-bold text-purple-light shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.name?.charAt(0)?.toUpperCase() || 'C'}</span>
                      )}
                    </div>

                    {/* Name + Role */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-white truncate">
                          {member.name}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-light bg-[#6239BF]/30 border border-[#6239BF]/40 px-1 rounded">
                          Owner
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate">
                        {(Array.isArray(member.roles) && member.roles.join(', ')) || member.role || 'Creator'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collaborators Section */}
          <div>
            <div className="flex items-center gap-1.5 px-2 mb-2 text-[10px] font-bold tracking-wider text-white/40 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
              <span>Accepted Collaborators ({collaborators.length})</span>
            </div>

            <div className="space-y-1">
              {collaborators.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-default"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center overflow-hidden text-xs font-bold text-white/60 shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{member.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>

                  {/* Name + Role */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/85 truncate group-hover:text-white transition-colors">
                      {member.name}
                    </p>
                    <p className="text-[11px] text-white/40 truncate">
                      {(Array.isArray(member.roles) && member.roles.join(', ')) || member.role || 'Collaborator'}
                    </p>
                  </div>
                </div>
              ))}

              {collaborators.length === 0 && (
                <p className="text-xs text-white/30 px-2 py-1 italic">
                  {members.length > 0 ? 'No matching collaborators' : 'No collaborators joined yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
