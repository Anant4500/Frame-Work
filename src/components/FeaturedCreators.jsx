const creators = [
  {
    id: 1,
    name: 'Arjun Mehta',
    role: 'Director',
    avatar: '/images/creator-1.png',
    projects: 12,
  },
  {
    id: 2,
    name: 'Sofia Rivera',
    role: 'Actor',
    avatar: '/images/creator-2.png',
    projects: 8,
  },
  {
    id: 3,
    name: 'Ravi Kapoor',
    role: 'Cinematographer',
    avatar: '/images/creator-3.png',
    projects: 15,
  },
  {
    id: 4,
    name: 'Emily Chen',
    role: 'Editor & Producer',
    avatar: '/images/creator-4.png',
    projects: 10,
  },
]

function FeaturedCreators() {
  return (
    <section id="creators" className="relative py-28 px-6">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
          <span className="inline-block text-purple text-sm font-semibold tracking-widest uppercase mb-4">
            Featured Creators
          </span>
          <h2 className="font-[Montserrat] text-4xl sm:text-5xl font-bold tracking-tight">
            Meet the Talent
          </h2>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {creators.map((creator, index) => (
            <div
              key={creator.id}
              className={`reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0`}
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="group text-center cursor-pointer">
                {/* Avatar */}
                <div className="relative w-32 h-32 mx-auto mb-5">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple to-purple-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl" />
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 transition-all duration-500 group-hover:border-purple/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* Info */}
                <h3 className="font-[Montserrat] text-lg font-bold mb-1 transition-colors duration-300 group-hover:text-purple-light">
                  {creator.name}
                </h3>
                <p className="text-white/40 text-sm mb-3">{creator.role}</p>
                <p className="text-white/20 text-xs">{creator.projects} Projects</p>

                {/* View Profile Button */}
                <button className="mt-4 px-5 py-2 text-xs font-medium text-white/40 border border-white/10 rounded-full opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:border-purple/40 hover:text-purple-light">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedCreators
