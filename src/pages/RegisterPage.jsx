import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import RoleSelection from '../components/register/RoleSelection'
import CreatorRegistrationForm from '../components/register/CreatorRegistrationForm'
import CollaboratorRegistrationForm from '../components/register/CollaboratorRegistrationForm'

/**
 * Sanitizes Supabase Auth, network, and rate-limit errors into safe, friendly messages.
 * Never exposes raw backend exceptions or internal error codes to the user.
 */
function getRegisterErrorMessage(err) {
  const msg = (err?.message || '').toLowerCase()
  const status = err?.status

  if (status === 429 || msg.includes('too many') || msg.includes('rate limit')) {
    return 'Too many registration attempts. Please wait a little and try again.'
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Please login instead.'
  }
  if (msg.includes('password should be at least') || msg.includes('weak password')) {
    return 'Password is too weak. Please use at least 6 characters.'
  }
  if (msg.includes('invalid email')) {
    return 'Please enter a valid email address.'
  }
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('networkerror')) {
    return 'Unable to reach the registration service. Check your connection and try again.'
  }
  return 'Unable to create your account right now. Please try again.'
}

export default function RegisterPage() {
  usePageTitle('Register | FrameWork')
  const { register, user } = useAuth()
  const navigate = useNavigate()

  // Selected role: null | 'creator' | 'user'
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const submittingRef = useRef(false)

  // Redirect already authenticated users away from /register
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  // Shared base account fields preserved across role changes
  const [baseForm, setBaseForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
  })

  // Role-specific states
  const [creatorForm, setCreatorForm] = useState({
    skills: [],
    bio: '',
  })

  const [collabForm, setCollabForm] = useState({
    skills: [],
    experience_level: '',
    availability: 'Available',
  })

  // Switch role handlers
  const handleSelectRole = (selectedRole) => {
    if (loading) return
    setError('')
    setRole(selectedRole)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToRoles = () => {
    if (loading) return
    setError('')
    setRole(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Common error mapper
  const handleAuthError = (err) => {
    console.error('Registration error:', err)
    setError(getRegisterErrorMessage(err))
  }

  // Submit Creator
  const handleCreatorSubmit = async (e) => {
    e.preventDefault()

    if (submittingRef.current) return

    const trimmedName = baseForm.name?.trim()
    const trimmedEmail = baseForm.email?.trim()
    const trimmedPhone = baseForm.phone?.trim()
    const trimmedLocation = baseForm.location?.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedLocation) {
      setError('Please fill in all required fields.')
      return
    }
    if (!baseForm.password) {
      setError('Please enter a password.')
      return
    }
    if (baseForm.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!creatorForm.skills || creatorForm.skills.length === 0) {
      setError('Please select at least one creative discipline.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    setError('')

    try {
      const profileData = {
        name: trimmedName,
        phone: trimmedPhone,
        role: 'creator', // Mapped to 'CREATOR' in AuthContext
        bio: creatorForm.bio ? creatorForm.bio.trim() : null,
        location: trimmedLocation,
        experience_level: null,
        availability: null,
      }

      const result = await register(
        trimmedEmail,
        baseForm.password,
        profileData,
        creatorForm.skills
      )

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(
          `Account created! We sent a verification link to ${trimmedEmail}.`
        )
        setLoading(false)
        return
      }

      // Successful direct signup (if email confirmation disabled)
      navigate('/')
    } catch (err) {
      handleAuthError(err)
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  // Submit Collaborator
  const handleCollabSubmit = async (e) => {
    e.preventDefault()

    if (submittingRef.current) return

    const trimmedName = baseForm.name?.trim()
    const trimmedEmail = baseForm.email?.trim()
    const trimmedPhone = baseForm.phone?.trim()
    const trimmedLocation = baseForm.location?.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedLocation) {
      setError('Please fill in all required fields.')
      return
    }
    if (!baseForm.password) {
      setError('Please enter a password.')
      return
    }
    if (baseForm.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!collabForm.skills || collabForm.skills.length === 0) {
      setError('Please select at least one skill.')
      return
    }
    if (!collabForm.availability) {
      setError('Please select your availability.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    setError('')

    try {
      const profileData = {
        name: trimmedName,
        phone: trimmedPhone,
        role: 'user', // Mapped to 'COLLABORATOR' in AuthContext
        bio: null, // Collaborators do not have creator bio at registration
        location: trimmedLocation,
        experience_level: collabForm.experience_level || null,
        availability: collabForm.availability || 'Available',
      }

      const result = await register(
        trimmedEmail,
        baseForm.password,
        profileData,
        collabForm.skills
      )

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(
          `Account created! We sent a verification link to ${trimmedEmail}.`
        )
        setLoading(false)
        return
      }

      // Successful direct signup (if email confirmation disabled)
      navigate('/')
    } catch (err) {
      handleAuthError(err)
    } finally {
      submittingRef.current = false
      setLoading(false)
    }
  }

  // Prevent flash of registration form while redirect effect executes for authenticated users
  if (user) return null

  // Show email confirmation success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
        </div>

        <div
          role="status"
          aria-live="polite"
          className="w-full max-w-md bg-[#111118] rounded-2xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center"
        >
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide mb-3 text-white leading-none">
            Check your email
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            {successMessage}
          </p>
          <p className="text-xs text-white/50 mb-8">
            {role === 'creator'
              ? "After verifying your email, you'll continue to your Profile where you can add your profile photo."
              : "After verifying your email, you'll continue to your Profile where you can add your profile photo and PDF resume."}
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Unified form object passed to forms
  const combinedCreatorForm = {
    ...baseForm,
    ...creatorForm,
  }

  const combinedCollabForm = {
    ...baseForm,
    ...collabForm,
  }

  const setUnifiedCreatorForm = (updater) => {
    if (error) setError('')
    if (typeof updater === 'function') {
      const updated = updater(combinedCreatorForm)
      setBaseForm({
        name: updated.name,
        email: updated.email,
        password: updated.password,
        phone: updated.phone,
        location: updated.location,
      })
      setCreatorForm({
        skills: updated.skills || [],
        bio: updated.bio || '',
      })
    }
  }

  const setUnifiedCollabForm = (updater) => {
    if (error) setError('')
    if (typeof updater === 'function') {
      const updated = updater(combinedCollabForm)
      setBaseForm({
        name: updated.name,
        email: updated.email,
        password: updated.password,
        phone: updated.phone,
        location: updated.location,
      })
      setCollabForm({
        skills: updated.skills || [],
        experience_level: updated.experience_level || '',
        availability: updated.availability || 'Available',
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-between relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[700px] sm:w-[900px] h-[500px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-[#6239BF]/8 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
      </div>

      {/* Distraction-Free Auth Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-6 sm:py-8 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          <img
            src="/images/framework-logo.png"
            alt=""
            aria-hidden="true"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Frame<span className="text-purple-light">Work</span>
          </span>
        </Link>

        <Link
          to="/login"
          className="text-xs font-semibold text-white/50 hover:text-white transition-colors rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Sign In &rarr;
        </Link>
      </header>

      {/* Main Registration Content */}
      <main className="flex-1 flex items-center justify-center py-6 sm:py-10 pb-16">
        {role === null && (
          <div className="w-full transition-opacity duration-300">
            <RoleSelection onSelect={handleSelectRole} />
          </div>
        )}

        {role === 'creator' && (
          <div className="w-full transition-all duration-300">
            <CreatorRegistrationForm
              form={combinedCreatorForm}
              setForm={setUnifiedCreatorForm}
              onSubmit={handleCreatorSubmit}
              loading={loading}
              error={error}
              onBack={handleBackToRoles}
            />
          </div>
        )}

        {role === 'user' && (
          <div className="w-full transition-all duration-300">
            <CollaboratorRegistrationForm
              form={combinedCollabForm}
              setForm={setUnifiedCollabForm}
              onSubmit={handleCollabSubmit}
              loading={loading}
              error={error}
              onBack={handleBackToRoles}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-white/35">
        &copy; {new Date().getFullYear()} FrameWork. All rights reserved.
      </footer>
    </div>
  )
}
