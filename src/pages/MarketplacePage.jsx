import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'

const EQUIPMENT_CATEGORIES = [
  {
    title: 'Cameras & Bodies',
    description: 'Cinema, mirrorless, and digital production cameras ready for indie sets.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
  },
  {
    title: 'Lenses & Optics',
    description: 'Prime sets, anamorphic glass, cinema zooms, and creative specialty optics.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: 'Lighting & Power',
    description: 'Continuous LED fixtures, softboxes, portable panels, and high-capacity batteries.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
  },
  {
    title: 'Audio & Sound',
    description: 'Wireless lavalier systems, boom microphones, multi-track field recorders, and accessories.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: 'Grip & Support',
    description: 'Heavy-duty tripods, fluid heads, motorized gimbals, sliders, and rigging gear.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25M9 15l-4.5 4.5m0 0h6m-6 0v-6" />
      </svg>
    ),
  },
  {
    title: 'Monitoring & Video',
    description: 'Wireless video transmitters, on-camera monitors, director directors cages, and follow focus.',
    icon: (
      <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
]

function MarketplacePage() {
  usePageTitle('Equipment Marketplace | FrameWork')

  return (
    <section aria-labelledby="marketplace-heading" className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative overflow-hidden bg-[#000000] text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#6239BF]/15 rounded-full blur-[150px]" />
        <div className="absolute top-2/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#6239BF]/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#000000_80%)]" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-purple/30 bg-purple/10 mb-6">
          <span className="w-2 h-2 rounded-full bg-purple animate-pulse" />
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-purple-light">
            Coming Soon
          </span>
        </div>

        {/* Display Heading */}
        <h1
          id="marketplace-heading"
          className="font-['Bebas_Neue',_sans-serif] text-5xl sm:text-7xl md:text-8xl font-normal tracking-wide text-white leading-[0.95] mb-5"
        >
          EQUIPMENT <span className="gradient-text">MARKETPLACE</span>
        </h1>

        {/* Supporting Text */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto mb-3 leading-snug">
          Rent filmmaking equipment from the FrameWork community.
        </p>

        {/* Secondary Description */}
        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed mb-10">
          Cameras, lenses, lighting, audio gear and more — a trusted equipment rental marketplace built for filmmakers.
        </p>

        {/* Status Element & Primary Navigation Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
          <div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white/50 text-xs sm:text-sm font-medium cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple" />
            </span>
            <span>Launching Soon on FrameWork</span>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#6239BF] text-white text-xs sm:text-sm font-semibold transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95"
          >
            <span>Explore Projects</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Subtle Visual Treatment: Equipment Categories Preview */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-[1px] w-8 bg-purple/40" />
            <span className="text-xs uppercase tracking-wider text-white/40 font-medium">
              Upcoming Gear Categories
            </span>
            <span className="h-[1px] w-8 bg-purple/40" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="glass-card rounded-2xl p-5 border border-white/5 bg-white/[0.02] hover:border-purple/30 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center mb-3.5">
                  {cat.icon}
                </div>
                <h2 className="font-['Bebas_Neue',_sans-serif] text-xl tracking-wide text-white mb-1.5">
                  {cat.title}
                </h2>
                <p className="text-xs text-white/50 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketplacePage
