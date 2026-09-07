import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { usePageTitle } from './hooks/usePageTitle'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ExploreProjects from './pages/ExploreProjects'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CreateProjectPage from './pages/CreateProjectPage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import MyProjectsPage from './pages/MyProjectsPage'
import NotificationsPage from './pages/NotificationsPage'
import NotFoundPage from './pages/NotFoundPage'
import ErrorBoundary from './components/ErrorBoundary'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AuthProfileErrorState({ onRetry, onSignOut }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
      </div>

      <main
        role="alert"
        aria-live="assertive"
        className="w-full max-w-md bg-[#111118] rounded-2xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide mb-3 text-white">
          Unable to load your account
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          We couldn't connect to your profile right now. Check your connection and try again.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 px-6 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
          >
            Retry Connection
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-3 px-6 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] text-sm font-medium rounded-xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}

function AuthProfileMissingState({ onRetry, onSignOut }) {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
      </div>

      <main
        role="alert"
        aria-live="assertive"
        className="w-full max-w-md bg-[#111118] rounded-2xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>

        <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide mb-3 text-white">
          We couldn't find your account profile
        </h1>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          Try again, or sign out. If this continues, contact the FrameWork team for assistance.
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 px-6 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-3 px-6 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] text-sm font-medium rounded-xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
          >
            Sign Out
          </button>
        </div>
      </main>
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const { loading, authStatus, retryProfile, logout } = useAuth()

  // Set safe title for global auth interception states (loading/error)
  usePageTitle(
    loading
      ? 'Loading | FrameWork'
      : (authStatus === 'profile-error' || authStatus === 'profile-missing'
        ? 'Account Error | FrameWork'
        : null)
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Reveal Fail-Safe: if IntersectionObserver is unsupported, keep all content visible
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('is-visible')
      })
      return
    }

    // Progressive enhancement: activate reveal hide styling only after observer is ready
    document.documentElement.classList.add('js-reveal')

    // Single observer for this lifecycle: unobserves once element is visible
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const observeElement = (el) => {
      if (el && el.classList && el.classList.contains('reveal') && !el.classList.contains('is-visible')) {
        observer.observe(el)
      }
    }

    // Observe initial unrevealed elements
    document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
      observer.observe(el)
    })

    // Scoped MutationObserver: detects asynchronously mounted .reveal elements without polling
    // Only observes childList & subtree; ignores attributes so adding 'is-visible' does not trigger loops
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            observeElement(node)
            node.querySelectorAll?.('.reveal:not(.is-visible)').forEach((child) => {
              observer.observe(child)
            })
          }
        })
      })
    })

    const rootEl = document.getElementById('root') || document.body
    mutationObserver.observe(rootEl, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  // 1. Show loading screen while restoring Supabase session or retrying profile
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-purple motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          <span className="sr-only">Loading FrameWork...</span>
        </div>
      </div>
    )
  }

  // 2. Central error screen if session is valid but profile failed transiently
  if (authStatus === 'profile-error') {
    return <AuthProfileErrorState onRetry={retryProfile} onSignOut={logout} />
  }

  // 3. Central missing-profile screen if session is valid but profile row is missing
  if (authStatus === 'profile-missing') {
    return <AuthProfileMissingState onRetry={retryProfile} onSignOut={logout} />
  }

  // 4. Normal application shell
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreProjects />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<PublicProfilePage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
