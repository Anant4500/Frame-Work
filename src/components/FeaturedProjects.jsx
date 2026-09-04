import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

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
          .select('id, title, genre, location, poster_url, created_at, roles:project_roles(role)')
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
    <section id="projects" className="relative py-28 px-6">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
          <div>
            <span className="inline-block text-purple text-sm font-semibold tracking-widest uppercase mb-4">
              Featured Projects
            </span>
            <h2 className="font-['DM_Serif_Display'] text-4xl sm:text-5xl font-normal tracking-tight">
              Stories Seeking Creators
            </h2>
          </div>
          <Link
            to="/explore"
            className="mt-4 sm:mt-0 text-sm text-white/50 hover:text-purple transition-colors duration-300 flex items-center gap-1"
          >
            View all projects
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Project Grid or Empty State */}
        {!loading && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Link
                  to={`/project/${project.id}`}
                  className="group glass-card rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(98,57,191,0.15)] hover:border-purple/20 block"
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.title || 'Project'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {/* Genre badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-purple/80 backdrop-blur-sm rounded-full">
                      {project.genre}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-['DM_Serif_Display'] text-lg font-normal mb-1 group-hover:text-purple-light transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-white/40 text-sm mb-4 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {project.location}
                    </p>

                    {/* Roles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.roles.map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-1 text-xs font-medium text-white/60 bg-white/5 border border-white/10 rounded-full transition-all duration-300 hover:border-purple/30 hover:text-purple-light"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    {/* View Button */}
                    <span className="block w-full py-2.5 text-sm font-medium text-white/60 border border-white/10 rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:bg-purple/10 group-hover:border-purple/30 text-center">
                      View Project
                    </span>
                  </div>
                </Link>
              </div>
            ))}
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
