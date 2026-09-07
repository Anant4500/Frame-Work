import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

function NotFoundPage() {
  usePageTitle('Page Not Found | FrameWork')

  return (
    <section aria-labelledby="not-found-heading" className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-20 sm:py-28 relative overflow-hidden bg-[#0A0A0F] text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/12 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_80%)]" />
      </div>

      <div className="w-full max-w-lg mx-auto text-center px-4">
        {/* Subtle decorative 404 eyebrow */}
        <p className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl tracking-widest text-purple-light mb-1 leading-none">
          404
        </p>

        {/* Heading */}
        <h1 id="not-found-heading" className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide text-white mb-4 leading-none">
          Page Not Found
        </h1>

        {/* Explanatory body */}
        <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or may have moved.
        </p>

        {/* Navigation actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/explore"
            className="w-full sm:w-auto px-6 py-3 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            Explore Projects
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] text-sm font-medium rounded-xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            Return Home
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
