import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setProfileOpen(false)
  }, [location])

  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#creators') {
      const timer = setTimeout(() => {
        const element = document.getElementById('creators')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [location])

  const handleCreatorsClick = (e) => {
    e.preventDefault()
    if (mobileMenuOpen) {
      setMobileMenuOpen(false)
    }
    if (isHome) {
      const element = document.getElementById('creators')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
      window.history.pushState(null, '', '#creators')
    } else {
      navigate('/#creators')
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isHome = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/register'

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  return (
    <header
      id="header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-purple rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight font-[Montserrat]">
            Frame<span className="text-purple">Work</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className={`text-sm font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-purple after:transition-all after:duration-300 ${
              location.pathname === '/explore'
                ? 'text-white after:w-full'
                : 'text-white/70 hover:text-white after:w-0 hover:after:w-full'
            }`}
          >
            Explore
          </Link>
          <Link
            to="/#creators"
            onClick={handleCreatorsClick}
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-purple after:transition-all after:duration-300 hover:after:w-full"
          >
            Creators
          </Link>
          {user && (
            <Link
              to="/my-projects"
              className={`text-sm font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-purple after:transition-all after:duration-300 ${
                location.pathname === '/my-projects'
                  ? 'text-white after:w-full'
                  : 'text-white/70 hover:text-white after:w-0 hover:after:w-full'
              }`}
            >
              {user.role === 'creator' ? 'My Projects' : 'Dashboard'}
            </Link>
          )}

          {user ? (
            /* ─── Logged-in state ─── */
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                id="profile-avatar-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-full transition-all duration-300 hover:bg-white/5"
              >
                <span className="text-sm font-medium text-white/80 max-w-[100px] truncate">
                  {user.name}
                </span>
                <div className="w-9 h-9 rounded-full bg-purple/20 border-2 border-purple/40 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-purple hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-purple">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 top-full mt-2 w-56 bg-[#111111] border border-white/10 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top-right ${
                  profileOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                {/* User Info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/30 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => { setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    My Profile
                  </Link>
                  <Link
                    to="/my-projects"
                    onClick={() => { setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
                    </svg>
                    {user.role === 'creator' ? 'My Projects' : 'Dashboard'}
                  </Link>
                </div>

                <div className="border-t border-white/5 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── Logged-out state ─── */
            <>
              <Link
                to="/login"
                className={`ml-2 px-5 py-2.5 border border-white/15 text-white text-sm font-medium rounded-full transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:scale-[1.03] active:scale-95 ${
                  isAuth ? 'hidden' : ''
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.03] active:scale-95 ${
                  isAuth ? 'hidden' : ''
                }`}
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/5 overflow-hidden transition-all duration-500 ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          <Link to="/explore" className="text-white/70 hover:text-white transition-colors py-2">
            Explore
          </Link>
          <Link to="/#creators" onClick={handleCreatorsClick} className="text-white/70 hover:text-white transition-colors py-2">
            Creators
          </Link>
          {user && (
            <Link to="/my-projects" className={`transition-colors py-2 font-medium ${location.pathname === '/my-projects' ? 'text-purple-light' : 'text-white/70 hover:text-white'}`}>
              {user.role === 'creator' ? 'My Projects' : 'Dashboard'}
            </Link>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-3 py-2 border-t border-white/5 mt-2 pt-4">
                <div className="w-8 h-8 rounded-full bg-purple/20 border border-purple/40 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-purple">{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-left text-red-400/70 hover:text-red-400 transition-colors py-2 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="mt-2 px-6 py-3 border border-white/15 text-white text-sm font-medium rounded-full text-center transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full text-center transition-all duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
