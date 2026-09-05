import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'
import RolePickerModal from '../components/project/RolePickerModal'

const genreOptions = ['Drama', 'Thriller', 'Comedy', 'Sci-Fi', 'Action', 'Horror', 'Romance', 'Mystery', 'Documentary']
const locationOptions = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata']

function clampToMaxNonWhitespace(text, maxNonWhitespace = 1000) {
  if (!text) return ''
  let count = 0
  let result = ''
  for (const char of text) {
    if (/\s/.test(char)) {
      result += char
    } else {
      if (count < maxNonWhitespace) {
        count++
        result += char
      }
    }
  }
  return result
}

function CreateProjectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    logline: '',
    description: '',
    genre: '',
    location: '',
    budget: '',
    timeline: '',
    roles: [],
    scriptFile: null,
    scriptFileName: '',
    scriptVisibility: 'ACCEPTED_TEAM',
    thumbnailFile: null,
    thumbnailPreview: null,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Redirect unauthenticated users to login
  if (!user) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-6">
            You need to be logged in to create a project.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02]"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border border-white/10 text-white/60 text-sm font-medium rounded-full transition-all duration-300 hover:border-white/20 hover:text-white"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Collaborator-specific informative prompt
  if (user.role !== 'creator') {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {/* Card */}
          <div className="bg-[#111111] rounded-2xl border border-white/5 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            {/* Top accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500/40 via-emerald-400/60 to-emerald-500/40" />

            <div className="p-8 sm:p-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>

              {/* Role badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Collaborator / Crew
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-center mb-3">
                You're a Collaborator
              </h2>

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed text-center mb-2">
                Your account is registered as a <span className="text-white/80 font-medium">Collaborator</span>. Creating and publishing film projects is available for Creator accounts.
              </p>
              <p className="text-white/35 text-sm leading-relaxed text-center mb-8">
                As a Collaborator, you can browse open projects, apply for roles, and build your portfolio.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/explore"
                  id="collab-explore-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Explore Projects
                </Link>
                <Link
                  to="/my-projects"
                  id="collab-dashboard-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/10 text-white/60 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/[0.03] hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <p className="text-center text-white/20 text-xs mt-6">
            Want to create projects?{' '}
            <Link to="/register" className="text-purple/60 hover:text-purple transition-colors">
              Register a new Creator account
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDescriptionChange = (e) => {
    const clamped = clampToMaxNonWhitespace(e.target.value, 1000)
    setForm((f) => ({ ...f, description: clamped }))
  }

  const handleAddRole = (roleName) => {
    if (form.roles.some((r) => (typeof r === 'string' ? r : r.role).toLowerCase() === roleName.toLowerCase())) {
      return
    }
    setForm((f) => ({
      ...f,
      roles: [...f.roles, { role: roleName, count: 1, experience: 'Intermediate' }],
    }))
  }

  const handleRemoveRole = (index) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.filter((_, i) => i !== index),
    }))
  }

  const handleRoleCountChange = (index, delta) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.map((r, i) => {
        if (i !== index) return r
        const current = typeof r === 'object' ? r.count || 1 : 1
        const newCount = Math.max(1, current + delta)
        return typeof r === 'object' ? { ...r, count: newCount } : { role: r, count: newCount, experience: 'Intermediate' }
      }),
    }))
  }

  const handleRoleExperienceChange = (index, newExp) => {
    setForm((f) => ({
      ...f,
      roles: f.roles.map((r, i) => {
        if (i !== index) return r
        return typeof r === 'object' ? { ...r, experience: newExp } : { role: r, count: 1, experience: newExp }
      }),
    }))
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm((f) => ({ ...f, thumbnailFile: file, thumbnailPreview: url }))
  }

  const handleScriptChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 25 * 1024 * 1024) {
      setToast({ type: 'error', text: 'Script file size must be 25MB or less' })
      return
    }
    setForm((f) => ({ ...f, scriptFile: file, scriptFileName: file.name }))
  }

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.title.trim()) { setToast({ type: 'error', text: 'Project title is required' }); return false }
      if (!form.logline.trim()) { setToast({ type: 'error', text: 'Logline is required' }); return false }
      if (form.logline.length > 90) { setToast({ type: 'error', text: 'Logline must be 90 characters or less' }); return false }
      if (!form.description.trim()) { setToast({ type: 'error', text: 'Description is required' }); return false }
      if (form.description.replace(/\s/g, '').length > 1000) { setToast({ type: 'error', text: 'Description must be 1000 characters or less, excluding spaces' }); return false }
      if (!form.genre) { setToast({ type: 'error', text: 'Please select a genre' }); return false }
      if (!form.location) { setToast({ type: 'error', text: 'Please select a location' }); return false }
    }
    if (step === 2) {
      if (form.roles.length === 0) { setToast({ type: 'error', text: 'Select at least one role' }); return false }
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(s + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1))
  }

  const handlePublish = async () => {
    if (!validateStep(1) || !validateStep(2)) return

    // 0. Verify active authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    const activeUserId = session?.user?.id || user?.id

    if (!activeUserId) {
      setToast({
        type: 'error',
        text: 'Authentication required. No active user session found. Please sign in again.'
      })
      return
    }

    setLoading(true)

    try {
      let posterUrl = null
      let scriptPath = null

      // Step 1A: Upload project poster if a file was selected
      if (form.thumbnailFile) {
        const file = form.thumbnailFile
        const fileExt = file.name.split('.').pop() || 'png'
        const sanitizedFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `${activeUserId}/${sanitizedFileName}`

        const { error: uploadError } = await supabase.storage
          .from('project-posters')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          throw new Error(`[Storage Error] Poster upload failed: ${uploadError.message || JSON.stringify(uploadError)}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from('project-posters')
          .getPublicUrl(filePath)

        posterUrl = publicUrlData?.publicUrl || null
      }

      // Step 1B: Upload project script if a file was selected
      if (form.scriptFile) {
        const file = form.scriptFile
        const sanitizedFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const filePath = `${activeUserId}/${sanitizedFileName}`

        const { error: scriptUploadError } = await supabase.storage
          .from('scripts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (scriptUploadError) {
          throw new Error(`[Storage Error] Script upload failed: ${scriptUploadError.message || JSON.stringify(scriptUploadError)}`)
        }

        scriptPath = filePath
      }

      // Step 2: Insert project record into public.projects
      const projectData = {
        creator_id: activeUserId,
        title: form.title.trim(),
        logline: form.logline.trim(),
        description: form.description.trim(),
        genre: form.genre,
        location: form.location,
        budget: form.budget === '' || form.budget == null ? null : Number(form.budget),
        timeline: form.timeline.trim() || null,
        poster_url: posterUrl,
        script_url: scriptPath,
        script_visibility: form.scriptVisibility || 'ACCEPTED_TEAM',
        status: 'OPEN',
      }

      const { data: createdProject, error: projectError } = await supabase
        .from('projects')
        .insert(projectData)
        .select('id')
        .single()

      if (projectError) {
        throw new Error(`[Database Error] Project creation failed: ${projectError.message || JSON.stringify(projectError)}`)
      }

      if (!createdProject?.id) {
        throw new Error('[Database Error] Project was created but no valid ID was returned.')
      }

      // Step 3: Insert roles into public.project_roles
      if (form.roles && form.roles.length > 0) {
        const rolesToInsert = form.roles.map((item) => {
          const roleName = typeof item === 'string' ? item : item.role
          const count = typeof item === 'object' && item.count ? Math.max(1, Number(item.count)) : 1
          return {
            project_id: createdProject.id,
            role: roleName,
            positions_needed: count,
            positions_filled: 0,
          }
        })

        const { error: rolesError } = await supabase
          .from('project_roles')
          .insert(rolesToInsert)

        if (rolesError) {
          throw new Error(`[Database Error] Adding project roles failed: ${rolesError.message || JSON.stringify(rolesError)}`)
        }
      }

      // Step 4: Success feedback & navigation
      setToast({ type: 'success', text: 'Project published successfully to Supabase!' })
      setTimeout(() => {
        navigate('/my-projects')
      }, 1500)
    } catch (err) {
      console.error('Project publish error:', err)
      const errorMsg = err?.message || (typeof err === 'string' ? err : 'An unexpected error occurred while publishing the project.')
      setToast({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'Team' },
    { num: 3, label: 'Media' },
  ]

  return (
    <section className="relative min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[#08080D] overflow-hidden">
      {/* Subtle purple radial atmosphere behind card */}
      <div
        className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[500px] sm:h-[650px] pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(98,57,191,0.07) 0%, rgba(98,57,191,0.02) 50%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 reveal">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors duration-300 mb-6 group"
          >
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="font-['Fraunces',_serif] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.02em] leading-[1.15] mb-3">
            Create <span className="gradient-text">Project</span>
          </h1>
          <p className="text-white/40 text-lg">
            Publish your film project and find your dream team.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-12 reveal">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <button
                onClick={() => { if (step.num < currentStep) setCurrentStep(step.num) }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-500 ${
                  currentStep === step.num
                    ? 'bg-purple/15 border border-purple/30 text-white'
                    : currentStep > step.num
                    ? 'text-purple-light cursor-pointer hover:bg-white/5'
                    : 'text-white/20 cursor-default'
                }`}
              >
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-500 ${
                  currentStep === step.num
                    ? 'bg-purple text-white shadow-[0_0_15px_rgba(98,57,191,0.4)]'
                    : currentStep > step.num
                    ? 'bg-purple/20 text-purple-light'
                    : 'bg-white/5 text-white/30'
                }`}>
                  {currentStep > step.num ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.num}
                </span>
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-px mx-1 transition-colors duration-500 ${currentStep > step.num ? 'bg-purple/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-6 sm:p-8 lg:p-10 bg-[#111118] border border-white/[0.08] border-t-white/[0.12]"
          style={{
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(98, 57, 191, 0.05)',
          }}
        >

          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label htmlFor="create-title" className="block text-sm font-medium text-white/60 mb-2">Project Title *</label>
                <input
                  id="create-title"
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Echoes of Amber"
                  maxLength={100}
                  className="w-full px-4 py-3.5 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)]"
                />
              </div>

              <div>
                <label htmlFor="create-logline" className="block text-sm font-medium text-white/60 mb-2">Logline *</label>
                <textarea
                  id="create-logline"
                  name="logline"
                  value={form.logline}
                  onChange={handleChange}
                  placeholder="A short, compelling pitch for your project..."
                  rows={2}
                  maxLength={90}
                  className="w-full px-4 py-3 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)] resize-none"
                />
                <p className="text-white/20 text-xs text-right mt-1">{form.logline.length}/90</p>
              </div>

              <div>
                <label htmlFor="create-description" className="block text-sm font-medium text-white/60 mb-2">Description *</label>
                <textarea
                  id="create-description"
                  name="description"
                  value={form.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your project, story, vision, or what collaborators should know..."
                  rows={6}
                  className="w-full px-4 py-3.5 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)] resize-none"
                />
                <p className="text-white/20 text-xs text-right mt-1">{form.description.replace(/\s/g, '').length}/1000</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="create-genre" className="block text-sm font-medium text-white/60 mb-2">Genre *</label>
                  <div className="relative">
                    <select
                      id="create-genre"
                      name="genre"
                      value={form.genre}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3.5 pr-10 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)] cursor-pointer"
                    >
                      <option value="" className="bg-[#0C0C11]">Select genre</option>
                      {genreOptions.map((g) => (
                        <option key={g} value={g} className="bg-[#0C0C11]">{g}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="create-location" className="block text-sm font-medium text-white/60 mb-2">Location *</label>
                  <div className="relative">
                    <select
                      id="create-location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3.5 pr-10 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)] cursor-pointer"
                    >
                      <option value="" className="bg-[#0C0C11]">Select location</option>
                      {locationOptions.map((l) => (
                        <option key={l} value={l} className="bg-[#0C0C11]">{l}</option>
                      ))}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="create-budget" className="block text-sm font-medium text-white/60 mb-2">Budget (₹)</label>
                  <input
                    id="create-budget"
                    type="number"
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="e.g. 500000"
                    min="0"
                    className="w-full px-4 py-3.5 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)]"
                  />
                </div>

                <div>
                  <label htmlFor="create-timeline" className="block text-sm font-medium text-white/60 mb-2">Timeline</label>
                  <input
                    id="create-timeline"
                    type="text"
                    name="timeline"
                    value={form.timeline}
                    onChange={handleChange}
                    placeholder="e.g. Shooting Nov 2026 / 3 Months"
                    className="w-full px-4 py-3.5 bg-[#0C0C11] border border-white/[0.11] rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple focus:ring-1 focus:ring-purple/20 focus:shadow-[0_0_15px_rgba(98,57,191,0.12)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team & Roles */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white/60">
                    Roles Required *
                  </label>
                  {form.roles.length > 0 && (
                    <span className="text-xs text-purple-light font-medium">
                      {form.roles.length} {form.roles.length === 1 ? 'role' : 'roles'} added
                    </span>
                  )}
                </div>
                <p className="text-white/25 text-xs mb-5">
                  Choose the creative and technical talent needed for your production.
                </p>

                {/* List of Added Roles */}
                {form.roles.length > 0 && (
                  <div className="space-y-3 mb-5">
                    {form.roles.map((item, index) => {
                      const roleName = typeof item === 'string' ? item : item.role
                      const count = typeof item === 'object' && item.count ? item.count : 1
                      const experience = typeof item === 'object' && item.experience ? item.experience : 'Intermediate'

                      return (
                        <div
                          key={`${roleName}-${index}`}
                          className="p-4 sm:p-5 bg-[#0C0C11] border border-white/[0.11] rounded-2xl transition-all duration-300 hover:border-white/[0.18]"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-2 h-2 rounded-full bg-purple" />
                              <h4 className="text-sm sm:text-base font-semibold text-white leading-snug">
                                {roleName}
                              </h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveRole(index)}
                              className="text-xs text-red-400/70 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10 shrink-0"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.06]">
                            {/* Count Control */}
                            <div>
                              <span className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                                Count
                              </span>
                              <div className="inline-flex items-center bg-[#111118] border border-white/[0.10] rounded-xl overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => handleRoleCountChange(index, -1)}
                                  disabled={count <= 1}
                                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base font-medium"
                                  aria-label="Decrease count"
                                >
                                  −
                                </button>
                                <span className="w-12 text-center text-sm font-semibold text-white">
                                  {count}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRoleCountChange(index, 1)}
                                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors text-base font-medium"
                                  aria-label="Increase count"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Experience Level Selector */}
                            <div>
                              <span className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                                Experience Level
                              </span>
                              <div className="relative">
                                <select
                                  value={experience}
                                  onChange={(e) => handleRoleExperienceChange(index, e.target.value)}
                                  className="w-full appearance-none px-3.5 py-2.5 bg-[#111118] border border-white/[0.10] rounded-xl text-sm text-white outline-none transition-all focus:border-purple cursor-pointer pr-9"
                                >
                                  {['Beginner', 'Student', 'Intermediate', 'Professional'].map((lvl) => (
                                    <option key={lvl} value={lvl} className="bg-[#111118]">
                                      {lvl}
                                    </option>
                                  ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add Role / Add Another Role Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsRolePickerOpen(true)}
                  className="w-full py-4 px-5 bg-[#0C0C11] hover:bg-[#0E0E14] border border-dashed border-white/[0.15] hover:border-purple/50 rounded-2xl text-sm font-medium text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span className="w-6 h-6 rounded-full bg-purple/20 text-purple-light group-hover:bg-purple group-hover:text-white flex items-center justify-center transition-all duration-200 text-base">
                    +
                  </span>
                  <span>{form.roles.length === 0 ? 'Add Role' : 'Add Another Role'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Poster */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Project Poster</label>
                <div className="flex items-start gap-5">
                  <div className="w-24 h-36 rounded-xl bg-[#0C0C11] border border-white/[0.11] overflow-hidden shrink-0 flex items-center justify-center">
                    {form.thumbnailPreview ? (
                      <img src={form.thumbnailPreview} alt="Project Poster" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block px-4 py-3.5 bg-[#0C0C11] border border-white/[0.11] border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-purple/40 hover:bg-[#0E0E14] text-center">
                      <span className="text-sm text-white/40">
                        {form.thumbnailFile ? form.thumbnailFile.name : 'Upload project poster (JPG, PNG)'}
                      </span>
                      <input type="file" onChange={handleThumbnailChange} accept="image/*" className="sr-only" />
                    </label>
                    <p className="text-xs text-white/25 mt-2">Upload a portrait film poster. Recommended size: 1200 × 1800 px (2:3).</p>
                  </div>
                </div>
              </div>

              {/* Script Upload */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">Script (PDF)</label>
                <label className="flex items-center gap-4 px-5 py-5 bg-[#0C0C11] border border-white/[0.11] border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-purple/40 hover:bg-[#0E0E14]">
                  <div className="w-12 h-12 rounded-xl bg-purple/10 flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">
                      {form.scriptFileName || 'Upload your script'}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">PDF format, max 25MB</p>
                  </div>
                  <input type="file" onChange={handleScriptChange} accept=".pdf" className="sr-only" />
                </label>
              </div>

              {/* Script Access Privacy Selector */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Script Access</label>
                  <p className="text-xs text-white/40">Control who can read and preview your project's screenplay.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'ACCEPTED_TEAM',
                      label: 'Accepted Team Only',
                      desc: 'Only confirmed team members can view the screenplay.',
                      badge: 'Default',
                    },
                    {
                      value: 'APPLICANTS',
                      label: 'Applicants & Team',
                      desc: 'Collaborators with a pending or accepted application can view the screenplay.',
                    },
                    {
                      value: 'PUBLIC',
                      label: 'Anyone Viewing Project',
                      desc: 'Anyone who can view this project can read the screenplay.',
                    },
                  ].map((tier) => {
                    const isSelected = form.scriptVisibility === tier.value
                    return (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, scriptVisibility: tier.value }))}
                        className={`p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#18122B] border-purple shadow-[0_0_20px_rgba(98,57,191,0.25)]'
                            : 'bg-[#0C0C11] border-white/[0.08] hover:border-white/20 hover:bg-[#0E0E14]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                              {tier.label}
                            </span>
                            {tier.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple/20 text-purple-light border border-purple/30">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/45 leading-relaxed">{tier.desc}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                          <span className={`w-2.5 h-2.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-purple bg-purple' : 'border-white/30'
                          }`}>
                            {isSelected && <span className="w-1 h-1 rounded-full bg-white" />}
                          </span>
                          <span className={isSelected ? 'text-purple-light font-medium' : 'text-white/30'}>
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview Summary */}
              <div className="mt-4 p-5 bg-[#0C0C11] border border-white/[0.08] rounded-xl">
                <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Project Summary</h4>
                <div className="space-y-2.5">
                  <SummaryRow label="Title" value={form.title} />
                  <SummaryRow label="Logline" value={form.logline} />
                  <SummaryRow label="Description" value={form.description} />
                  <SummaryRow label="Genre" value={form.genre} />
                  <SummaryRow label="Location" value={form.location} />
                  {form.budget && <SummaryRow label="Budget" value={`₹${Number(form.budget).toLocaleString('en-IN')}`} />}
                  {form.timeline && <SummaryRow label="Timeline" value={form.timeline} />}
                  <SummaryRow label="Roles" value={form.roles.map(r => typeof r === 'string' ? r : (r.count > 1 ? `${r.role} (×${r.count})` : r.role)).join(', ')} />
                  <SummaryRow label="Script" value={form.scriptFileName || 'Default sample'} />
                  <SummaryRow label="Script Access" value={form.scriptVisibility === 'PUBLIC' ? 'Anyone Viewing Project' : form.scriptVisibility === 'APPLICANTS' ? 'Applicants & Team' : 'Accepted Team Only'} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/[0.08]">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white/50 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Next Step
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3.5 bg-purple text-white text-sm font-bold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Publish Project
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl toast-enter flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-purple/10 border-purple/20 text-purple-light'
        }`}>
          {toast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}

      {/* Role Picker Modal */}
      <RolePickerModal
        isOpen={isRolePickerOpen}
        onClose={() => setIsRolePickerOpen(false)}
        onSelectRole={handleAddRole}
        selectedRoleNames={form.roles.map((r) => (typeof r === 'string' ? r : r.role))}
      />
    </section>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-white/25 w-16 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white/60">{value || '—'}</span>
    </div>
  )
}

export default CreateProjectPage
