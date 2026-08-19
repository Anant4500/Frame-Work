import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

// Skills matching the database records in public.skills
const skillsCollaborator = ['Acting', 'Video Editing', 'Cinematography', 'Music', 'Screenwriting', 'Sound Design', 'Color Grading', 'Animation', 'VFX', 'Photography']
const skillsCreator = ['Direction', 'Screenwriting', 'Production', 'Cinematography', 'Production Design']
const experienceLevels = ['Beginner', 'Student', 'Intermediate', 'Professional']

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('role') // 'role' | 'form'
  const [role, setRole] = useState(null) // 'user' | 'creator'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    skills: [],
    experience: '',
    bio: '',
    resume: null,
    photo: null,
    photoPreview: null,
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter((s) => s !== skill) : [...f.skills, skill],
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (e.target.name === 'photo') {
      const url = URL.createObjectURL(file)
      setForm((f) => ({ ...f, photo: file, photoPreview: url }))
    } else {
      setForm((f) => ({ ...f, resume: file }))
    }
  }

  const handleSelectRole = (r) => {
    setRole(r)
    setTimeout(() => setStep('form'), 300)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in all required fields')
      return
    }
    if (!form.password) {
      setError('Please enter a password')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.skills.length === 0) {
      setError('Please select at least one skill')
      return
    }

    setLoading(true)
    setError('')

    try {
      const profileData = {
        name: form.name,
        phone: form.phone,
        role: role, // 'user' or 'creator' — AuthContext maps to DB format
        bio: form.bio || null,
        experience_level: form.experience || null,
        profile_photo_url: form.photoPreview || null,
        resume_url: null, // File upload handled separately in future
      }

      const result = await register(form.email, form.password, profileData, form.skills)

      if (result.needsEmailConfirmation) {
        setSuccessMessage(
          `Account created! Please check your email (${form.email}) to verify your account before logging in.`
        )
        setLoading(false)
        return
      }

      // Registration successful and no email confirmation needed
      navigate('/')
    } catch (err) {
      console.error('Registration error:', err)
      // Map common Supabase errors to user-friendly messages
      const msg = err.message || 'Registration failed'
      if (msg.includes('User already registered') || msg.includes('already been registered')) {
        setError('An account with this email already exists. Please login instead.')
      } else if (msg.includes('Password should be at least')) {
        setError('Password is too weak. Please use at least 6 characters.')
      } else if (msg.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else if (msg.includes('profile setup failed')) {
        setError(msg)
      } else if (msg.includes('skill setup failed')) {
        setError(msg)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // Show email confirmation success message
  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center relative px-4 py-28">
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <img src="/images/auth-bg.png" alt="" className="w-full h-full object-cover blur-sm opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-[#111111] rounded-2xl p-8 sm:p-10 border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.5)] text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>

            <h2 className="font-[Montserrat] text-xl font-bold mb-3">Check Your Email</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{successMessage}</p>

            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 py-28">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/images/auth-bg.png" alt="" className="w-full h-full object-cover blur-sm opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {step === 'role' ? (
        <RoleSelection onSelect={handleSelectRole} />
      ) : (
        <RegistrationForm
          role={role}
          form={form}
          handleChange={handleChange}
          toggleSkill={toggleSkill}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          onBack={() => { setStep('role'); setRole(null) }}
        />
      )}
    </div>
  )
}

