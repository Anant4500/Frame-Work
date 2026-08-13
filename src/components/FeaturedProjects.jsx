import { Link } from 'react-router-dom'

const projects = [
  {
    id: 1,
    title: 'Echoes of Amber',
    genre: 'Drama',
    location: 'Mumbai, India',
    thumbnail: '/images/project-1.png',
    roles: ['Actor', 'Editor', 'Sound Designer'],
  },
  {
    id: 2,
    title: 'Neon Divide',
    genre: 'Sci-Fi',
    location: 'Los Angeles, CA',
    thumbnail: '/images/project-2.png',
    roles: ['Cinematographer', 'VFX Artist'],
  },
  {
    id: 3,
    title: 'Midnight Rain',
    genre: 'Thriller',
    location: 'London, UK',
    thumbnail: '/images/project-3.png',
    roles: ['Actor', 'Director', 'Writer'],
  },
  {
    id: 4,
    title: 'Golden Hour',
    genre: 'Coming-of-Age',
    location: 'New York, NY',
    thumbnail: '/images/project-4.png',
    roles: ['Actor', 'Composer', 'Editor'],
  },
]

function FeaturedProjects() {
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
            <h2 className="font-[Montserrat] text-4xl sm:text-5xl font-bold tracking-tight">
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

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="group glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)] hover:border-purple/20">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
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
                  <h3 className="font-[Montserrat] text-lg font-bold mb-1 group-hover:text-purple-light transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="text-white/40 text-sm mb-4 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
                  <button className="w-full py-2.5 text-sm font-medium text-white/60 border border-white/10 rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:bg-purple/10 group-hover:border-purple/30">
                    View Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProjects
