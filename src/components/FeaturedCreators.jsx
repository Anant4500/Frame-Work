import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function FeaturedCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchCreators = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, role, bio, location, experience_level, profile_photo_url, created_at')
          .eq('role', 'CREATOR')
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) {
          console.error('Error fetching featured creators:', error)
          return
        }

        if (isMounted && data) {
          const mapped = data.map((p) => ({
            id: p.id,
            name: p.name || 'Creator',
            role: p.experience_level || 'Filmmaker',
            location: p.location || '',
            avatar: p.profile_photo_url || '/images/profile/avatar.png',
          }))
          setCreators(mapped)
        }
      } catch (err) {
        console.error('Error fetching featured creators:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCreators()

    return () => {
      isMounted = false
    }
  }, [])

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
          <h2 className="font-['DM_Serif_Display'] text-4xl sm:text-5xl font-normal tracking-tight">
            Meet the Talent
          </h2>
        </div>

        {/* Creators Grid or Empty State */}
        {!loading && creators.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {creators.map((creator, index) => (
              <div
                key={creator.id}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <div className="group text-center cursor-pointer">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 mx-auto mb-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple to-purple-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 transition-all duration-500 group-hover:border-purple/50 group-hover:shadow-[0_0_30px_rgba(98,57,191,0.3)]">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/images/profile/avatar.png'
                        }}
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="font-['DM_Serif_Display'] text-lg font-normal mb-1 transition-colors duration-300 group-hover:text-purple-light">
                    {creator.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-1">{creator.role}</p>
                  {creator.location && (
                    <p className="text-white/20 text-xs">{creator.location}</p>
                  )}

                  {/* View Profile Button */}
                  <Link
                    to={`/profile/${creator.id}`}
                    className="inline-block mt-4 px-5 py-2 text-xs font-medium text-white/40 border border-white/10 rounded-full opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:border-purple/40 hover:text-purple-light"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : !loading ? (
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
            <div className="glass-card rounded-2xl p-12 sm:p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white/70 mb-2">No featured creators yet.</h3>
              <p className="text-white/30 text-sm mb-8 max-w-md mx-auto">Join FrameWork and be among the first filmmakers to build your profile.</p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95"
              >
                Join FrameWork
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default FeaturedCreators