/* ─── Step 1: Role Selection ─── */
function RoleSelection({ onSelect }) {
  const [hoveredRole, setHoveredRole] = useState(null)

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-10">
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
        <h1 className="font-[Montserrat] text-3xl sm:text-4xl font-black mb-3">
          Join <span className="gradient-text">FrameWork</span>
        </h1>
        <p className="text-white/40 text-lg">Choose how you want to collaborate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* User Card */}
        <button
          id="role-user"
          onClick={() => onSelect('user')}
          onMouseEnter={() => setHoveredRole('user')}
          onMouseLeave={() => setHoveredRole(null)}
          className={`group relative bg-[#111111] rounded-2xl p-8 border text-left transition-all duration-500 hover:scale-[1.03] ${
            hoveredRole === 'user'
              ? 'border-purple/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
              : 'border-white/5 hover:border-purple/30'
          }`}
        >
          <div className="w-14 h-14 rounded-xl bg-purple/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-purple/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <svg className="w-7 h-7 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="font-[Montserrat] text-xl font-bold mb-2 group-hover:text-purple-light transition-colors">
            User (Collaborator)
          </h3>
          <p className="text-white/40 text-sm leading-relaxed">
            Join projects as an actor, editor, or crew member
          </p>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Creator Card */}
        <button
          id="role-creator"
          onClick={() => onSelect('creator')}
          onMouseEnter={() => setHoveredRole('creator')}
          onMouseLeave={() => setHoveredRole(null)}
          className={`group relative bg-[#111111] rounded-2xl p-8 border text-left transition-all duration-500 hover:scale-[1.03] ${
            hoveredRole === 'creator'
              ? 'border-purple/50 shadow-[0_0_40px_rgba(139,92,246,0.15)]'
              : 'border-white/5 hover:border-purple/30'
          }`}
        >
          <div className="w-14 h-14 rounded-xl bg-purple/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-purple/20 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <svg className="w-7 h-7 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
            </svg>
          </div>
          <h3 className="font-[Montserrat] text-xl font-bold mb-2 group-hover:text-purple-light transition-colors">
            Creator
          </h3>
          <p className="text-white/40 text-sm leading-relaxed">
            Start projects and build your film team
          </p>
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      <p className="text-center text-white/30 text-sm mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-purple hover:text-purple-light transition-colors font-medium">
          Login
        </Link>
      </p>
    </div>
  )
}

/* ─── Step 2: Registration Form ─── */
function RegistrationForm({ role, form, handleChange, toggleSkill, handleFileChange, handleSubmit, loading, error, onBack }) {
  const skills = role === 'creator' ? skillsCreator : skillsCollaborator

  return (
    <div className="w-full max-w-lg">
      <div className="bg-[#111111] rounded-2xl p-8 sm:p-10 border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
        {/* Back + Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="font-[Montserrat] text-xl font-bold">
              {role === 'creator' ? 'Creator' : 'Collaborator'} Registration
            </h2>
            <p className="text-white/30 text-xs mt-0.5">Fill in your details to get started</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-white/60 mb-2">Name *</label>
            <input
              id="reg-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-white/60 mb-2">Email *</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-white/60 mb-2">Password *</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-white/60 mb-2">Phone *</label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)]"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-3">Skills *</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const active = form.skills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 ${
                      active
                        ? 'bg-purple/20 border-purple text-purple-light shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'border-white/10 text-white/50 hover:border-purple/30 hover:text-white/70'
                    }`}
                  >
                    {skill}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Experience (Collaborator only) */}
          {role === 'user' && (
            <div>
              <label htmlFor="reg-experience" className="block text-sm font-medium text-white/60 mb-2">Experience Level</label>
              <div className="relative">
                <select
                  id="reg-experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full appearance-none px-4 py-3.5 pr-10 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:border-purple/60 cursor-pointer"
                >
                  <option value="" className="bg-[#111]">Select level</option>
                  {experienceLevels.map((level) => (
                    <option key={level} value={level} className="bg-[#111]">{level}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Bio (Creator only) */}
          {role === 'creator' && (
            <div>
              <label htmlFor="reg-bio" className="block text-sm font-medium text-white/60 mb-2">Bio</label>
              <textarea
                id="reg-bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about your filmmaking journey..."
                rows={4}
                maxLength={1500}
                className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] resize-none"
              />
              <p className="text-white/20 text-xs mt-1 text-right">{form.bio.length}/1500</p>
            </div>
          )}

          {/* Resume (Collaborator only) */}
          {role === 'user' && (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Resume</label>
              <label className="flex items-center gap-3 px-4 py-3.5 bg-[#1A1A1A] border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-purple/40 hover:bg-[#1A1A1A]/80">
                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-white/40">
                  {form.resume ? form.resume.name : 'Upload resume (PDF, DOC)'}
                </span>
                <input type="file" name="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" className="sr-only" />
              </label>
            </div>
          )}

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
              <label className="flex-1 px-4 py-3 bg-[#1A1A1A] border border-white/10 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-purple/40 text-center">
                <span className="text-sm text-white/40">
                  {form.photo ? 'Change photo' : 'Upload photo'}
                </span>
                <input type="file" name="photo" onChange={handleFileChange} accept="image/*" className="sr-only" />
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-purple text-white font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple hover:text-purple-light transition-colors font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
