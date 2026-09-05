import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import FeaturedProjectsCarousel from './ui/FeaturedProjectsCarousel'

function FeaturedProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, genre, location, poster_url, created_at, creator:profiles(name), roles:project_roles(role)')
          .eq('status', 'OPEN')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) {
          console.error('Error fetching featured projects:', error)
          return
        }

        if (isMounted && data) {
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
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchFeaturedProjects()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="projects" className="relative py-16 md:py-24 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
          <span className="inline-block text-purple text-xs sm:text-sm font-semibold tracking-widest uppercase mb-3">
            Featured Projects
          </span>
          <h2 className="font-['Fraunces',_serif] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.02em] leading-[1.15] text-white">
            Stories Seeking Creators
          </h2>
        </div>

        {/* Carousel Presentation or Empty State */}
        {!loading && projects.length > 0 ? (
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
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
        ) : !loading ? (
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
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
        ) : null}
      </div>
    </section>
  )
}

export default FeaturedProjects
