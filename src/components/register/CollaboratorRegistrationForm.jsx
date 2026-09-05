import { useState } from 'react'

const COLLABORATOR_DEPARTMENTS = [
  'All',
  'Performance',
  'Direction',
  'Writing',
  'Production',
  'Camera',
  'Lighting',
  'Art',
  'Sound',
  'Post',
  'VFX',
  'Media',
]

const COLLABORATOR_SKILL_GROUPS = [
  {
    department: 'Performance',
    skills: [
      'Acting',
      'Voice Acting',
      'Stunt Performance',
      'Dance & Choreography',
    ],
  },
  {
    department: 'Direction',
    skills: [
      'Assistant Direction',
      'Script Supervision',
      'Casting',
    ],
  },
  {
    department: 'Writing',
    skills: [
      'Screenwriting',
      'Story Development',
      'Dialogue Writing',
    ],
  },
  {
    department: 'Production',
    skills: [
      'Production',
      'Production Management',
      'Line Production',
      'Production Coordination',
      'Location Management',
    ],
  },
  {
    department: 'Camera',
    skills: [
      'Cinematography',
      'Camera Operation',
      'Camera Assistance',
      'Focus Pulling',
      'Drone Cinematography',
      'Photography',
    ],
  },
  {
    department: 'Lighting',
    skills: [
      'Lighting',
      'Gaffer',
      'Grip',
      'Key Grip',
    ],
  },
  {
    department: 'Art',
    skills: [
      'Production Design',
      'Art Direction',
      'Set Design',
      'Set Decoration',
      'Props',
      'Costume Design',
      'Makeup',
      'Hair Styling',
    ],
  },
  {
    department: 'Sound',
    skills: [
      'Sound Recording',
      'Sound Design',
      'Boom Operation',
      'Audio Editing',
      'Foley',
      'Music',
    ],
  },
  {
    department: 'Post',
    skills: [
      'Video Editing',
      'Color Grading',
      'Motion Graphics',
      'Subtitling',
    ],
  },
  {
    department: 'VFX',
    skills: [
      'VFX',
      'Compositing',
      '3D',
      'Animation',
    ],
  },
  {
    department: 'Media',
    skills: [
      'BTS Photography',
      'Behind-the-Scenes Video',
      'Social Media Content',
      'Poster & Graphic Design',
    ],
  },
]

const ALL_COLLABORATOR_SKILLS = COLLABORATOR_SKILL_GROUPS.flatMap((g) => g.skills)

const POPULAR_COLLABORATOR_SKILLS = [
  'Acting',
  'Cinematography',
  'Video Editing',
  'Screenwriting',
  'Sound Design',
  'Photography',
  'Production',
  'Production Design',
]

const EXPERIENCE_LEVELS = [
  'Beginner',
  'Student',
  'Intermediate',
  'Professional',
]

const AVAILABILITY_OPTIONS = [
  {
    value: 'Available',
    label: 'Available',
    desc: 'Ready for new productions',
    dotColor: 'bg-emerald-400',
    activeBorder: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },
  {
    value: 'Limited Availability',
    label: 'Limited',
    desc: 'Part-time / selective',
    dotColor: 'bg-amber-400',
    activeBorder: 'border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
  },
  {
    value: 'Unavailable',
    label: 'Unavailable',
    desc: 'Currently booked on set',
    dotColor: 'bg-slate-400',
    activeBorder: 'border-slate-500/60 bg-slate-500/10 text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.15)]',
  },
]

