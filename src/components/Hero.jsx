import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ShimmerButton from './ui/ShimmerButton'

function Hero() {
  const [loaded, setLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.png"
          alt="Film set background"
          className="w-full h-full object-cover scale-105 blur-[2px]"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        {/* Purple Accent Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 via-transparent to-transparent" />
      </div>

      {/* Animated grain texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 transition-all duration-1000 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="w-2 h-2 bg-purple rounded-full animate-pulse" />
          <span className="text-sm text-white/70 font-medium">Open Film Collaboration Platform</span>
        </div>

        {/* Headline */}
        <h1
          className={`font-['DM_Serif_Display'] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[0.95] tracking-tight mb-6 transition-all duration-1000 delay-200 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Build Films
          <br />
          <span className="gradient-text">Together.</span>
        </h1>

        {/* Subtext */}
        <p
          className={`text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light transition-all duration-1000 delay-400 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Connect with writers, actors, and creators to bring your story to life.
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-600 ${
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <ShimmerButton
            href="#cta"
            id="hero-cta-primary"
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

        {/* Scroll indicator */}
        <div
          className={`mt-16 transition-all duration-1000 delay-800 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="animate-bounce">
            <svg className="w-6 h-6 mx-auto text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
