import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProjectsProvider } from './context/ProjectsContext'
import { useAuth } from './context/useAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ExploreProjects from './pages/ExploreProjects'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CreateProjectPage from './pages/CreateProjectPage'
import ProfilePage from './pages/ProfilePage'
import MyProjectsPage from './pages/MyProjectsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppContent() {
  const location = useLocation()
  const isAuth = location.pathname === '/login' || location.pathname === '/register'
  const { loading } = useAuth()

  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    })

    const observe = () => {
      document.querySelectorAll('.reveal').forEach((el) => {
        observer.observe(el)
      })
    }

    observe()
    const interval = setInterval(observe, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  // Show loading screen while restoring Supabase session
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-8 h-8 animate-spin text-purple" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreProjects />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      {!isAuth && <Footer />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <AppContent />
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
