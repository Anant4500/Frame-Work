import { useState } from 'react'
import {
  CREATOR_DISCIPLINES,
  POPULAR_CREATOR_DISCIPLINES,
  MAX_CREATOR_SKILLS,
} from '../../data/profileSkills'

export default function CreatorRegistrationForm({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  onBack,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const selectedSkills = form.skills || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const removeDiscipline = (discipline) => {
    setForm((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((d) => d !== discipline),
    }))
  }

  const addDiscipline = (discipline) => {
    setForm((prev) => {
      const current = prev.skills || []
      if (current.includes(discipline) || current.length >= MAX_CREATOR_SKILLS) {
        return prev
      }
      return { ...prev, skills: [...current, discipline] }
    })
  }

  const toggleDiscipline = (discipline) => {
    if (selectedSkills.includes(discipline)) {
      removeDiscipline(discipline)
    } else if (selectedSkills.length < MAX_CREATOR_SKILLS) {
      addDiscipline(discipline)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Top Header Card */}
      <div className="bg-[#111118] rounded-2xl p-6 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Role Chip + Switcher */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.06]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6239BF]/15 border border-[#6239BF]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF]" />
            <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-purple-light">
              Creator
            </span>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="text-xs font-semibold text-white/60 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Change role
          </button>
        </div>

        {/* Form Title */}
        <div className="mb-8">
          <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl font-normal tracking-wide leading-none text-white mb-2">
            Build films. Assemble teams.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Create your filmmaker identity before launching your first production.
          </p>
        </div>

        {/* Global Error Notice */}
        {error && (
          <div
            id="register-error"
            role="alert"
            className="mb-8 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2.5 break-words"
          >
            <svg className="w-5 h-5 shrink-0 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8" aria-busy={loading}>
          {/* ── Section 01: Account & Base ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6239BF] bg-[#6239BF]/10 px-2 py-0.5 rounded">
                01
              </span>
              <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/50">
                Account &amp; Production Base
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label htmlFor="creator-name" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Full Name <span className="text-purple-light">*</span>
                </label>
                <input
                  id="creator-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Christopher Nolan"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="creator-phone" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Phone <span className="text-purple-light">*</span>
                </label>
                <input
                  id="creator-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="+91 98765 43210"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label htmlFor="creator-email" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Email Address <span className="text-purple-light">*</span>
                </label>
                <input
                  id="creator-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="director@studio.com"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="creator-location" className="block text-xs font-semibold text-white/70 mb-1.5">
                  Location <span className="text-purple-light">*</span>
                </label>
                <input
                  id="creator-location"
                  type="text"
                  name="location"
                  value={form.location || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Pune, Maharashtra"
                  required
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="creator-password" className="block text-xs font-semibold text-white/70 mb-1.5">
                Password <span className="text-purple-light">*</span>
              </label>
              <div className="relative">
                <input
                  id="creator-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  value={form.password || ''}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  aria-describedby={error ? 'register-error' : undefined}
                  className="w-full px-4 py-3 pr-11 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Section 02: Creative Identity ── */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6239BF] bg-[#6239BF]/10 px-2 py-0.5 rounded">
                  02
                </span>
                <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/50">
                  Creative Disciplines
                </h2>
              </div>
              <span className="text-[11px] text-white/50 tabular-nums">
                {selectedSkills.length} / {MAX_CREATOR_SKILLS} selected
              </span>
            </div>

            <p className="text-xs text-white/60">
              Select the filmmaking areas you work in. Choose up to {MAX_CREATOR_SKILLS} <span className="text-purple-light">(at least 1 required)</span>.
            </p>

            {/* Compact Tag Selector Container */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-2.5 sm:p-3 transition-colors focus-within:border-[#6239BF]/60 focus-within:shadow-[0_0_15px_rgba(98,57,191,0.15)]">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Removable Selected Tags */}
                {selectedSkills.map((discipline) => (
                  <span
                    key={discipline}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6239BF]/15 border border-[#6239BF]/35 text-purple-light text-xs font-medium"
                  >
                    <span>{discipline}</span>
                    <button
                      type="button"
                      onClick={() => removeDiscipline(discipline)}
                      disabled={loading}
                      aria-label={`Remove ${discipline}`}
                      className="text-purple-light/60 hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6239BF] rounded p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
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
                  disabled={loading || (selectedSkills.length >= MAX_CREATOR_SKILLS && !searchQuery)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                  placeholder={
                    selectedSkills.length === 0
                      ? 'Search and select disciplines...'
                      : selectedSkills.length < MAX_CREATOR_SKILLS
                      ? 'Search disciplines...'
                      : `Max ${MAX_CREATOR_SKILLS} disciplines selected`
                  }
                  className="flex-1 min-w-[150px] bg-transparent text-xs text-white placeholder:text-white/40 outline-none py-1 px-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Available Options Area */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/40">
                  {searchQuery.trim().length > 0
                    ? `Matching Disciplines (${
                        CREATOR_DISCIPLINES.filter((d) =>
                          d.toLowerCase().includes(searchQuery.trim().toLowerCase())
                        ).length
                      })`
                    : 'Popular Disciplines'}
                </span>
                {searchQuery.trim().length === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAll(!showAll)}
                    disabled={loading}
                    className="text-xs font-semibold text-purple-light hover:text-white inline-flex items-center gap-1 py-0.5 px-1.5 rounded transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6239BF]"
                  >
                    <span>{showAll ? 'Show less ↑' : 'Show more ↓'}</span>
                  </button>
                )}
              </div>

              {/* Tag buttons */}
              {(() => {
                const isSearching = searchQuery.trim().length > 0
                const displayedDisciplines = isSearching
                  ? CREATOR_DISCIPLINES.filter((d) =>
                      d.toLowerCase().includes(searchQuery.trim().toLowerCase())
                    )
                  : showAll
                  ? CREATOR_DISCIPLINES
                  : POPULAR_CREATOR_DISCIPLINES

                if (displayedDisciplines.length === 0) {
                  return (
                    <p className="text-xs text-white/50 py-2">
                      No matching disciplines found. Only predefined disciplines may be selected.
                    </p>
                  )
                }

                return (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {displayedDisciplines.map((discipline) => {
                      const isSelected = selectedSkills.includes(discipline)
                      const isMaxed = selectedSkills.length >= MAX_CREATOR_SKILLS && !isSelected

                      return (
                        <button
                          key={discipline}
                          type="button"
                          onClick={() => toggleDiscipline(discipline)}
                          disabled={loading || isMaxed}
                          aria-pressed={isSelected}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118] ${
                            isSelected
                              ? 'bg-[#6239BF]/20 border-[#6239BF] text-purple-light shadow-[0_0_12px_rgba(98,57,191,0.25)]'
                              : isMaxed
                              ? 'bg-white/[0.01] border-white/5 text-white/25 cursor-not-allowed opacity-50'
                              : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/25 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-purple-light shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                          <span>{discipline}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* ── Section 03: Your Vision ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6239BF] bg-[#6239BF]/10 px-2 py-0.5 rounded">
                  03
                </span>
                <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/50">
                  Your Vision
                </h2>
              </div>
              <span className="text-[11px] text-white/50 tabular-nums">
                {(form.bio || '').length} / 1500
              </span>
            </div>

            <label htmlFor="creator-bio" className="block text-xs text-white/60">
              Tell collaborators about your filmmaking interests and the stories you want to create (optional).
            </label>

            <textarea
              id="creator-bio"
              name="bio"
              value={form.bio || ''}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              maxLength={1500}
              placeholder="I am an independent director and screenwriter focusing on character-driven psychological dramas and neo-noir films..."
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 outline-none transition-all focus:border-[#6239BF] focus:bg-white/[0.05] focus:shadow-[0_0_15px_rgba(98,57,191,0.15)] focus-visible:border-[#6239BF] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* ── Section 04: Profile Photo Setup ── */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[#6239BF] bg-[#6239BF]/10 px-2 py-0.5 rounded">
                04
              </span>
              <h2 className="text-xs font-bold tracking-[0.12em] uppercase text-white/50">
                Profile Photo
              </h2>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#6239BF]/15 border border-[#6239BF]/30 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/80 mb-1">
                  Profile photo
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  After verifying your email, you can add your profile photo from your Profile.
                </p>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_30px_rgba(98,57,191,0.45)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  <span>Creating Filmmaker Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Filmmaker Profile</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
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
