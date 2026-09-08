import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import InteractiveHoverButton from '../components/ui/InteractiveHoverButton'
import {
  FILM_ROLE_CATEGORIES,
  getRoleCategory,
  canonicalizeRole,
  getRoleAliases,
} from '../data/filmRoles'
import { formatProjectStatus } from '../components/project/projectRoleUtils'
import { DEFAULT_LOCATION_SUGGESTIONS } from '../utils/projectDetailsFormatters'

const genres = ['Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Action', 'Horror', 'Romance', 'Mystery', 'Documentary']
const statuses = ['Open', 'In Production', 'Completed', 'Closed']

function ExploreProjects() {
  usePageTitle('Explore Projects | FrameWork')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [openSections, setOpenSections] = useState({
    location: false,
    genre: false,
    roles: false,
    status: false,
  })
  const [visibleCount, setVisibleCount] = useState(6)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [roleSearch, setRoleSearch] = useState('')

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }))
  }

  const triggerRef = useRef(null)
  const drawerRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Body scroll lock when mobile filter drawer is open
  useEffect(() => {
    if (!mobileFiltersOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [mobileFiltersOpen])

  // Focus management & focus trap for mobile filter modal
  useEffect(() => {
    if (!mobileFiltersOpen) return

    // Save triggering element to restore focus when closed
    triggerRef.current = document.activeElement

    // Move initial focus to the Close button inside the modal
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 0)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileFiltersOpen(false)
        return
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const focusable = Array.from(focusableElements).filter(
          (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
        )

        if (focusable.length === 0) {
          e.preventDefault()
          return
        }

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !drawerRef.current.contains(document.activeElement)) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      if (triggerRef.current && typeof triggerRef.current.focus === 'function' && document.body.contains(triggerRef.current)) {
        triggerRef.current.focus()
      }
    }
  }, [mobileFiltersOpen])

  // Reset visibleCount whenever discovery filters/search materially change
  useEffect(() => {
    setVisibleCount(6)
  }, [search, selectedLocations, selectedGenres, selectedRoles, selectedStatuses])

  // Targeted data fetch with safe error state & retry capability
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id, title, logline, genre, location, poster_url, status, created_at, creator:profiles(name, profile_photo_url), roles:project_roles(role)')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const mapped = (data || []).map((p) => ({
        id: p.id,
        title: p.title || 'Untitled Project',
        logline: p.logline || '',
        genre: p.genre || 'Drama',
        location: p.location || 'Remote',
        poster_url: p.poster_url || '/images/hero-bg.png',
        rawStatus: p.status,
        status: formatProjectStatus(p.status),
        created_at: p.created_at,
        creator: p.creator ? {
          name: p.creator.name,
          avatar: p.creator.profile_photo_url,
        } : null,
        roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role).filter(Boolean) : [],
      }))
      setProjects(mapped)
    } catch (err) {
      console.error('Error fetching explore projects:', err)
      setError('Unable to load projects right now.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const toggleFilter = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const handleStatusChange = (statusVal) => {
    if (statusVal === 'All' || statusVal === 'ALL') {
      setSelectedStatuses([])
      return
    }
    setSelectedStatuses((prev) => {
      if (prev.includes(statusVal)) {
        return prev.filter((s) => s !== statusVal)
      } else {
        return [...prev, statusVal]
      }
    })
  }

  const clearFilters = () => {
    setSelectedLocations([])
    setSelectedGenres([])
    setSelectedRoles([])
    setSelectedStatuses([])
    setSearch('')
  }

  const activeFilterCount =
    selectedLocations.length +
    selectedGenres.length +
    selectedRoles.length +
    selectedStatuses.length

  // Dynamically derive available location options from actual project data
  const availableLocations = useMemo(() => {
    const locSet = new Set()
    for (const p of projects) {
      if (p.location && typeof p.location === 'string') {
        const trimmed = p.location.trim()
        if (trimmed) {
          if (trimmed.includes(',')) {
            trimmed.split(',').forEach((part) => {
              const clean = part.trim()
              if (clean) locSet.add(clean)
            })
          } else {
            locSet.add(trimmed)
          }
        }
      }
    }
    if (locSet.size === 0) {
      return DEFAULT_LOCATION_SUGGESTIONS
    }
    return Array.from(locSet).sort((a, b) => a.localeCompare(b))
  }, [projects])

  // Dynamically derive available role options from roles actually present on fetched OPEN projects
  const availableRoles = useMemo(() => {
    const roleSet = new Set()
    for (const p of projects) {
      if (Array.isArray(p.roles)) {
        for (const rawRole of p.roles) {
          const canonical = canonicalizeRole(rawRole)
          if (canonical) {
            roleSet.add(canonical)
          }
        }
      }
    }
    return Array.from(roleSet)
  }, [projects])

  // Group available roles by canonical department categories (with "Other Roles" fallback)
  const groupedAvailableRoles = useMemo(() => {
    const categoryMap = new Map()
    for (const dept of FILM_ROLE_CATEGORIES) {
      categoryMap.set(dept.category, [])
    }
    categoryMap.set('Other Roles', [])

    for (const role of availableRoles) {
      const cat = getRoleCategory(role) || 'Other Roles'
      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, [])
      }
      categoryMap.get(cat).push(role)
    }

    const result = []
    for (const [category, rList] of categoryMap.entries()) {
      if (rList.length > 0) {
        result.push({
          category,
          roles: rList.sort((a, b) => a.localeCompare(b)),
        })
      }
    }
    return result
  }, [availableRoles])

  // Filter available grouped roles by role-search input within the sidebar filter
  const displayedGroupedRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase()
    if (!q) return groupedAvailableRoles

    return groupedAvailableRoles
      .map((group) => ({
        category: group.category,
        roles: group.roles.filter((roleName) => {
          if (roleName.toLowerCase().includes(q)) return true
          const aliases = getRoleAliases(roleName)
          return aliases.some((a) => a.toLowerCase().includes(q))
        }),
      }))
      .filter((group) => group.roles.length > 0)
  }, [groupedAvailableRoles, roleSearch])

  // Combined client-side filtering logic
  const filtered = useMemo(() => {
    let result = [...projects]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.logline && p.logline.toLowerCase().includes(q)) ||
          (p.genre && p.genre.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.roles && p.roles.some((r) => r.toLowerCase().includes(q)))
      )
    }

    if (selectedLocations.length > 0) {
      result = result.filter((p) => {
        if (!p.location) return false
        const locLower = p.location.toLowerCase()
        return selectedLocations.some((sel) => {
          const s = sel.toLowerCase().trim()
          if (!s) return false
          if (locLower === s) return true
          const parts = p.location.split(/[,/]+/).map((part) => part.trim().toLowerCase())
          if (parts.includes(s)) return true
          return locLower.includes(s)
        })
      })
    }
    if (selectedGenres.length > 0) {
      result = result.filter((p) => p.genre && selectedGenres.includes(p.genre))
    }
    if (selectedRoles.length > 0) {
      result = result.filter(
        (p) =>
          Array.isArray(p.roles) &&
          p.roles.some((r) => {
            const canon = canonicalizeRole(r)
            return selectedRoles.includes(canon) || selectedRoles.includes(r)
          })
      )
    }
    if (selectedStatuses.length > 0) {
      result = result.filter((p) => {
        const displayStatus = p.status || formatProjectStatus(p.rawStatus)
        return selectedStatuses.includes(displayStatus)
      })
    }

    // Default newest first
    result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

    return result
  }, [search, selectedLocations, selectedGenres, selectedRoles, selectedStatuses, projects])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="font-['Bebas_Neue',_sans-serif] text-5xl sm:text-6xl font-normal tracking-wide leading-none mb-3">
              Explore <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl">
              Discover film projects looking for talented collaborators like you.
            </p>
          </div>
          {user && user.role === 'creator' && (
            <Link
              to="/create-project"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Project
            </Link>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          ref={triggerRef}
          id="mobile-filter-toggle"
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="mobile-filter-drawer"
          aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
          className="lg:hidden flex items-center gap-2 px-5 py-3 mb-6 glass-card rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-purple text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex gap-8">
          {/* ─── Filters Sidebar ─── */}
          <aside
            ref={drawerRef}
            id="mobile-filter-drawer"
            role={mobileFiltersOpen ? 'dialog' : undefined}
            aria-modal={mobileFiltersOpen ? 'true' : undefined}
            aria-labelledby="filter-sidebar-title"
            className={`
              ${mobileFiltersOpen ? 'fixed inset-0 z-40 bg-black/95 backdrop-blur-xl p-6 pt-20 overflow-y-auto flex flex-col justify-between' : 'hidden'}
              lg:block lg:sticky lg:top-[88px] lg:self-start lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:pt-0
              w-full lg:w-[264px] lg:min-w-[264px] shrink-0
            `}
          >
            {/* Mobile close button */}
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close filters"
              className="lg:hidden absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="bg-[#111111] border border-white/[0.07] rounded-[18px] overflow-hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pt-[19px] px-[22px] pb-[17px] border-b border-white/[0.07]">
                <div className="flex items-center gap-[9px]">
                  <svg className="w-[15px] h-[15px] shrink-0" fill="none" stroke="#8B5CF6" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <h2 id="filter-sidebar-title" className="font-['DM_Sans',_sans-serif] text-[14.5px] font-[700] tracking-[0.2px] text-white">
                    Filters
                  </h2>
                </div>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#8B5CF6] text-[11px] font-bold text-white flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>

              {/* 1. Location Filter */}
              <FilterAccordionSection
                id="location"
                title="Location"
                isOpen={openSections.location}
                onToggle={() => toggleSection('location')}
                hasBorderBottom={true}
              >
                {availableLocations.map((loc) => (
                  <FilterCheckboxOption
                    key={loc}
                    id={`filter-location-${loc.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    label={loc}
                    checked={selectedLocations.includes(loc)}
                    onChange={() => toggleFilter(loc, selectedLocations, setSelectedLocations)}
                  />
                ))}
              </FilterAccordionSection>

              {/* 2. Genre Filter */}
              <FilterAccordionSection
                id="genre"
                title="Genre"
                isOpen={openSections.genre}
                onToggle={() => toggleSection('genre')}
                hasBorderBottom={true}
              >
                {genres.map((g) => (
                  <FilterCheckboxOption
                    key={g}
                    id={`filter-genre-${g.toLowerCase().replace(/\s+/g, '-')}`}
                    label={g}
                    checked={selectedGenres.includes(g)}
                    onChange={() => toggleFilter(g, selectedGenres, setSelectedGenres)}
                  />
                ))}
              </FilterAccordionSection>

              {/* 3. Roles Needed Filter (Grouped + Searchable) */}
              <FilterAccordionSection
                id="roles"
                title="Roles Needed"
                isOpen={openSections.roles}
                onToggle={() => toggleSection('roles')}
                hasBorderBottom={true}
              >
                {/* Role search input within filter */}
                <div className="relative mb-2">
                  <label htmlFor="role-filter-search" className="sr-only">Search available roles</label>
                  <input
                    id="role-filter-search"
                    type="text"
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    placeholder="Filter roles..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg text-[13px] text-white placeholder-white/30 outline-none focus:border-[#8B5CF6]/50 transition-all font-['DM_Sans',_sans-serif]"
                  />
                  <svg className="w-3.5 h-3.5 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {roleSearch && (
                    <button
                      type="button"
                      aria-label="Clear role filter search"
                      onClick={() => setRoleSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Roles list */}
                {availableRoles.length === 0 ? (
                  <p className="text-[12px] text-white/30 italic py-1">No open roles found</p>
                ) : displayedGroupedRoles.length === 0 ? (
                  <p className="text-[12px] text-white/30 italic py-1">No roles match &quot;{roleSearch}&quot;</p>
                ) : (
                  displayedGroupedRoles.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-light/75 px-0.5 pt-1.5 pb-0.5">
                        {group.category}
                      </p>
                      <div className="flex flex-col gap-[3px]">
                        {group.roles.map((role) => (
                          <FilterCheckboxOption
                            key={role}
                            id={`filter-role-${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                            label={role}
                            checked={selectedRoles.includes(role)}
                            onChange={() => toggleFilter(role, selectedRoles, setSelectedRoles)}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </FilterAccordionSection>

              {/* 4. Status Filter */}
              <FilterAccordionSection
                id="status"
                title="Status"
                isOpen={openSections.status}
                onToggle={() => toggleSection('status')}
                hasBorderBottom={false}
              >
                <FilterCheckboxOption
                  key="All"
                  id="filter-status-all"
                  label="All"
                  checked={selectedStatuses.length === 0}
                  onChange={() => handleStatusChange('All')}
                />
                {statuses.map((st) => (
                  <FilterCheckboxOption
                    key={st}
                    id={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                    label={st}
                    checked={selectedStatuses.includes(st)}
                    onChange={() => handleStatusChange(st)}
                  />
                ))}
              </FilterAccordionSection>

              {/* Footer / Clear All Filters Button */}
              <div className="border-t border-white/[0.07] pt-[14px] px-[22px] pb-[18px]">
                <button
                  type="button"
                  id="clear-all-filters-btn"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0 && !search}
                  className={`w-full p-[9px] rounded-[50px] border font-['DM_Sans',_sans-serif] text-[12.5px] font-[500] text-center transition-all duration-200 cursor-pointer ${
                    activeFilterCount > 0 || search
                      ? 'border-white/[0.11] bg-transparent text-[#999999] hover:text-white hover:border-[#8B5CF6]/35 active:scale-[0.99]'
                      : 'border-white/[0.07] bg-transparent text-[#999999]/40 cursor-not-allowed'
                  }`}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Mobile Bottom Sticky Action */}
            {mobileFiltersOpen && (
              <div className="lg:hidden sticky bottom-0 left-0 right-0 pt-4 pb-2 bg-gradient-to-t from-black via-black/95 to-transparent mt-6">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3.5 px-6 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] active:scale-98"
                >
                  View {filtered.length} {filtered.length === 1 ? 'Project' : 'Projects'}
                </button>
              </div>
            )}
          </aside>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            {/* Top Bar: Full-width Search */}
            <div className="mb-8">
              <div className="relative w-full">
                <label htmlFor="search-input" className="sr-only">
                  Search projects
                </label>
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, role, genre, or location..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(98,57,191,0.1)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[...selectedLocations, ...selectedGenres, ...selectedRoles, ...selectedStatuses].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple/10 border border-purple/20 text-purple-light rounded-full"
                  >
                    {f}
                    <button
                      type="button"
                      aria-label={`Remove ${f} filter`}
                      onClick={() => {
                        if (selectedLocations.includes(f)) toggleFilter(f, selectedLocations, setSelectedLocations)
                        else if (selectedGenres.includes(f)) toggleFilter(f, selectedGenres, setSelectedGenres)
                        else if (selectedRoles.includes(f)) toggleFilter(f, selectedRoles, setSelectedRoles)
                        else toggleFilter(f, selectedStatuses, setSelectedStatuses)
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results Count (only when projects exist and not loading/error) */}
            {!loading && !error && projects.length > 0 && (
              <p className="text-white/50 text-sm mb-6" aria-live="polite">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Project Grid, Skeletons, Error, or Empty State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[20.4px] sm:max-w-[85%]" aria-busy="true" aria-label="Loading projects">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProjectCardSkeleton key={idx} />
                ))}
              </div>
            ) : error ? (
              /* ERROR STATE — Safe visitor-facing error with retry */
              <div className="text-center py-20 glass-card rounded-2xl p-8 max-w-lg mx-auto border border-white/[0.08]" role="alert">
                <div className="w-16 h-16 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Unable to Load Projects</h3>
                <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                  We couldn't retrieve projects right now. Please check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={fetchProjects}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Try Again
                </button>
              </div>
            ) : visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[20.4px] sm:max-w-[85%]">
                {visible.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              /* STATE A — Genuine empty database (0 projects total) */
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white/70 mb-2">No Projects Yet</h3>
                <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">Be the first to bring a film idea to FrameWork.</p>
                <Link
                  to="/create-project"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Start a Project
                </Link>
              </div>
            ) : (
              /* STATE B — Projects exist, but current filters/search return 0 results */
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-white/50 text-lg font-medium mb-2">No projects match your filters.</p>
                <p className="text-white/30 text-sm">Try adjusting your filters or search query.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2 text-sm text-purple hover:text-purple-light transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {!loading && !error && hasMore && (
              <div className="text-center mt-12">
                <button
                  id="load-more-btn"
                  type="button"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="px-8 py-3.5 border border-white/10 rounded-full text-sm font-medium text-white/60 hover:text-white hover:border-purple/40 hover:bg-purple/5 transition-all duration-300 cursor-pointer"
                >
                  Load More Projects
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Filter Accordion Section Component ─── */
function FilterAccordionSection({ id, title, isOpen, onToggle, hasBorderBottom = true, children }) {
  const triggerId = `accordion-trigger-${id}`
  const panelId = `accordion-panel-${id}`

  return (
    <div className={`w-full ${hasBorderBottom ? 'border-b border-white/[0.07]' : ''}`}>
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-[16px] px-[22px] text-left group cursor-pointer bg-transparent border-none"
      >
        <span className="font-['DM_Sans',_sans-serif] font-[600] text-[13.5px] tracking-[0.2px] text-white leading-normal transition-colors">
          {title}
        </span>
        <svg
          className={`w-[14px] h-[14px] shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke={isOpen ? '#8B5CF6' : '#555555'}
          viewBox="0 0 24 24"
          strokeWidth={2.2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className={`overflow-y-auto scrollbar-thin transition-[max-height] duration-300 ease motion-reduce:transition-none ${
          isOpen ? 'max-h-[320px]' : 'max-h-0 hidden'
        }`}
      >
        <div className="pt-0 px-[22px] pb-[16px] flex flex-col gap-[3px]">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Filter Checkbox Option Component ─── */
function FilterCheckboxOption({ id, label, checked, onChange, count }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-[10px] py-[6px] px-[2px] cursor-pointer group select-none"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className={`w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-[#8B5CF6] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#111111] ${
          checked
            ? 'bg-[#8B5CF6] border-[#8B5CF6]'
            : 'bg-transparent border-white/[0.11] group-hover:border-white/30'
        }`}
      >
        {checked && (
          <svg
            className="w-[9px] h-[9px] text-white shrink-0"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 5.2L4.2 7.5L8.2 2.5" />
          </svg>
        )}
      </span>
      <span
        className={`font-['DM_Sans',_sans-serif] font-[400] text-[13px] leading-tight transition-colors duration-150 ${
          checked ? 'text-white' : 'text-[#999999] group-hover:text-white'
        }`}
      >
        {label}
      </span>
      {count !== undefined && count !== null && (
        <span className="ml-auto text-[11px] text-[#555555] font-['DM_Sans',_sans-serif]">
          {count}
        </span>
      )}
    </label>
  )
}

/* ─── Defensive relative date formatter ─── */
function formatRelativeDate(isoString) {
  if (!isoString || typeof isoString !== 'string') return null
  const timestamp = new Date(isoString).getTime()
  if (isNaN(timestamp)) return null

  const diff = Date.now() - timestamp
  if (diff < 0) return 'Just now'

  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  if (mins < 60) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return '1d ago'
  if (days < 7) return `${days}d ago`
  if (weeks === 1) return '1w ago'
  if (weeks < 5) return `${weeks}w ago`

  try {
    return new Date(timestamp).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

/* ─── Project Card Skeleton (Stable height, restrained dark aesthetics) ─── */
function ProjectCardSkeleton() {
  return (
    <div
      className="relative flex flex-col w-full h-[527px] bg-[#0A0A0F] border border-white/[0.08] rounded-[17px] overflow-hidden p-[17px] animate-pulse motion-reduce:animate-none"
      aria-hidden="true"
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-[6.8px] mb-[122.4px] sm:mb-[136px]">
        <div className="h-[17px] w-[54.4px] bg-white/[0.05] rounded-full" />
        <div className="h-[17px] w-[68px] bg-white/[0.05] rounded-full" />
      </div>

      {/* Title */}
      <div className="h-[49.3px] sm:h-[56.1px] flex flex-col justify-end gap-[6.8px] w-full">
        <div className="h-[20.4px] w-3/4 bg-white/[0.07] rounded-[5px]" />
        <div className="h-[17px] w-1/2 bg-white/[0.05] rounded-[5px]" />
      </div>

      {/* Location + date */}
      <div className="flex items-center gap-[6.8px] mt-[6.8px] h-[13.6px]">
        <div className="h-[10.2px] w-[68px] bg-white/[0.04] rounded" />
        <div className="h-[10.2px] w-[40.8px] bg-white/[0.04] rounded" />
      </div>

      {/* Logline */}
      <div className="mt-[8.5px] h-[34px] flex flex-col gap-[5.1px]">
        <div className="h-[11.9px] w-full bg-white/[0.04] rounded" />
        <div className="h-[11.9px] w-4/5 bg-white/[0.04] rounded" />
      </div>

      {/* Roles Needed */}
      <div className="mt-[13.6px] min-h-[40.8px]">
        <div className="h-[8.5px] w-[68px] bg-white/[0.04] rounded mb-[6.8px]" />
        <div className="flex items-center gap-[5.1px]">
          <div className="h-[20.4px] w-[81.6px] bg-white/[0.05] rounded-[5px]" />
          <div className="h-[20.4px] w-[95.2px] bg-white/[0.05] rounded-[5px]" />
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-[6.8px] mt-[13.6px] min-h-[17px]">
        <div className="w-[17px] h-[17px] rounded-full bg-white/[0.06]" />
        <div className="h-[10.2px] w-[81.6px] bg-white/[0.04] rounded" />
      </div>

      {/* Button CTA */}
      <div className="mt-auto pt-[17px]">
        <div className="w-full h-[30.6px] rounded-full bg-white/[0.04] border border-white/5" />
      </div>
    </div>
  )
}

/* ─── Project Card Component (Cinematic 2:3 portrait poster layout) ─── */
function ProjectCard({ project }) {
  const allRoles = Array.isArray(project.roles) ? project.roles : []
  const visibleRoles = allRoles.slice(0, 2)
  const extraRoles = allRoles.length - visibleRoles.length
  const posterSrc = project.poster_url || '/images/hero-bg.png'
  const relDate = formatRelativeDate(project.created_at)
  const creator = project.creator || null

  return (
    <Link
      to={`/project/${project.id}`}
      className="group relative flex flex-col w-full h-full bg-[#0A0A0F] border border-white/[0.08] hover:border-[rgba(98,57,191,0.30)] rounded-[17px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(98,57,191,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
    >
      {/* ── LAYER 1: POSTER IMAGE (Isolated GPU layer with overscan) ── */}
      <div className="absolute top-0 left-0 right-0 w-full h-[340px] sm:h-[357px] overflow-hidden pointer-events-none z-0">
        <img
          src={posterSrc}
          alt={`${project.title || 'Project'} poster`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src !== '/images/hero-bg.png') {
              e.currentTarget.src = '/images/hero-bg.png'
            }
          }}
          className="absolute -inset-px w-[calc(100%+2px)] h-[calc(100%+2px)] object-cover object-top transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        />
      </div>

      {/* ── LAYER 2: DARK OVERLAY & FILM GRAIN ── */}
      <div className="absolute top-0 left-0 right-0 w-full h-[340px] sm:h-[357px] overflow-hidden pointer-events-none z-10">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }}
        />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* ── LAYER 3: STABILIZED GRADIENT FADE (Extends past poster boundary) ── */}
      <div
        className="absolute top-0 left-0 right-0 w-full h-[399.5px] sm:h-[416.5px] overflow-hidden pointer-events-none z-20"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0) 0%, rgba(10,10,15,0.06) 18%, rgba(10,10,15,0.35) 40%, rgba(10,10,15,0.72) 60%, rgba(10,10,15,0.95) 78%, #0A0A0F 88%, #0A0A0F 100%)',
        }}
      />

      {/* ── LAYER 4: CARD CONTENT (Floats seamlessly over poster & gradient) ── */}
      <div className="relative z-30 flex flex-col flex-1 p-[17px]">
        {/* Top Floating Badges: Genre (left) & Status (right) */}
        <div className="flex items-center justify-between gap-[6.8px] mb-[122.4px] sm:mb-[136px]">
          {project.genre ? (
            <span className="px-[8.5px] py-[0.85px] text-[8.5px] font-semibold tracking-widest uppercase text-white/90 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
              {project.genre}
            </span>
          ) : <div />}

          {project.status && (
            <span
              className={`inline-flex items-center gap-[5.1px] px-[8.5px] py-[0.85px] text-[8.5px] font-bold tracking-wider uppercase backdrop-blur-md rounded-full border ${
                project.status === 'Open'
                  ? 'border-purple/35 text-purple-light bg-purple/15'
                  : project.status === 'In Production'
                  ? 'border-amber-400/35 text-amber-400 bg-amber-400/15'
                  : project.status === 'Completed'
                  ? 'border-emerald-400/35 text-emerald-400 bg-emerald-400/15'
                  : 'border-white/20 text-white/60 bg-white/10'
              }`}
            >
              <span
                className={`w-[5.1px] h-[5.1px] rounded-full ${
                  project.status === 'Open'
                    ? 'bg-purple animate-pulse motion-reduce:animate-none'
                    : project.status === 'In Production'
                    ? 'bg-amber-400'
                    : project.status === 'Completed'
                    ? 'bg-emerald-400'
                    : 'bg-white/40'
                }`}
              />
              {project.status}
            </span>
          )}
        </div>

        {/* Title — Fixed 2-line height area, bottom-aligned */}
        <div className="h-[49.3px] sm:h-[56.1px] flex items-end w-full">
          <h3 className="font-['Bebas_Neue',_sans-serif] text-[20.4px] sm:text-[22.1px] font-normal tracking-wide text-white leading-tight line-clamp-2 w-full group-hover:text-purple-light transition-colors duration-300">
            {project.title || 'Untitled Project'}
          </h3>
        </div>

        {/* Location + Posted date */}
        <div className="flex items-center gap-[6.8px] mt-[6.8px] text-[9.35px] text-white/50 font-medium tracking-wide h-[13.6px]">
          {project.location && (
            <>
              <svg className="w-[10.2px] h-[10.2px] shrink-0 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{project.location}</span>
            </>
          )}
          {project.location && relDate && (
            <span className="text-white/30 shrink-0">•</span>
          )}
          {relDate && <span className="shrink-0">{relDate}</span>}
        </div>

        {/* Logline — Fixed 2-line height area */}
        <p className="mt-[8.5px] text-[10.625px] text-white/50 leading-relaxed line-clamp-2 h-[34px]">
          {project.logline || ''}
        </p>

        {/* Roles needed — strictly one row */}
        <div className="mt-[13.6px] min-h-[40.8px]">
          <p className="text-[8.075px] font-semibold tracking-[0.14em] uppercase text-white/50 mb-[6.8px]">Roles Needed</p>
          {allRoles.length > 0 ? (
            <div className="flex items-center gap-[5.1px] overflow-hidden flex-nowrap w-full">
              {visibleRoles.map((role, idx) => (
                <span
                  key={`${role}-${idx}`}
                  title={role}
                  className={`px-[8.5px] py-[2.55px] text-[9.35px] font-medium text-white/65 border border-white/[0.1] rounded-[5px] bg-white/[0.03] transition-all duration-300 group-hover:border-purple/30 group-hover:text-purple-light whitespace-nowrap truncate min-w-0 ${
                    idx === 0 ? 'max-w-[110.5px] sm:max-w-[127.5px]' : 'max-w-[136px] sm:max-w-[153px]'
                  }`}
                >
                  {role}
                </span>
              ))}
              {extraRoles > 0 && (
                <span className="shrink-0 px-[6.8px] py-[2.55px] text-[9.35px] font-medium text-white/50 border border-white/[0.07] rounded-[5px] bg-white/[0.02] whitespace-nowrap">
                  +{extraRoles}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[9.35px] text-white/50 italic py-[2.55px]">No open roles</p>
          )}
        </div>

        {/* Creator row */}
        <div className="flex items-center gap-[6.8px] mt-[13.6px] min-h-[17px]">
          {creator && creator.name ? (
            <>
              <div className="w-[17px] h-[17px] rounded-full overflow-hidden bg-purple/20 border border-purple/25 shrink-0 flex items-center justify-center">
                {creator.avatar ? (
                  <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[7.65px] font-bold text-purple-light">{creator.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="text-[9.35px] text-white/50 truncate">by <span className="text-white/70">{creator.name}</span></span>
            </>
          ) : (
            <div className="h-[17px]" />
          )}
        </div>

        {/* View Project CTA */}
        <div className="mt-auto pt-[17px]">
          <InteractiveHoverButton text="View Project" size="explore" />
        </div>
      </div>
    </Link>
  )
}

export default ExploreProjects
