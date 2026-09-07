import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RoleSelection({ onSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null)

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Heading Section */}
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide leading-none text-white mb-3">
          How will you use <span className="gradient-text">FrameWork</span>?
        </h1>
        <p className="text-white/50 text-base sm:text-lg font-medium max-w-md mx-auto">
          Start productions or join the crew behind them.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Creator Card */}
        <button
          type="button"
          id="role-creator"
          onClick={() => onSelect('creator')}
          onMouseEnter={() => setHoveredRole('creator')}
          onMouseLeave={() => setHoveredRole(null)}
          className={`group relative bg-[#111118] rounded-2xl p-7 sm:p-9 border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] flex flex-col justify-between ${
            hoveredRole === 'creator'
              ? 'border-[#6239BF]/60 -translate-y-1 shadow-[0_12px_40px_rgba(98,57,191,0.22)]'
              : 'border-white/[0.08] hover:border-[#6239BF]/35'
          }`}
        >
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6239BF]/15 border border-[#6239BF]/30 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF]" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-purple-light">
                Creator
              </span>
            </div>

            {/* Icon & Heading */}
            <div className="w-13 h-13 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 group-hover:border-[#6239BF]/40 group-hover:bg-[#6239BF]/10 transition-colors">
              <svg className="w-6 h-6 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125" />
              </svg>
            </div>

            <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal text-white mb-2.5 tracking-wide group-hover:text-purple-light transition-colors">
              Start as a Filmmaker
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Create productions, post open roles, and assemble your crew.
            </p>
          </div>

          {/* CTA indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-light tracking-wide pt-4 border-t border-white/[0.06]">
            <span>Create &amp; Lead</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>

        {/* Collaborator Card */}
        <button
          type="button"
          id="role-collaborator"
          onClick={() => onSelect('user')}
          onMouseEnter={() => setHoveredRole('user')}
          onMouseLeave={() => setHoveredRole(null)}
          className={`group relative bg-[#111118] rounded-2xl p-7 sm:p-9 border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] flex flex-col justify-between ${
            hoveredRole === 'user'
              ? 'border-emerald-500/50 -translate-y-1 shadow-[0_12px_40px_rgba(16,185,129,0.15)]'
              : 'border-white/[0.08] hover:border-emerald-500/30'
          }`}
        >
          <div>
            {/* Eyebrow badge with subtle emerald signal */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-400">
                Collaborator
              </span>
            </div>

            {/* Icon & Heading */}
            <div className="w-13 h-13 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>

            <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal text-white mb-2.5 tracking-wide group-hover:text-white transition-colors">
              Join Cast &amp; Crew
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Find open roles, join productions, and build verified film credits.
            </p>
          </div>

          {/* CTA indicator */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 tracking-wide pt-4 border-t border-white/[0.06]">
            <span>Find Your Role</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </button>
      </div>

      {/* Login link */}
      <p className="text-center text-white/60 text-sm mt-10">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-purple-light hover:text-white transition-colors font-semibold underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Login
        </Link>
      </p>
    </div>
  )
}
