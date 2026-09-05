import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import FeaturedProjects from '../components/FeaturedProjects'
import FeaturedCreators from '../components/FeaturedCreators'
import CallToAction from '../components/CallToAction'

function HomePage() {
  return (
    <div className="homepage-bg relative" style={{ backgroundColor: '#0A0A0F' }}>
      {/* Gradient Mesh Blobs */}
      <div className="homepage-mesh pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Blob 1 — upper-left, primary purple */}
        <div
          className="homepage-blob homepage-blob-1 absolute"
          style={{
            width: '900px',
            height: '900px',
            top: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(98,57,191,0.18) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        {/* Blob 2 — upper-right, lighter purple */}
        <div
          className="homepage-blob homepage-blob-2 absolute"
          style={{
            width: '700px',
            height: '700px',
            top: '5%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(90px)',
          }}
        />
        {/* Blob 3 — lower-center-left, deep purple */}
        <div
          className="homepage-blob homepage-blob-3 absolute"
          style={{
            width: '1000px',
            height: '800px',
            bottom: '-10%',
            left: '5%',
            background: 'radial-gradient(circle, rgba(59,31,115,0.22) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />
        {/* Blob 4 — far-right accent, faint magenta */}
        <div
          className="absolute"
          style={{
            width: '500px',
            height: '500px',
            bottom: '20%',
            right: '0%',
            background: 'radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Film Grain Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          opacity: 0.03,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Filmstrip — Left Edge */}
      <div
        className="homepage-filmstrip homepage-filmstrip-left pointer-events-none absolute top-0 bottom-0 left-0 z-[2] hidden md:block"
        aria-hidden="true"
        style={{ width: '40px' }}
      >
        {/* Vertical edge line */}
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{
            width: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        {/* Sprocket holes */}
        <div
          className="homepage-sprockets absolute top-0 bottom-0 left-0 right-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 5px,
              rgba(98,57,191,0.18) 5px,
              rgba(98,57,191,0.18) 15px,
              transparent 15px,
              transparent 26px
            )`,
            backgroundSize: '6px 26px',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
          }}
        />
      </div>

      {/* Filmstrip — Right Edge */}
      <div
        className="homepage-filmstrip homepage-filmstrip-right pointer-events-none absolute top-0 bottom-0 right-0 z-[2] hidden md:block"
        aria-hidden="true"
        style={{ width: '40px' }}
      >
        {/* Vertical edge line */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{
            width: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        {/* Sprocket holes */}
        <div
          className="homepage-sprockets absolute top-0 bottom-0 left-0 right-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 5px,
              rgba(98,57,191,0.18) 5px,
              rgba(98,57,191,0.18) 15px,
              transparent 15px,
              transparent 26px
            )`,
            backgroundSize: '6px 26px',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 8%, rgba(0,0,0,1) 92%, transparent 100%)',
          }}
        />
      </div>

      {/* Homepage Content */}
      <div className="relative z-[5]">
        <Hero />
        <FeaturedProjects />
        <HowItWorks />
        <FeaturedCreators />
        <CallToAction />
      </div>
    </div>
  )
}

export default HomePage
