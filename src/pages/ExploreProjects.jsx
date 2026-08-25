import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'

const locations = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata']
const genres = ['Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Action', 'Horror', 'Romance', 'Mystery', 'Documentary']
const roles = ['Actor', 'Editor', 'DOP', 'Director', 'Writer', 'Composer', 'VFX Artist', 'Sound Designer', 'Cinematographer']

function ExploreProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const [visibleCount, setVisibleCount] = useState(6)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*, creator:profiles(name, profile_photo_url, location), roles:project_roles(role, positions_needed, positions_filled)')
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        if (isMounted) {
          const mapped = (data || []).map((p) => ({
            id: p.id,
            title: p.title || 'Untitled Project',
            logline: p.description || '',
            description: p.description || '',
            genre: p.genre || 'Drama',
            location: p.location || 'Remote',
            budget: p.budget,
            timeline: p.timeline,
            thumbnail: p.poster_url || '/images/hero-bg.png',
            poster_url: p.poster_url,
            status: p.status === 'OPEN' ? 'Open' : p.status === 'IN_PRODUCTION' ? 'In Production' : p.status === 'COMPLETED' ? 'Completed' : p.status,
            date: p.created_at ? p.created_at.split('T')[0] : '',
            created_at: p.created_at,
            popular: false,
            creator: p.creator ? {
              name: p.creator.name,
              avatar: p.creator.profile_photo_url,
              location: p.creator.location,
            } : null,
            roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
            rawRoles: p.roles || [],
          }))
          setProjects(mapped)
        }
      } catch (err) {
        console.error('Error fetching explore projects:', err)
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProjects()

    return () => {
      isMounted = false
    }
  }, [])

  const toggleFilter = (value, list, setter) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const clearFilters = () => {
    setSelectedLocations([])
    setSelectedGenres([])
    setSelectedRoles([])
    setSearch('')
  }

  const activeFilterCount = selectedLocations.length + selectedGenres.length + selectedRoles.length

  const filtered = useMemo(() => {
    let result = [...projects]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.genre && p.genre.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.roles && p.roles.some((r) => r.toLowerCase().includes(q)))
      )
    }

    if (selectedLocations.length > 0) {
      result = result.filter((p) => p.location && selectedLocations.includes(p.location))
    }
    if (selectedGenres.length > 0) {
      result = result.filter((p) => p.genre && selectedGenres.includes(p.genre))
    }
    if (selectedRoles.length > 0) {
      result = result.filter((p) => p.roles && p.roles.some((r) => selectedRoles.includes(r)))
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || b.date || 0) - new Date(a.created_at || a.date || 0))
    } else {
      result.sort((a, b) => (b.popular === a.popular ? 0 : b.popular ? 1 : -1))
    }

    return result
  }, [search, selectedLocations, selectedGenres, selectedRoles, sortBy, projects])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="font-[Montserrat] text-4xl sm:text-5xl font-black tracking-tight mb-3">
              Explore <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl">
              Discover film projects looking for talented collaborators like you.
            </p>
          </div>
          {user && user.role === 'creator' && (
            <Link
              to="/create-project"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Project
            </Link>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          id="mobile-filter-toggle"
          className="lg:hidden flex items-center gap-2 px-5 py-3 mb-6 glass-card rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
            className={`
              ${mobileFiltersOpen ? 'fixed inset-0 z-40 bg-black/95 backdrop-blur-xl p-6 pt-20 overflow-y-auto' : 'hidden'}
              lg:block lg:static lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:pt-0
              w-full lg:w-64 lg:min-w-[256px] shrink-0
            `}
          >
            {/* Mobile close button */}
            <button
              className="lg:hidden absolute top-6 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-white/60 hover:text-white"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="glass-card rounded-2xl p-6 sticky top-28">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-[Montserrat] text-lg font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-purple hover:text-purple-light transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Location */}
              <FilterGroup
                title="Location"
                items={locations}
                selected={selectedLocations}
                onToggle={(v) => toggleFilter(v, selectedLocations, setSelectedLocations)}
              />

              <div className="h-px bg-white/5 my-5" />

              {/* Genre */}
              <FilterGroup
                title="Genre"
                items={genres}
                selected={selectedGenres}
                onToggle={(v) => toggleFilter(v, selectedGenres, setSelectedGenres)}
              />

              <div className="h-px bg-white/5 my-5" />

              {/* Roles Needed */}
              <FilterGroup
                title="Roles Needed"
                items={roles}
                selected={selectedRoles}
                onToggle={(v) => toggleFilter(v, selectedRoles, setSelectedRoles)}
              />
            </div>
          </aside>

          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            {/* Top Bar: Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by role, genre, or location..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full sm:w-48 px-4 py-3.5 pr-10 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:border-purple/50 cursor-pointer"
                >
                  <option value="newest" className="bg-[#111]">Newest</option>
                  <option value="popular" className="bg-[#111]">Popular</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[...selectedLocations, ...selectedGenres, ...selectedRoles].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple/10 border border-purple/20 text-purple-light rounded-full"
                  >
                    {f}
                    <button
                      onClick={() => {
                        if (selectedLocations.includes(f)) toggleFilter(f, selectedLocations, setSelectedLocations)
                        else if (selectedGenres.includes(f)) toggleFilter(f, selectedGenres, setSelectedGenres)
                        else toggleFilter(f, selectedRoles, setSelectedRoles)
                      }}
                      className="hover:text-white transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Results Count (only when projects exist) */}
            {projects.length > 0 && (
              <p className="text-white/30 text-sm mb-6">
                {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Project Grid, Loading, or Empty State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                <p className="text-white/40 text-sm">Loading live projects...</p>
              </div>
            ) : visible.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visible.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : projects.length === 0 ? (
              /* STATE A — No projects exist at all */
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
                  </svg>
                </div>
                <h3 className="font-[Montserrat] text-xl font-bold text-white/70 mb-2">No Projects Yet</h3>
                <p className="text-white/30 text-sm mb-6 max-w-sm mx-auto">Be the first to bring a film idea to FrameWork.</p>
                <Link
                  to="/create-project"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Start a Project
                </Link>
              </div>
            ) : (
              /* STATE B — Projects exist, but current filters return 0 results */
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <p className="text-white/40 text-lg font-medium mb-2">No projects match your filters.</p>
                <p className="text-white/20 text-sm">Try adjusting your filters or search query.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-5 py-2 text-sm text-purple hover:text-purple-light transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  id="load-more-btn"
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="px-8 py-3.5 border border-white/10 rounded-full text-sm font-medium text-white/60 hover:text-white hover:border-purple/40 hover:bg-purple/5 transition-all duration-300"
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

/* ─── Filter Group Component ─── */
function FilterGroup({ title, items, selected, onToggle }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        className="flex items-center justify-between w-full mb-3 group"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-white/30 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const checked = selected.includes(item)
            return (
              <label
                key={item}
                className="flex items-center gap-3 cursor-pointer group/item"
              >
                <span
                  className={`w-4.5 h-4.5 rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                    checked
                      ? 'bg-purple border-purple shadow-[0_0_8px_rgba(139,92,246,0.3)]'
                      : 'border-white/20 group-hover/item:border-white/40'
                  }`}
                >
                  {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item)}
                  className="sr-only"
                />
                <span className={`text-sm transition-colors duration-200 ${checked ? 'text-white' : 'text-white/50 group-hover/item:text-white/70'}`}>
                  {item}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ─── Project Card Component ─── */
function ProjectCard({ project }) {
  const roles = Array.isArray(project.roles) ? project.roles : []
  const thumbnail = project.thumbnail || '/images/hero-bg.png'

  return (
    <Link
      to={`/project/${project.id}`}
      className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)] hover:border-purple/20 block"
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-white/5">
        <img
          src={thumbnail}
          alt={project.title || 'Film Project'}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {project.genre && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-purple/80 backdrop-blur-sm rounded-full">
            {project.genre}
          </span>
        )}
        {project.status && (
          <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${
            project.status === 'Open' ? 'border-purple/40 text-purple-light bg-purple/20' :
            project.status === 'In Production' ? 'border-amber-500/40 text-amber-400 bg-amber-500/20' :
            'border-emerald-500/40 text-emerald-400 bg-emerald-500/20'
          }`}>
            {project.status}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-[Montserrat] text-lg font-bold mb-1 group-hover:text-purple-light transition-colors duration-300">
          {project.title || 'Untitled Project'}
        </h3>
        {project.location && (
          <p className="text-white/40 text-sm mb-4 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {project.location}
          </p>
        )}

        {/* Roles */}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {roles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 text-xs font-medium text-purple-light border border-purple/20 rounded-full transition-all duration-300 group-hover:bg-purple/10 group-hover:border-purple/40 cursor-default"
              >
                {role}
              </span>
            ))}
          </div>
        )}

        {/* View Project Button */}
        <span className="block w-full py-3 text-sm font-semibold bg-purple text-white rounded-xl transition-all duration-300 group-hover:bg-purple-dark group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] text-center">
          View Project
        </span>
      </div>
    </Link>
  )
}

export default ExploreProjects
