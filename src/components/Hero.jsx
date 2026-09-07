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
    <section id="hero" className="relative min-h-[74vh] flex items-center overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16">
      {/* ── Hero Background Stack ── */}

      {/* Layer 1: Base */}
      <div className="absolute inset-0" style={{ backgroundColor: '#0A0A0F' }} />

      {/* Layer 2: Gradient Mesh Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Center spotlight — behind headline */}
        <div
          className="hero-blob hero-blob-center absolute"
          style={{
            width: '900px',
            height: '700px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -54%)',
            background: 'radial-gradient(ellipse, rgba(98,57,191,0.22) 0%, rgba(98,57,191,0.08) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Deep purple — upper-left */}
        <div
          className="hero-blob hero-blob-left absolute"
          style={{
            width: '700px',
            height: '700px',
            top: '-10%',
            left: '-12%',
            background: 'radial-gradient(circle, rgba(59,31,115,0.28) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        {/* Lighter purple — lower-right */}
        <div
          className="hero-blob hero-blob-right absolute"
          style={{
            width: '600px',
            height: '600px',
            bottom: '0%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Optional faint magenta accent — upper-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '400px',
            height: '400px',
            top: '5%',
            right: '5%',
            background: 'radial-gradient(circle, rgba(147,51,234,0.09) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Layer 3: Film Grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.032,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='hg'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23hg)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />


      {/* Layer 5: Bottom fade / transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '100px',
          background: 'linear-gradient(to bottom, transparent, #0A0A0F)',
          zIndex: 4,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[60%_40%] lg:grid-cols-[55%_45%] items-center">
          {/* Left Content Column */}
          <div className="max-w-[660px] text-left">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 sm:mb-8 transition-all duration-1000 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 bg-purple rounded-full animate-pulse" />
              <span className="text-sm text-white/70 font-medium">Open Film Collaboration Platform</span>
            </div>

            {/* Headline */}
            <h1
              className={`font-['Bebas_Neue',_sans-serif] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[0.95] tracking-wide mb-6 transition-all duration-1000 delay-200 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Build Films
              <br />
              <span className="gradient-text">Together.</span>
            </h1>

            {/* Subtext */}
            <p
              className={`text-lg sm:text-xl text-[#D4D4D8] max-w-[560px] mb-8 sm:mb-10 leading-relaxed font-normal transition-all duration-1000 delay-400 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Connect with writers, actors, and creators to bring your story to life.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-start items-start sm:items-center transition-all duration-1000 delay-600 ${
                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <ShimmerButton
                id="hero-cta-primary"
                onClick={() => navigate(user ? '/create-project' : '/register')}
                background="#6239BF"
                shimmerColor="#FFFFFF"
                borderRadius="9999px"
                className="px-8 py-4 text-base font-semibold"
              >
                Start Your Project
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </ShimmerButton>
              <ShimmerButton
                id="hero-cta-secondary"
                onClick={() => navigate('/explore')}
                shimmerColor="#6239BF"
                background="rgba(10, 10, 10, 0.9)"
                borderRadius="9999px"
                className="px-8 py-4 text-base font-semibold"
              >
                Explore Projects
              </ShimmerButton>
            </div>
          </div>

          {/* Right Column: Interactive Journey */}
          <div
            className={`hidden md:flex items-center justify-center px-2 lg:px-6 transition-all duration-1000 delay-700 ${
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <HeroJourney />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 transition-all duration-1000 delay-800 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="animate-bounce">
          <svg className="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Hero
