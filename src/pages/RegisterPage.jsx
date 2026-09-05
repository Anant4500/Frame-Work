import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import RoleSelection from '../components/register/RoleSelection'
import CreatorRegistrationForm from '../components/register/CreatorRegistrationForm'
import CollaboratorRegistrationForm from '../components/register/CollaboratorRegistrationForm'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  // Selected role: null | 'creator' | 'user'
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Shared base account fields preserved across role changes
  const [baseForm, setBaseForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    photo: null,
    photoPreview: null,
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
    resume: null,
  })

  // Clean up blob URL on unmount
  const photoPreviewRef = useRef(null)
  photoPreviewRef.current = baseForm.photoPreview

  useEffect(() => {
    return () => {
      if (photoPreviewRef.current) {
        URL.revokeObjectURL(photoPreviewRef.current)
      }
    }
  }, [])

  // Switch role handlers
  const handleSelectRole = (selectedRole) => {
    setError('')
    setRole(selectedRole)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToRoles = () => {
    setError('')
    setRole(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Common error mapper
  const handleAuthError = (err) => {
    console.error('Registration error:', err)
    const msg = err?.message || 'Registration failed'
    if (msg.includes('User already registered') || msg.includes('already been registered')) {
      setError('An account with this email already exists. Please login instead.')
    } else if (msg.includes('Password should be at least')) {
      setError('Password is too weak. Please use at least 6 characters.')
    } else if (msg.includes('Invalid email')) {
      setError('Please enter a valid email address.')
    } else {
      setError(msg)
    }
  }

  // Submit Creator
  const handleCreatorSubmit = async (e) => {
    e.preventDefault()

    if (!baseForm.name?.trim() || !baseForm.email?.trim() || !baseForm.phone?.trim() || !baseForm.location?.trim()) {
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

    setLoading(true)
    setError('')

    try {
      const profileData = {
        name: baseForm.name.trim(),
        phone: baseForm.phone.trim(),
        role: 'creator', // Mapped to 'CREATOR' in AuthContext
        bio: creatorForm.bio ? creatorForm.bio.trim() : null,
        location: baseForm.location.trim(),
        experience_level: null,
        availability: null,
      }

      const files = {
        photoFile: baseForm.photo || null,
        resumeFile: null, // Creators do not have resumes
      }

      const result = await register(
        baseForm.email.trim(),
        baseForm.password,
        profileData,
        creatorForm.skills,
        files
      )

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(
          `Account created! We sent a verification link to ${baseForm.email}.`
        )
        setLoading(false)
        return
      }

      // Successful direct signup
      navigate('/')
    } catch (err) {
      handleAuthError(err)
    } finally {
      setLoading(false)
    }
  }

  // Submit Collaborator
  const handleCollabSubmit = async (e) => {
    e.preventDefault()

    if (!baseForm.name?.trim() || !baseForm.email?.trim() || !baseForm.phone?.trim() || !baseForm.location?.trim()) {
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

    setLoading(true)
    setError('')

    try {
      const profileData = {
        name: baseForm.name.trim(),
        phone: baseForm.phone.trim(),
        role: 'user', // Mapped to 'COLLABORATOR' in AuthContext
        bio: null, // Collaborators do not have creator bio
        location: baseForm.location.trim(),
        experience_level: collabForm.experience_level || null,
        availability: collabForm.availability || 'Available',
      }

      const files = {
        photoFile: baseForm.photo || null,
        resumeFile: collabForm.resume || null,
      }

      const result = await register(
        baseForm.email.trim(),
        baseForm.password,
        profileData,
        collabForm.skills,
        files
      )

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(
          `Account created! We sent a verification link to ${baseForm.email}.`
        )
        setLoading(false)
        return
      }

      // Successful direct signup
      navigate('/')
    } catch (err) {
      handleAuthError(err)
    } finally {
      setLoading(false)
    }
  }

  // Show email confirmation success state
  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
        </div>

        <div className="w-full max-w-md bg-[#111118] rounded-2xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <h1 className="font-['Fraunces',_serif] text-2xl font-semibold mb-3 text-white">
            Check your email
          </h1>
          <p className="text-white/50 text-sm leading-relaxed mb-3">
            {successMessage}
          </p>
          <p className="text-xs text-white/40 mb-8">
            Verify your email to finish setting up your FrameWork profile.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)]"
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
    if (typeof updater === 'function') {
      const updated = updater(combinedCreatorForm)
      setBaseForm({
        name: updated.name,
        email: updated.email,
        password: updated.password,
        phone: updated.phone,
        location: updated.location,
        photo: updated.photo,
        photoPreview: updated.photoPreview,
      })
      setCreatorForm({
        skills: updated.skills || [],
        bio: updated.bio || '',
      })
    }
  }

  const setUnifiedCollabForm = (updater) => {
    if (typeof updater === 'function') {
      const updated = updater(combinedCollabForm)
      setBaseForm({
        name: updated.name,
        email: updated.email,
        password: updated.password,
        phone: updated.phone,
        location: updated.location,
        photo: updated.photo,
        photoPreview: updated.photoPreview,
      })
      setCollabForm({
        skills: updated.skills || [],
        experience_level: updated.experience_level || '',
        availability: updated.availability || 'Available',
        resume: updated.resume || null,
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
        <Link to="/" className="inline-flex items-center gap-2.5 group">
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
          className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
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
      <footer className="py-6 text-center text-xs text-white/25">
        &copy; {new Date().getFullYear()} FrameWork. All rights reserved.
      </footer>
    </div>
  )
}