export default function CollaboratorRegistrationForm({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  onBack,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [showAll, setShowAll] = useState(false)

  const selectedSkills = form.skills || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }))
  }

  const addSkill = (skill) => {
    setForm((prev) => {
      const current = prev.skills || []
      if (current.includes(skill) || current.length >= 8) {
        return prev
      }
      return { ...prev, skills: [...current, skill] }
    })
  }

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      removeSkill(skill)
    } else if (selectedSkills.length < 8) {
      addSkill(skill)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, WebP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be less than 5MB.')
      return
    }

    if (form.photoPreview) {
      URL.revokeObjectURL(form.photoPreview)
    }

    const url = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, photo: file, photoPreview: url }))
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validExtensions = ['.pdf', '.doc', '.docx']
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()

    if (!validExtensions.includes(fileExt)) {
      alert('Please select a PDF or DOCX file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Resume file size must be less than 10MB.')
      return
    }

    setForm((prev) => ({ ...prev, resume: file }))
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Top Header Card */}
      <div className="bg-[#111118] rounded-2xl p-6 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Role Chip + Switcher */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.06]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-emerald-400">
              Collaborator
            </span>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-white/50 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Change role
          </button>
        </div>

        {/* Form Title */}
        <div className="mb-8">
          <h1 className="font-['Fraunces',_serif] text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white mb-2">
            Find roles. Join productions. Build credits.
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Show filmmakers what you do and when you're available.
          </p>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="mb-8 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* ── Section 01: Account & Production Base ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                01
              </span>
              <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/40">
                Account &amp; Production Base
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="collab-name" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="collab-name"
                  type="text"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  placeholder="Roger Deakins"
                  required
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="collab-phone" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Phone <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="collab-phone"
                  type="tel"
                  name="phone"
                  value={form.phone || ''}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="collab-email" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="collab-email"
                  type="email"
                  name="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  placeholder="crew@production.com"
                  required
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="collab-location" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Location <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="collab-location"
                  type="text"
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  placeholder="Pune, Maharashtra"
                  required
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
                <p className="text-[11px] text-white/35 mt-1">
                  Where are you primarily available to work?
                </p>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="collab-password" className="block text-xs font-semibold text-white/70 mb-1.5">
                Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="collab-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password || ''}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-11 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-white/20 outline-none transition-all focus:border-emerald-500/60 focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Section 02: Your Craft ── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  02
                </span>
                <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/40">
                  Your Craft
                </h2>
              </div>
              <span className="text-[11px] text-white/40 tabular-nums">
                {selectedSkills.length} / 8 selected
              </span>
            </div>

            {/* Section Copy */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-white/70">
                Skills <span className="text-emerald-400">* (at least 1 required)</span>
              </label>
              <p className="text-xs text-white/45">
                Choose the filmmaking skills you specialize in. Select up to 8 skills.
              </p>
            </div>

            {/* Compact Tag Selector Container */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 sm:p-3 transition-colors focus-within:border-emerald-500/60 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Removable Selected Tags */}
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                      className="text-emerald-400/60 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}

                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                  placeholder={
                    selectedSkills.length === 0
                      ? 'Search and select skills...'
                      : selectedSkills.length < 8
                      ? 'Search skills...'
                      : 'Max 8 skills selected'
                  }
                  disabled={selectedSkills.length >= 8 && !searchQuery}
                  className="flex-1 min-w-[140px] bg-transparent text-xs text-white placeholder-white/30 outline-none py-1 px-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Department Filters */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35">
                  Departments
                </span>
                {selectedDepartment !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedDepartment('All')}
                    className="text-[11px] text-emerald-400 hover:text-white transition-colors"
                  >
                    Reset to All
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {COLLABORATOR_DEPARTMENTS.map((dept) => {
                  const isActive = selectedDepartment === dept
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setSelectedDepartment(dept)}
                      aria-pressed={isActive}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 ${
                        isActive
                          ? 'bg-[#6239BF] border-[#6239BF] text-white shadow-[0_0_10px_rgba(98,57,191,0.3)] font-semibold'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {dept}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Available Skills Area */}
            {(() => {
              const departmentSkills =
                selectedDepartment === 'All'
                  ? ALL_COLLABORATOR_SKILLS
                  : COLLABORATOR_SKILL_GROUPS.find((g) => g.department === selectedDepartment)?.skills || []

              const isSearching = searchQuery.trim().length > 0

              let displayedSkills = []
              if (isSearching) {
                const q = searchQuery.trim().toLowerCase()
                displayedSkills = departmentSkills.filter((s) => s.toLowerCase().includes(q))
              } else if (selectedDepartment === 'All') {
                displayedSkills = showAll ? ALL_COLLABORATOR_SKILLS : POPULAR_COLLABORATOR_SKILLS
              } else {
                displayedSkills = departmentSkills
              }

              return (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/35">
                      {isSearching
                        ? `Matching Skills (${displayedSkills.length})`
                        : selectedDepartment === 'All'
                        ? (showAll ? `All Skills (${displayedSkills.length})` : 'Popular Skills')
                        : `${selectedDepartment} Skills (${displayedSkills.length})`}
                    </span>

                    {!isSearching && selectedDepartment === 'All' && (
                      <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="text-xs font-semibold text-emerald-400 hover:text-white inline-flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400"
                      >
                        <span>{showAll ? 'Show less ↑' : 'Show more ↓'}</span>
                      </button>
                    )}
                  </div>

                  {displayedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {displayedSkills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill)
                        const isMaxed = selectedSkills.length >= 8 && !isSelected

                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            disabled={isMaxed}
                            aria-pressed={isSelected}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : isMaxed
                                ? 'bg-white/[0.01] border-white/5 text-white/25 cursor-not-allowed opacity-50'
                                : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/25 hover:text-white hover:bg-white/[0.05]'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            <span>{skill}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-2 text-xs text-white/40 flex items-center justify-between">
                      <span>
                        {selectedDepartment !== 'All'
                          ? 'No matching skills in this department.'
                          : 'No matching skills found.'}
                      </span>
                      {selectedDepartment !== 'All' && (
                        <button
                          type="button"
                          onClick={() => setSelectedDepartment('All')}
                          className="text-xs text-emerald-400 hover:text-white underline underline-offset-2 transition-colors ml-2"
                        >
                          View all skills
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Experience level */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/70 mb-1.5">
                Experience Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = form.experience_level === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, experience_level: level }))}
                      aria-pressed={isSelected}
                      className={`py-3 px-3 rounded-xl text-xs font-medium border text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
                        isSelected
                          ? 'bg-[#6239BF]/20 border-[#6239BF] text-white shadow-[0_0_12px_rgba(98,57,191,0.3)] font-semibold'
                          : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Section 03: Availability ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                03
              </span>
              <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/40">
                Current Availability <span className="text-emerald-400">*</span>
              </h2>
            </div>

            <p className="text-xs text-white/50">
              Let filmmakers know if you are actively open to cast/crew opportunities.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const isSelected = (form.availability || 'Available') === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, availability: opt.value }))}
                    aria-pressed={isSelected}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 ${
                      isSelected
                        ? opt.activeBorder
                        : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                      <span className="text-xs font-semibold">{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-white/40 leading-snug">
                      {opt.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Section 04: Credentials & Headshot ── */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                04
              </span>
              <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/40">
                Credentials &amp; Headshot
              </h2>
            </div>

            {/* Profile photo */}
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Profile Photo / Headshot
              </label>
              <p className="text-xs text-white/45 mb-2.5">
                Optional. A clear headshot helps filmmakers recognize you.
              </p>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {form.photoPreview ? (
                    <img src={form.photoPreview} alt="Headshot Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>

                <label className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/10 border-dashed rounded-xl cursor-pointer text-center hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-colors">
                  <span className="text-xs font-semibold text-white/60">
                    {form.photo ? form.photo.name : 'Upload headshot (JPG, PNG, WebP — Max 5MB)'}
                  </span>
                  <input
                    type="file"
                    name="photo"
                    onChange={handlePhotoChange}
                    accept="image/*"
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Resume upload */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Resume / CV
              </label>
              <p className="text-xs text-white/45 mb-2.5">
                Optional. Stored securely and shared with production creators when you apply.
              </p>

              <label className="block px-4 py-3.5 bg-white/[0.03] border border-white/10 border-dashed rounded-xl cursor-pointer text-center hover:border-emerald-500/60 hover:bg-emerald-500/5 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-xs font-semibold text-white/70 truncate max-w-[280px] sm:max-w-md">
                    {form.resume ? form.resume.name : 'Upload Resume / CV (PDF, DOCX — Max 10MB)'}
                  </span>
                </div>
                <input
                  type="file"
                  name="resume"
                  onChange={handleResumeChange}
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_30px_rgba(98,57,191,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  <span>Joining FrameWork...</span>
                </>
              ) : (
                <>
                  <span>Join the Production Network</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
