function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Frame<span className="text-purple">Work</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors duration-300">About</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-300">Contact</a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {/* Twitter / X */}
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/30 transition-all duration-300 hover:bg-purple/20 hover:text-purple" aria-label="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/30 transition-all duration-300 hover:bg-purple/20 hover:text-purple" aria-label="Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* YouTube */}
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/30 transition-all duration-300 hover:bg-purple/20 hover:text-purple" aria-label="YouTube">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-white/20 text-xs">
            © 2026 FrameWork. Built for filmmakers, by filmmakers.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
