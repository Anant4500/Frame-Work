import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import ShimmerButton from './ui/ShimmerButton'
import HeroJourney from './home/HeroJourney'

function Hero() {
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setLoaded(true)
    })
    return () => cancelAnimationFrame(handle)
  }, [])

  return (
    <section id="hero" className="relative min-h-[60vh] flex items-center overflow-hidden pt-20 pb-10 sm:pt-[90px] sm:pb-[52px]" style={{ backgroundColor: '#000000' }}>
      {/* ── Hero Background Stack ── */}

      {/* Layer 1: Base */}
      <div className="absolute inset-0" style={{ backgroundColor: '#000000' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,54fr)_minmax(0,46fr)] items-center gap-8 lg:gap-12">
          {/* Left Content Column */}
          <div className="min-w-0 max-w-[560px] text-left">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full glass mb-5 sm:mb-6 transition-all duration-1000 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-1.5 h-1.5 bg-purple rounded-full animate-pulse" />
              <span className="text-[11px] text-white/70 font-medium">Open Film Collaboration Platform</span>
            </div>

            {/* Headline */}
            <h1
              className={`font-['Bebas_Neue',_sans-serif] text-5xl sm:text-[58px] md:text-[77px] lg:text-[102px] font-normal leading-[0.95] tracking-wide mb-5 transition-all duration-1000 delay-200 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Build Films
              <br />
              <span className="gradient-text">Together.</span>
            </h1>

            {/* Subtext */}
            <p
              className={`text-[14.5px] sm:text-base text-[#D4D4D8] max-w-[448px] mb-6 sm:mb-8 leading-relaxed font-normal transition-all duration-1000 delay-400 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Connect with writers, actors, and creators to bring your story to life.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-3.5 justify-start items-start sm:items-center transition-all duration-1000 delay-600 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <ShimmerButton
                id="hero-cta-primary"
                onClick={() => navigate(user ? '/create-project' : '/register')}
                background="#6239BF"
                shimmerColor="#FFFFFF"
                borderRadius="9999px"
                className="px-[26px] py-3 text-[13px] font-semibold"
              >
                Start Your Project
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </ShimmerButton>
              <ShimmerButton
                id="hero-cta-secondary"
                onClick={() => navigate('/explore')}
                shimmerColor="#6239BF"
                background="rgba(10, 10, 10, 0.9)"
                borderRadius="9999px"
                className="px-[26px] py-3 text-[13px] font-semibold"
              >
                Explore Projects
              </ShimmerButton>
            </div>
          </div>

          {/* Right Column: Interactive Journey */}
          <div
            className={`hidden md:flex min-w-0 items-center justify-end transition-all duration-1000 delay-700 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="hero-journey-position w-full max-w-[420px]">
              <HeroJourney />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-800 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="animate-bounce">
          <svg className="w-5 h-5 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero
