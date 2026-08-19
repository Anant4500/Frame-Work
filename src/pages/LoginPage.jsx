import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      console.error('Login error:', err)
      const msg = err.message || 'Login failed'
      if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please verify your email address before logging in.')
      } else if (msg.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-28">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/images/auth-bg.png" alt="" className="w-full h-full object-cover blur-sm opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111111] rounded-2xl p-8 sm:p-10 border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-purple rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight font-[Montserrat]">
                Frame<span className="text-purple">Work</span>
              </span>
            </Link>
            <h1 className="font-[Montserrat] text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-white/40 text-sm">Sign in to continue your filmmaking journey</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white/60 mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple text-white font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/20 text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google */}
          <button className="w-full py-3.5 border border-white/10 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all duration-300 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Register Link */}
          <p className="text-center text-white/30 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-purple hover:text-purple-light transition-colors font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
