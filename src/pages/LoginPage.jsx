import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

/**
 * Validates that a return destination is a safe, internal route.
 * Rejects external URLs, protocol-relative paths, javascript URIs, and non-strings.
 */
function getSafeReturnDestination(from) {
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    return from
  }
  return '/'
}

/**
 * Sanitizes Supabase Auth, network, and rate-limit errors into friendly, safe messages.
 * Never exposes raw backend exceptions or internal error codes to the user.
 */
function getLoginErrorMessage(err) {
  const msg = (err?.message || '').toLowerCase()
  const status = err?.status

  if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
    return 'Too many sign-in attempts. Please wait a little and try again.'
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email address before logging in.'
  }
  if (msg.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('networkerror')) {
    return 'Unable to reach the sign-in service. Check your connection and try again.'
  }
  return 'Unable to sign in right now. Please try again.'
}

function LoginPage() {
  usePageTitle('Login | FrameWork')
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const safeDestination = getSafeReturnDestination(location.state?.from)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submittingRef = useRef(false)

  // Redirect already authenticated users away from /login
  useEffect(() => {
    if (user) {
      navigate(safeDestination, { replace: true })
    }
  }, [user, navigate, safeDestination])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Synchronous duplicate submit protection
    if (submittingRef.current) return

    const trimmedEmail = form.email.trim()
    if (!trimmedEmail || !form.password) {
      setError('Please fill in all fields')
      return
    }

    submittingRef.current = true
    setLoading(true)
    setError('')

    try {
      await login(trimmedEmail, form.password)
      navigate(safeDestination, { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(getLoginErrorMessage(err))
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  // Prevent flash of login form while redirect effect executes for authenticated users
  if (user) return null

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-28">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/images/auth-bg.png" alt="" className="w-full h-full object-cover blur-sm opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111111] rounded-2xl p-6 sm:p-10 border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 mb-6 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
            >
              <img
                src="/images/framework-logo.png"
                alt=""
                aria-hidden="true"
                className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-['Bebas_Neue',_sans-serif] text-2xl tracking-wider">
                Frame<span className="text-purple">Work</span>
              </span>
            </Link>
            <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl font-normal tracking-wide leading-none mb-2">Welcome Back</h1>
            <p className="text-white/60 text-sm">Sign in to continue your filmmaking journey</p>
          </div>

          {/* Error */}
          {error && (
            <div
              id="login-error"
              role="alert"
              className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center break-words"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white/60 mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="you@example.com"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(98,57,191,0.1)] focus-visible:border-purple/60 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-white/60 mb-2">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="••••••••"
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full pl-4 pr-11 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(98,57,191,0.1)] focus-visible:border-purple/60 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A] rounded p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-purple text-white font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

          {/* Register Link */}
          <p className="text-center text-white/60 text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-purple hover:text-purple-light transition-colors font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
