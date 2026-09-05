import { useState, useEffect, useRef, useMemo } from 'react'
import { FILM_ROLE_CATEGORIES, filterRolesCatalog } from '../../data/filmRoles'

/**
 * Searchable Role Picker Modal
 *
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onClose - Closes modal
 * @param {function} onSelectRole - Callback when a canonical role is chosen: (roleName: string) => void
 * @param {Array<string>} selectedRoleNames - Array of already selected canonical role names (to prevent duplicates)
 */
export default function RolePickerModal({
  isOpen,
  onClose,
  onSelectRole,
  selectedRoleNames = [],
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)
  const modalRef = useRef(null)

  // Normalize selected role names for fast, case-insensitive duplicate checking
  const selectedSet = useMemo(() => {
    return new Set((selectedRoleNames || []).map((name) => (typeof name === 'string' ? name.trim().toLowerCase() : '')))
  }, [selectedRoleNames])

  // Filter catalog based on search query
  const filteredCategories = useMemo(() => {
    return filterRolesCatalog(FILM_ROLE_CATEGORIES, searchQuery)
  }, [searchQuery])

  // Reset search and handle focus/scroll-lock when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      // Prevent background page scrolling while modal is open
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      // Focus search input after modal renders
      const timer = setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)

      return () => {
        document.body.style.overflow = originalOverflow
        clearTimeout(timer)
      }
    }
  }, [isOpen])

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRoleClick = (roleName) => {
    if (selectedSet.has(roleName.toLowerCase())) return
    onSelectRole(roleName)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-picker-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[720px] max-h-[88vh] sm:max-h-[82vh] bg-[#111118] border border-white/10 rounded-2xl sm:rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden transition-all duration-300"
        style={{
          boxShadow: '0 24px 70px rgba(0,0,0,0.9), 0 0 40px rgba(98,57,191,0.08)',
        }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-white/[0.08] bg-[#111118] shrink-0">
          <div>
            <h3
              id="role-picker-title"
              className="font-['Fraunces',_serif] text-xl sm:text-2xl font-semibold text-white tracking-[-0.01em]"
            >
              Add a Role
            </h3>
            <p className="text-white/40 text-xs sm:text-sm mt-1">
              Choose the roles needed for your project.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all duration-200 border border-white/5"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sticky Search Input Bar */}
        <div className="p-4 sm:px-6 border-b border-white/[0.06] bg-[#111118]/95 backdrop-blur-md shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles by name, acronym (e.g. DP, 1st AD, VFX), or department..."
              className="w-full pl-10 pr-10 py-3 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:border-purple focus:ring-1 focus:ring-purple/30 focus:shadow-[0_0_15px_rgba(98,57,191,0.15)]"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  searchInputRef.current?.focus()
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/30 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Role List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((dept) => (
              <div key={dept.category} className="space-y-2">
                {/* Department Heading (NOT selectable) */}
                <div className="flex items-center justify-between px-1 py-1 text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                  <span>{dept.category}</span>
                  <span className="text-[10px] text-white/25 font-normal">
                    {dept.roles.length} {dept.roles.length === 1 ? 'role' : 'roles'}
                  </span>
                </div>

                {/* Role Items Grid / Rows */}
                <div className="space-y-1.5">
                  {dept.roles.map((role) => {
                    const isSelected = selectedSet.has(role.name.toLowerCase())

                    return (
                      <button
                        key={role.name}
                        type="button"
                        disabled={isSelected}
                        onClick={() => handleRoleClick(role.name)}
                        className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-all duration-200 border ${
                          isSelected
                            ? 'bg-white/[0.02] border-white/[0.04] opacity-50 cursor-not-allowed'
                            : 'bg-white/[0.03] border-white/[0.06] hover:bg-purple/10 hover:border-purple/35 hover:translate-x-0.5 cursor-pointer text-white/80 hover:text-white'
                        }`}
                      >
                        <span className="text-sm font-medium leading-snug">
                          {role.name}
                        </span>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-purple-light bg-purple/15 border border-purple/30 rounded-full shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Added
                          </span>
                        ) : (
                          <span className="text-xs text-white/30 group-hover:text-purple-light shrink-0">
                            + Add
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-white/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white/60">No roles found</p>
              <p className="text-xs text-white/30 mt-1 max-w-xs mx-auto">
                Try searching by a department, common abbreviation, or alternate title.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:px-6 border-t border-white/[0.06] bg-[#111118] shrink-0 flex items-center justify-between text-xs text-white/30">
          <span>{selectedRoleNames.length} role{selectedRoleNames.length !== 1 ? 's' : ''} currently added</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
