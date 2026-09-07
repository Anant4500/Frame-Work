import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            <img
              src="/images/framework-logo.png"
              alt=""
              aria-hidden="true"
              className="h-7 w-auto object-contain"
            />
            <span className="font-['Bebas_Neue',_sans-serif] text-xl tracking-wider">
              Frame<span className="text-purple">Work</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link
              to="/explore"
              className="hover:text-white transition-colors duration-300 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Explore Projects
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-white/55 text-xs text-center sm:text-right">
            © 2026 FrameWork. Built for filmmakers, by filmmakers.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

