import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function FeaturedCreators() {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCreators = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, name, location, experience_level, profile_photo_url')
        .eq('role', 'CREATOR')
        .order('created_at', { ascending: false })
        .limit(4)

      if (fetchError) {
        console.error('Error fetching featured creators:', fetchError)
        setError('Unable to load featured creators.')
        return
      }

      if (data) {
        const mapped = data.map((p) => {
          const expText = p.experience_level
            ? p.experience_level.charAt(0).toUpperCase() + p.experience_level.slice(1).toLowerCase()
            : null

          return {
            id: p.id,
            name: p.name || 'Creator',
            craft: 'Filmmaker',
            experienceLevel: expText,
            location: p.location || '',
            avatar: p.profile_photo_url || '/images/profile/avatar.png',
          }
        })
        setCreators(mapped)
      }
    } catch (err) {
      console.error('Error fetching featured creators:', err)
      setError('Unable to load featured creators.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCreators()
  }, [fetchCreators])

  return (
    <section id="creators" className="relative pt-16 md:pt-24 pb-12 md:pb-14 px-4 sm:px-6">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-14 reveal">
          <span className="inline-block text-purple text-xs sm:text-sm font-semibold tracking-widest uppercase mb-3 sm:mb-4">
            Featured Creators
          </span>
          <h2 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide leading-tight">
            Meet the Talent
          </h2>
        </div>

        {/* ── State 1: Loading Skeleton (Reserves approximate height to eliminate CLS) ── */}
        {loading && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 animate-fade-in"
            aria-busy="true"
            aria-label="Loading featured creators"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 sm:p-4 rounded-2xl border border-white/[0.04] bg-[#111118]/60 text-center flex flex-col items-center"
                aria-hidden="true"
              >
                {/* Circular Avatar Skeleton */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/[0.04] border border-white/[0.08] mx-auto mb-4 animate-pulse" />
                {/* Name Placeholder */}
                <div className="h-4 sm:h-5 w-24 bg-white/[0.07] rounded-md mb-2 animate-pulse" />
                {/* Craft Placeholder */}
                <div className="h-3 w-16 bg-white/[0.04] rounded-md mb-1.5" />
                {/* Subtitle Placeholder */}
                <div className="h-2.5 w-12 bg-white/[0.03] rounded-md mb-3" />
                {/* Button Placeholder */}
                <div className="h-7 w-20 rounded-full bg-white/[0.03] border border-white/[0.05] mt-auto" />
              </div>
            ))}
          </div>
        )}

        {/* ── State 2: Error State (Compact, with retry) ── */}
        {!loading && error && (
          <div className="reveal">
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#6239BF]/10 border border-[#6239BF]/30 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Unable to load featured creators.</h3>
              <p className="text-white/40 text-xs sm:text-sm mb-6 leading-relaxed">
                We encountered an issue retrieving community talent. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={fetchCreators}
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

        {/* ── State 3: Populated Creators Grid (Accessible semantic links, responsive sizing) ── */}
        {!loading && !error && creators.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {creators.map((creator, index) => (
              <div
                key={creator.id}
                className="reveal flex"
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                <Link
                  to={`/profile/${creator.id}`}
                  className="group w-full block text-center rounded-2xl p-3 sm:p-4 border border-transparent hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:border-transparent"
                  aria-label={`View profile of ${creator.name}, ${creator.craft}`}
                >
                  {/* Avatar with responsive sizing and hover glow */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto mb-3 sm:mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple to-purple-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl" />
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 transition-all duration-500 group-hover:border-purple/50 group-hover:shadow-[0_0_30px_rgba(98,57,191,0.3)]">
                      <img
                        src={creator.avatar}
                        alt={creator.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = '/images/profile/avatar.png'
                        }}
                      />
                    </div>
                  </div>

                  {/* Creator Info */}
                  <h3 className="font-['Bebas_Neue',_sans-serif] text-xl sm:text-2xl font-normal tracking-wide mb-1 transition-colors duration-300 group-hover:text-purple-light truncate">
                    {creator.name}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm mb-0.5">{creator.craft}</p>
                  {creator.experienceLevel && (
                    <p className="text-white/45 text-[10px] sm:text-xs font-medium mb-1">
                      {creator.experienceLevel}
                    </p>
                  )}
                  {creator.location && (
                    <p className="text-white/50 text-[11px] sm:text-xs truncate">{creator.location}</p>
                  )}

                  {/* View Profile Visual Indicator (non-nested span cue) */}
                  <span
                    className="inline-block mt-3 px-4 py-1.5 text-xs font-medium text-white/50 border border-white/10 rounded-full transition-all duration-300 group-hover:border-purple/40 group-hover:text-purple-light group-hover:bg-[#6239BF]/10 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    aria-hidden="true"
                  >
                    View Profile
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ── State 4: Genuine Empty State (0 creators registered) ── */}
        {!loading && !error && creators.length === 0 && (
          <div className="reveal">
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
        )}
      </div>
    </section>
  )
}

export default FeaturedCreators
