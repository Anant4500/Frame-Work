import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import FeaturedProjectsCarousel from './ui/FeaturedProjectsCarousel'

function FeaturedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFeaturedProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('id, title, genre, location, poster_url, creator:profiles(name), roles:project_roles(role)')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false })
        .limit(4)

      if (fetchError) {
        console.error('Error fetching featured projects:', fetchError)
        setError('Unable to load featured projects.')
        return
      }

      if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          title: p.title || 'Untitled Project',
          genre: p.genre || 'Film',
          location: p.location || 'Remote',
          creatorName: p.creator?.name || null,
          thumbnail: p.poster_url || '/images/hero-bg.png',
          roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
        }))
        setProjects(mapped)
      }
    } catch (err) {
      console.error('Error fetching featured projects:', err)
      setError('Unable to load featured projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeaturedProjects()
  }, [fetchFeaturedProjects])

  return (
    <section id="projects" className="relative py-16 md:py-24 px-6 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 reveal">
          <span className="inline-block text-purple text-xs sm:text-sm font-semibold tracking-widest uppercase mb-3">
            Featured Projects
          </span>
          <h2 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide leading-tight text-white">
            Stories Seeking Creators
          </h2>
        </div>

        {/* ── State 1: Loading Skeleton (Reserves approximate Carousel height to eliminate CLS) ── */}
        {loading && (
          <div
            className="w-full flex flex-col items-center justify-center animate-fade-in"
            aria-busy="true"
            aria-label="Loading featured projects"
          >
            <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center h-[370px] sm:h-[430px] md:h-[500px]">
              {/* Flanking Ghost Card Left */}
              <div
                className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-[115%] -translate-y-1/2 w-[240px] h-[350px] md:w-[270px] md:h-[400px] rounded-[20px] border border-white/[0.04] bg-[#111118]/40 -rotate-6 scale-95 pointer-events-none opacity-30"
                aria-hidden="true"
              />

              {/* Center Primary Card Skeleton */}
              <div
                className="relative z-10 w-[210px] h-[310px] sm:w-[250px] sm:h-[360px] md:w-[280px] md:h-[410px] rounded-[20px] border border-white/[0.08] bg-[#111118] shadow-[0_15px_35px_rgba(0,0,0,0.6)] p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
                aria-hidden="true"
              >
                {/* Subtle top placeholder badges */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 rounded-full bg-[#6239BF]/25 border border-[#6239BF]/30 animate-pulse" />
                  <div className="h-5 w-24 rounded-full bg-white/[0.05] border border-white/[0.06]" />
                </div>

                {/* Subtle bottom placeholder details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#6239BF]/60 rounded-full" />
                    <div className="h-5 w-3/4 bg-white/[0.08] rounded-md animate-pulse" />
                  </div>
                  <div className="h-3 w-1/2 bg-white/[0.04] rounded-md" />
                  <div className="h-3 w-2/3 bg-white/[0.03] rounded-md" />
                  <div className="pt-2">
                    <div className="h-7 w-28 rounded-full bg-[#6239BF]/20 border border-[#6239BF]/30" />
                  </div>
                </div>
              </div>

              {/* Flanking Ghost Card Right */}
              <div
                className="hidden sm:block absolute top-1/2 left-1/2 translate-x-[15%] -translate-y-1/2 w-[240px] h-[350px] md:w-[270px] md:h-[400px] rounded-[20px] border border-white/[0.04] bg-[#111118]/40 rotate-6 scale-95 pointer-events-none opacity-30"
                aria-hidden="true"
              />
            </div>

            {/* View All Button Placeholder */}
            <div className="text-center mt-10 sm:mt-12" aria-hidden="true">
              <div className="inline-block h-10 w-44 rounded-full bg-white/[0.02] border border-white/[0.06]" />
            </div>
          </div>
        )}

        {/* ── State 2: Error State (Compact, polite, with retry action) ── */}
        {!loading && error && (
          <div className="reveal">
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#6239BF]/10 border border-[#6239BF]/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Unable to load featured projects.</h3>
              <p className="text-white/40 text-xs sm:text-sm mb-6 leading-relaxed">
                We encountered an issue retrieving productions. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={fetchFeaturedProjects}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6239BF] hover:bg-purple-dark text-white text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] active:scale-95 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── State 3: Populated Carousel Presentation ── */}
        {!loading && !error && projects.length > 0 && (
          <div className="reveal">
            <FeaturedProjectsCarousel projects={projects} />

            {/* Centered View All Link below Carousel */}
            <div className="text-center mt-10 sm:mt-12">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 hover:border-purple/40 bg-white/[0.03] hover:bg-white/[0.06] text-sm font-medium text-white/70 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(98,57,191,0.2)]"
              >
                <span>View all projects</span>
                <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* ── State 4: Genuine Empty State (0 projects published) ── */}
        {!loading && !error && projects.length === 0 && (
          <div className="reveal">
            <div className="glass-card rounded-2xl p-12 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white/70 mb-2">No projects have been published yet.</h3>
              <p className="text-white/30 text-sm mb-8 max-w-md mx-auto">Be the first to bring a film idea to FrameWork and find your crew.</p>
              <Link
                to="/create-project"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Start the first project
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedProjects
