import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import {
  MAX_CREATOR_SKILLS,
  MAX_COLLABORATOR_SKILLS,
  MAX_BIO_LENGTH,
  EXPERIENCE_OPTIONS,
  AVAILABILITY_OPTIONS,
  CREATOR_DISCIPLINES,
  POPULAR_CREATOR_DISCIPLINES,
  COLLABORATOR_DEPARTMENTS,
  COLLABORATOR_SKILL_GROUPS,
  ALL_COLLABORATOR_SKILLS,
} from '../data/profileSkills'
import {
  validateAvatarFile,
  validateResumeFile,
  parseOwnedAvatarPath,
  parseOwnedResumePath,
} from '../utils/profileHelpers'

/* ═══════════════════════════════════════════ */
/*              PROFILE PAGE HUB               */
/* ═══════════════════════════════════════════ */
function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [creatorProjects, setCreatorProjects] = useState([])
  const [joinedCredits, setJoinedCredits] = useState([])
  const [loadingWork, setLoadingWork] = useState(true)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileToast, setProfileToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [resumeViewerUrl, setResumeViewerUrl] = useState(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [profileOverrides, setProfileOverrides] = useState(null)

  // Opener refs for focus restoration
  const editProfileOpenerRef = useRef(null)
  const resumeOpenerRef = useRef(null)

  usePageTitle('Profile | FrameWork')

  useEffect(() => {
    setProfileOverrides(null)
  }, [user?.id])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) {
      navigate('/login', {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`
        }
      })
    }
  }, [user, navigate, location])

  useEffect(() => {
    if (!profileToast) return
    const t = setTimeout(() => setProfileToast(null), 4000)
    return () => clearTimeout(t)
  }, [profileToast])

  // Fetch live verified productions and credits based on account role
  useEffect(() => {
    if (!user?.id) return
    let isMounted = true

    const fetchPlatformWork = async () => {
      try {
        setLoadingWork(true)
        if (user.role === 'creator') {
          // Fetch projects created by this creator
          const { data, error } = await supabase
            .from('projects')
            .select('id, title, logline, description, genre, location, budget, timeline, poster_url, status, created_at, roles:project_roles(id, role, positions_needed, positions_filled)')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          if (isMounted && data) {
            const mapped = data.map((p) => {
              const rolesList = Array.isArray(p.roles) ? p.roles : []
              const neededCount = rolesList.reduce((sum, r) => sum + (Number(r.positions_needed) || 0), 0)
              const filledCount = rolesList.reduce((sum, r) => sum + (Number(r.positions_filled) || 0), 0)
              const openCount = Math.max(0, neededCount - filledCount)

              return {
                id: p.id,
                title: p.title || 'Untitled Project',
                logline: p.logline || '',
                description: p.description || '',
                genre: p.genre || 'Film',
                location: p.location || 'Remote',
                poster_url: p.poster_url || '/images/hero-bg.png',
                status: p.status === 'OPEN' ? 'Open' : p.status === 'IN_PRODUCTION' ? 'In Production' : p.status === 'COMPLETED' ? 'Completed' : (p.status || 'Open'),
                rawStatus: p.status,
                year: p.created_at ? new Date(p.created_at).getFullYear() : '2026',
                openCount,
                roles: rolesList.map((r) => r.role),
              }
            })
            setCreatorProjects(mapped)
          }
        } else {
          // Fetch accepted applications for collaborator verified credits
          const { data, error } = await supabase
            .from('applications')
            .select('id, status, created_at, role:project_roles(role), project:projects(id, title, logline, description, genre, location, poster_url, status, created_at)')
            .eq('applicant_id', user.id)
            .eq('status', 'ACCEPTED')
            .order('created_at', { ascending: false })

          if (error) throw error

          if (isMounted && data) {
            const mapped = data.map((app) => ({
              applicationId: app.id,
              projectId: app.project?.id || app.id,
              title: app.project?.title || 'Untitled Project',
              role: app.role?.role || 'Collaborator',
              genre: app.project?.genre || 'Film',
              location: app.project?.location || 'Remote',
              poster_url: app.project?.poster_url || '/images/hero-bg.png',
              status: app.project?.status === 'OPEN' ? 'Open' : app.project?.status === 'IN_PRODUCTION' ? 'In Production' : app.project?.status === 'COMPLETED' ? 'Completed' : (app.project?.status || 'Open'),
              rawStatus: app.project?.status,
              year: app.project?.created_at ? new Date(app.project.created_at).getFullYear() : '2026',
            }))
            setJoinedCredits(mapped)
          }
        }
      } catch (err) {
        console.error('Error fetching platform work:', err)
      } finally {
        if (isMounted) setLoadingWork(false)
      }
    }

    fetchPlatformWork()

    return () => {
      isMounted = false
    }
  }, [user?.id, user?.role, refreshKey])

  const effectiveUser = user ? { ...user, ...profileOverrides } : null
  if (!effectiveUser) return null

  const isCreator = effectiveUser.role === 'creator'
  const userSkills = Array.isArray(effectiveUser.skills) ? effectiveUser.skills : []

  const handleEditProfile = (openerEl) => {
    if (openerEl) {
      editProfileOpenerRef.current = openerEl
    } else {
      editProfileOpenerRef.current = document.activeElement
    }
    setEditProfileOpen(true)
  }

  const handleViewResume = async (resumePath, openerEl) => {
    if (openerEl) {
      resumeOpenerRef.current = openerEl
    } else {
      resumeOpenerRef.current = document.activeElement
    }

    const rawPath = resumePath || effectiveUser.resumeUrl || effectiveUser.resume_url
    if (!rawPath) {
      setProfileToast({ type: 'info', text: 'No resume uploaded yet.' })
      return
    }
    try {
      let cleanPath = rawPath
      if (rawPath.includes('/resumes/')) {
        cleanPath = rawPath.split('/resumes/')[1]
      }
      if (cleanPath.includes('?')) {
        cleanPath = cleanPath.split('?')[0]
      }
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(cleanPath, 60)

      if (!error && data?.signedUrl) {
        setResumeViewerUrl(data.signedUrl)
        setIsResumeModalOpen(true)
      } else if (error) {
        console.error('Error generating signed URL for resume:', error)
        setProfileToast({ type: 'error', text: 'Could not load resume: ' + error.message })
      }
    } catch (err) {
      console.error('Error in handleViewResume:', err)
      setProfileToast({ type: 'error', text: 'Failed to open resume.' })
    }
  }

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8 min-w-0">
        {/* ─── 1. Profile Identity Hero Card ─── */}
        <ProfileHeroCard
          user={effectiveUser}
          isCreator={isCreator}
          skills={userSkills}
          onEditProfile={handleEditProfile}
          onViewResume={handleViewResume}
        />

        {/* ─── 2. About Card ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">About</h2>
            {!effectiveUser.bio && (
              <button
                type="button"
                onClick={(e) => handleEditProfile(e.currentTarget)}
                className="text-xs font-semibold text-purple-light hover:text-white transition-colors rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
              >
                + Add Bio
              </button>
            )}
          </div>
          {effectiveUser.bio ? (
            <p className="text-white/70 leading-relaxed text-sm sm:text-base whitespace-pre-line break-words max-w-4xl">
              {effectiveUser.bio}
            </p>
          ) : (
            <div className="py-6 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
              <p className="text-white/60 text-sm font-medium mb-2">No bio added yet.</p>
              <p className="text-white/50 text-xs max-w-md mx-auto leading-relaxed">
                Introduce yourself to filmmakers, your creative vision, and preferred collaboration style.
              </p>
            </div>
          )}
        </div>

        {/* ─── 3. Skills & Disciplines Card ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Skills &amp; Disciplines</h2>
              <p className="text-white/50 text-xs mt-0.5">Your verified craft proficiencies across film departments</p>
            </div>
            <button
              type="button"
              onClick={(e) => handleEditProfile(e.currentTarget)}
              className="text-xs font-semibold text-purple-light hover:text-white transition-colors rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Manage Skills
            </button>
          </div>
          {userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {userSkills.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(98,57,191,0.15)] cursor-default break-words"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
              <p className="text-white/60 text-sm font-medium mb-3">No skills selected yet.</p>
              <button
                type="button"
                onClick={(e) => handleEditProfile(e.currentTarget)}
                className="px-4 py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
              >
                Select Skills
              </button>
            </div>
          )}
        </div>

        {/* ─── 4. Real Platform Work & Credits ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {isCreator ? (
            <CreatorProductionsSection
              projects={creatorProjects}
              loading={loadingWork}
            />
          ) : (
            <CollaboratorCreditsSection
              credits={joinedCredits}
              loading={loadingWork}
            />
          )}
        </div>

        {/* ─── 5. Account & Documents Card (Private) ─── */}
        <AccountDocumentsCard
          user={effectiveUser}
          onViewResume={handleViewResume}
          onEditProfile={handleEditProfile}
        />
      </div>

      {/* ─── Edit Profile Modal ─── */}
      <EditProfileModal
        isOpen={editProfileOpen}
        openerRef={editProfileOpenerRef}
        onClose={() => setEditProfileOpen(false)}
        user={effectiveUser}
        onSaveSuccess={(updated, toastInfo) => {
          if (updated) {
            setProfileOverrides((prev) => ({ ...prev, ...updated }))
            if (updateUser) {
              updateUser(updated)
            }
          }
          setEditProfileOpen(false)
          setProfileToast(toastInfo || { type: 'success', text: 'Profile updated successfully!' })
          setRefreshKey((k) => k + 1)
        }}
      />

      {/* ─── Inline Resume Viewer Modal ─── */}
      <ResumeViewerModal
        isOpen={isResumeModalOpen}
        openerRef={resumeOpenerRef}
        resumeUrl={resumeViewerUrl}
        onClose={() => {
          setIsResumeModalOpen(false)
          setResumeViewerUrl(null)
        }}
      />

      {/* ─── Profile Toast (Accessible Live Region) ─── */}
      {profileToast && (
        <div
          role={profileToast.type === 'error' || profileToast.type === 'warning' ? 'alert' : 'status'}
          aria-live={profileToast.type === 'error' || profileToast.type === 'warning' ? 'assertive' : 'polite'}
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl flex items-center gap-3 max-w-md ${
            profileToast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            profileToast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            profileToast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-purple/10 border-purple/20 text-purple-light'
          }`}
        >
          {profileToast.type === 'success' && (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {profileToast.type === 'error' && (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {profileToast.type === 'warning' && (
            <svg className="w-5 h-5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          <span className="text-sm font-medium">{profileToast.text}</span>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════════════════ */
/*            IDENTITY HERO CARD               */
/* ═══════════════════════════════════════════ */
function ProfileHeroCard({ user, isCreator, skills, onEditProfile, onViewResume }) {
  const avatarUrl = user.avatar || user.profile_photo_url || '/images/profile/avatar.png'
  const availabilityText = user.availability || null

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left: Avatar + Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(98,57,191,0.2)] bg-white/[0.03]">
              <img
                src={avatarUrl}
                alt={`${user.name}'s profile photo`}
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (!e.target.src.endsWith('/images/profile/avatar.png')) {
                    e.target.src = '/images/profile/avatar.png'
                  }
                }}
              />
            </div>
            {availabilityText === 'Available' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#0A0A0F]" title="Available for Projects" aria-hidden="true" />
            )}
            {availabilityText === 'Limited Availability' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-amber-400 rounded-full border-[3px] border-[#0A0A0F]" title="Limited Availability" aria-hidden="true" />
            )}
          </div>

          {/* Identity Information */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white mb-2 min-w-0 break-words leading-tight">
              {user.name}
            </h1>

            {/* Role & Context Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              {isCreator ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-light bg-purple/15 border border-purple/40 rounded-full shadow-[0_0_10px_rgba(98,57,191,0.15)]">
                  <svg className="w-3 h-3 text-purple" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Creator / Filmmaker
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  Collaborator / Crew
                </span>
              )}

              {user.experienceLevel && (
                <span className="px-2.5 py-0.5 text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-full font-medium">
                  {user.experienceLevel}
                </span>
              )}
            </div>

            {/* Location & Availability Subtext */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-white/60 mb-3">
              {user.location ? (
                <span className="inline-flex items-center gap-1 text-white/70 break-words">
                  <svg className="w-3.5 h-3.5 text-purple shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {user.location}
                </span>
              ) : (
                <span className="text-white/50 italic">Location not set</span>
              )}

              {availabilityText && (
                <span className={`inline-flex items-center gap-1.5 font-medium ${
                  availabilityText === 'Available' ? 'text-emerald-400' :
                  availabilityText === 'Limited Availability' ? 'text-amber-400' :
                  'text-white/50'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    availabilityText === 'Available' ? 'bg-emerald-400 animate-pulse motion-reduce:animate-none' :
                    availabilityText === 'Limited Availability' ? 'bg-amber-400' :
                    'bg-white/40'
                  }`} aria-hidden="true" />
                  {availabilityText}
                </span>
              )}
            </div>

            {/* Top Skills Preview */}
            {skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2.5 py-0.5 text-xs font-medium text-purple-light bg-purple/10 border border-purple/20 rounded-full break-words">
                    {s}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="text-[11px] text-white/60 font-medium self-center">+{skills.length - 4} more</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full md:w-auto sm:min-w-[180px]">
          <button
            id="edit-profile-btn"
            type="button"
            onClick={(e) => onEditProfile(e.currentTarget)}
            className="w-full px-5 py-2.5 bg-[#6239BF] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] text-center flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            Edit Profile
          </button>

          <Link
            to={`/profile/${user.id}`}
            id="view-public-profile-btn"
            className="w-full px-5 py-2.5 bg-white/[0.04] border border-white/10 text-white/80 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white text-center flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            <span>View Public Profile</span>
            <span className="text-purple-light" aria-hidden="true">&rarr;</span>
          </Link>

          {user.resumeUrl && (
            <button
              type="button"
              onClick={(e) => onViewResume(user.resumeUrl, e.currentTarget)}
              className="w-full px-5 py-2.5 bg-white/[0.03] border border-white/10 text-white/70 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/30 hover:text-white text-center flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Resume
            </button>
          )}

          {isCreator ? (
            <Link
              to="/create-project"
              className="w-full px-5 py-2.5 bg-purple/10 border border-purple/30 text-purple-light text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple/20 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              + Start Project
            </Link>
          ) : (
            <Link
              to="/explore"
              className="w-full px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-emerald-500/20 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Find Projects
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*         CREATOR PRODUCTIONS SECTION         */
/* ═══════════════════════════════════════════ */
function CreatorProductionsSection({ projects = [], loading = false }) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="py-12 text-center text-white/60 text-sm font-medium">
        <svg className="w-8 h-8 text-purple animate-spin motion-reduce:animate-none mx-auto mb-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        Loading your productions...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Your Productions</h2>
          <p className="text-white/50 text-xs sm:text-sm mt-0.5">Films and creative projects created by you</p>
        </div>
        <Link
          to="/my-projects"
          className="text-xs font-semibold text-purple-light hover:text-white transition-colors rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Go to Command Center &rarr;
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.1)] flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={p.poster_url}
                    alt={`${p.title} poster`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    onError={(e) => {
                      if (!e.target.src.endsWith('/images/hero-bg.png')) {
                        e.target.src = '/images/hero-bg.png'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full text-white">
                    {p.genre}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${
                    p.status === 'Completed'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20'
                      : p.status === 'In Production'
                      ? 'border-amber-500/40 text-amber-400 bg-amber-500/20'
                      : 'border-purple/40 text-purple-light bg-purple/20'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-['Bebas_Neue',_sans-serif] font-normal text-xl text-white mb-1 tracking-wide group-hover:text-purple-light transition-colors line-clamp-1 break-words leading-tight">
                    {p.title}
                  </h3>
                  <p className="text-white/60 text-xs mb-3 flex items-center gap-1 break-words">
                    <svg className="w-3 h-3 text-purple shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {p.location}
                  </p>
                  {p.description && (
                    <p className="text-white/60 text-xs line-clamp-2 leading-relaxed mb-3 break-words">
                      {p.description}
                    </p>
                  )}
                  {p.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.roles.slice(0, 2).map((r) => (
                        <span key={r} className="px-2 py-0.5 text-[10px] text-white/60 bg-white/[0.04] border border-white/5 rounded-full break-words">
                          {r}
                        </span>
                      ))}
                      {p.roles.length > 2 && (
                        <span className="text-[10px] text-white/50 self-center">+{p.roles.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/project/${p.id}`}
                  className="block w-full py-2 text-xs font-semibold text-center bg-white/[0.04] hover:bg-purple hover:text-white border border-white/10 hover:border-purple rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  Manage Production &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
          <p className="text-white/60 text-sm font-medium mb-4">You haven't created any productions yet.</p>
          <Link
            to="/create-project"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white text-xs font-semibold rounded-lg transition-all hover:bg-purple-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            + Start a Project
          </Link>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*       COLLABORATOR CREDITS SECTION          */
/* ═══════════════════════════════════════════ */
function CollaboratorCreditsSection({ credits = [], loading = false }) {
  if (loading) {
    return (
      <div role="status" aria-live="polite" className="py-12 text-center text-white/60 text-sm font-medium">
        <svg className="w-8 h-8 text-purple animate-spin motion-reduce:animate-none mx-auto mb-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        Loading verified credits...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Productions &amp; Credits</h2>
          <p className="text-white/50 text-xs sm:text-sm mt-0.5">Films you have joined as a verified collaborator</p>
        </div>
        <span className="text-xs font-semibold text-purple-light bg-purple/10 border border-purple/20 px-3 py-1 rounded-full">
          {credits.length} {credits.length === 1 ? 'Credit' : 'Credits'}
        </span>
      </div>

      {credits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {credits.map((c) => (
            <div
              key={c.applicationId}
              className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.1)] flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={c.poster_url}
                    alt={`${c.title} poster`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    onError={(e) => {
                      if (!e.target.src.endsWith('/images/hero-bg.png')) {
                        e.target.src = '/images/hero-bg.png'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full text-white">
                    {c.genre}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${
                    c.status === 'Completed'
                      ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20'
                      : c.status === 'In Production'
                      ? 'border-amber-500/40 text-amber-400 bg-amber-500/20'
                      : 'border-purple/40 text-purple-light bg-purple/20'
                  }`}>
                    {c.status === 'Completed' ? 'Completed Credit' : c.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-['Bebas_Neue',_sans-serif] font-normal text-xl text-white mb-1.5 tracking-wide group-hover:text-purple-light transition-colors line-clamp-1 break-words leading-tight">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1 break-words">
                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {c.role}
                    </span>
                  </div>

                  <p className="text-white/60 text-xs flex items-center gap-1 break-words">
                    <svg className="w-3 h-3 text-purple shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {c.location}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/project/${c.projectId}`}
                  className="block w-full py-2 text-xs font-semibold text-center bg-white/[0.04] hover:bg-purple hover:text-white border border-white/10 hover:border-purple rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  View Production &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
          <p className="text-white/60 text-sm font-medium mb-3">No productions joined yet.</p>
          <p className="text-white/50 text-xs mb-5 max-w-md mx-auto leading-relaxed">
            Apply to open roles on FrameWork to collaborate with filmmakers and build your verified credits.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white text-xs font-semibold rounded-lg transition-all hover:bg-purple-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            Explore Open Roles
          </Link>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*   ACCOUNT & DOCUMENTS CARD (OWN/PRIVATE)    */
/* ═══════════════════════════════════════════ */
function AccountDocumentsCard({ user, onViewResume, onEditProfile }) {
  const isCreator = user.role === 'creator'
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '2026'

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Account &amp; Documents</h2>

      <div className={`grid grid-cols-1 ${isCreator && !user.resumeUrl ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
        {/* Email, Phone & Account Details */}
        <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Account Email (Private)
            </span>
            <p className="text-sm font-medium text-white break-all">{user.email || 'Email not available'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Phone Number (Private)
            </span>
            <p className="text-sm font-medium text-white break-words">{user.phone || 'Phone not set'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Member Since
            </span>
            <p className="text-sm font-medium text-white/80">{formattedDate}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-1">
              Account Type
            </span>
            <p className="text-sm font-medium text-white/80 capitalize">{user.role || 'Collaborator'}</p>
          </div>
        </div>

        {/* Resume Document (Collaborators, or Creators with legacy resume) */}
        {(!isCreator || user.resumeUrl) && (
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/50 block mb-2">
                Resume / CV (Private)
              </span>
              {user.resumeUrl ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-purple/15 text-purple flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">PDF Resume Stored</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Available to creators when you apply</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  No resume uploaded. Upload a PDF resume so creators can review your film industry background.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              {user.resumeUrl ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => onViewResume(user.resumeUrl, e.currentTarget)}
                    className="flex-1 py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                  >
                    Preview Resume
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onEditProfile(e.currentTarget)}
                    className="px-3 py-2 text-xs font-medium bg-white/[0.04] border border-white/10 text-white/70 hover:text-white rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                  >
                    Replace
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={(e) => onEditProfile(e.currentTarget)}
                  className="w-full py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  + Upload Resume
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*            RESUME VIEWER MODAL              */
/* ═══════════════════════════════════════════ */
function ResumeViewerModal({ isOpen, onClose, resumeUrl, openerRef }) {
  const modalRef = useRef(null)
  const closeBtnRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = openerRef?.current || document.activeElement

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Initial focus on close button
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus()
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === 'function' &&
        document.body.contains(previouslyFocusedRef.current)
      ) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [isOpen, openerRef])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const focusable = Array.from(focusableElements).filter(
          (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
        )

        if (focusable.length === 0) {
          e.preventDefault()
          modalRef.current.focus()
          return
        }

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-viewer-title"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        className="w-full max-w-4xl h-[85vh] bg-[#121216] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl animate-fade-in focus:outline-none"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#16161c]">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg className="w-5 h-5 text-purple shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <h3 id="resume-viewer-title" className="text-base font-bold text-white truncate">Resume Preview</h3>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close resume preview"
            className="px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/10 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#16161c]"
          >
            ✕ Close
          </button>
        </div>
        <div className="flex-1 w-full bg-[#0a0a0d] relative">
          {resumeUrl ? (
            <iframe
              src={resumeUrl}
              title="Resume preview"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/50 text-sm" role="status" aria-live="polite">
              Loading resume preview...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*             EDIT PROFILE MODAL              */
/* ═══════════════════════════════════════════ */
function EditProfileModal({ isOpen, onClose, user, onSaveSuccess, openerRef }) {
  const isCreator = (user?.role || '').toLowerCase() === 'creator'
  const isCollaborator = !isCreator
  const maxSkills = isCreator ? MAX_CREATOR_SKILLS : MAX_COLLABORATOR_SKILLS

  // Form field states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [availability, setAvailability] = useState('')

  // Canonical & assigned skills state
  const [availableSkills, setAvailableSkills] = useState([])
  const [originalSkillIds, setOriginalSkillIds] = useState(new Set())
  const [selectedSkills, setSelectedSkills] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsCatalogError, setSkillsCatalogError] = useState(false)

  // Creator skills picker UI state
  const [creatorSearch, setCreatorSearch] = useState('')
  const [creatorShowAll, setCreatorShowAll] = useState(false)

  // Collaborator skills picker UI state
  const [collabSearch, setCollabSearch] = useState('')
  const [collabDept, setCollabDept] = useState('All')

  // File staging states
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarExt, setAvatarExt] = useState('jpg')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState('')

  // Submission & error states
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Refs for focus management & double-submit protection
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const savingRef = useRef(false)
  const activeBlobUrlRef = useRef(null)
  const avatarInputRef = useRef(null)
  const resumeInputRef = useRef(null)
  const prevOpenRef = useRef(false)
  const prevUserIdRef = useRef(null)

  // Scroll lock, focus tracking, and initial focus on modal open
  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current = openerRef?.current || document.activeElement

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      firstInputRef.current?.focus()
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
      if (
        previouslyFocusedRef.current &&
        typeof previouslyFocusedRef.current.focus === 'function' &&
        document.body.contains(previouslyFocusedRef.current)
      ) {
        previouslyFocusedRef.current.focus()
      }
    }
  }, [isOpen, openerRef])

  const handleClose = useCallback(() => {
    if (isSaving || savingRef.current) return
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }
    onClose()
  }, [isSaving, onClose])

  // Keyboard trap and Escape handling
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (savingRef.current || isSaving) return
        e.preventDefault()
        handleClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        const focusable = Array.from(focusableElements).filter(
          (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
        )

        if (focusable.length === 0) {
          e.preventDefault()
          modalRef.current.focus()
          return
        }

        const firstElement = focusable[0]
        const lastElement = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, handleClose])

  // Initialize and load data on modal open
  useEffect(() => {
    if (!isOpen || !user) {
      prevOpenRef.current = false
      return
    }

    const isOpening = !prevOpenRef.current
    const isDifferentUser = prevUserIdRef.current !== user.id

    prevOpenRef.current = true
    prevUserIdRef.current = user.id

    // Only re-initialize if the modal is transitioning from closed to open,
    // or if the active user account has changed.
    // Background updates to the same user while the modal remains open must NOT overwrite drafts.
    if (!isOpening && !isDifferentUser) {
      return
    }

    setName(user.name || '')
    setPhone(user.phone || '')
    setLocation(user.location || '')
    setBio(user.bio || '')
    setExperienceLevel(user.experienceLevel || user.experience_level || '')
    setAvailability(user.availability || '')
    setAvatarFile(null)
    setAvatarExt('jpg')
    setAvatarPreview(user.avatar || user.profile_photo_url || '')
    setResumeFile(null)
    setResumeName('')
    setErrorMsg('')
    setCreatorSearch('')
    setCreatorShowAll(false)
    setCollabSearch('')
    setCollabDept('All')

    // Clean up any lingering blob URL
    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }

    let isMounted = true
    const initData = async () => {
      setSkillsLoading(true)
      setSkillsCatalogError(false)
      try {
        const [canonicalRes, userSkillsRes] = await Promise.all([
          supabase.from('skills').select('id, name').order('name', { ascending: true }),
          supabase.from('user_skills').select('skill_id, skills(name)').eq('user_id', user.id),
        ])

        if (canonicalRes.error || !canonicalRes.data) {
          console.error('Failed to load canonical skills catalog:', canonicalRes.error)
          if (isMounted) setSkillsCatalogError(true)
        } else if (isMounted) {
          setAvailableSkills(canonicalRes.data)
        }

        if (isMounted) {
          const rows = userSkillsRes.data || []
          const currentIds = new Set(rows.map((r) => r.skill_id).filter(Boolean))
          setOriginalSkillIds(currentIds)

          let initialNames = rows.map((r) => r.skills?.name).filter(Boolean)
          if (initialNames.length === 0 && Array.isArray(user.skills) && user.skills.length > 0) {
            initialNames = [...user.skills]
          }
          setSelectedSkills(initialNames)
        }
      } catch (err) {
        console.error('Error initializing skills in EditProfileModal:', err)
        if (isMounted) setSkillsCatalogError(true)
      } finally {
        if (isMounted) setSkillsLoading(false)
      }
    }

    initData()

    return () => {
      isMounted = false
    }
  }, [isOpen, user])

  // Cleanup active blob URL on unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
        activeBlobUrlRef.current = null
      }
    }
  }, [])

  if (!isOpen || !user) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving && !savingRef.current) {
      handleClose()
    }
  }

  // Staged avatar selection with immediate revocation of previous preview
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      setErrorMsg(validation.error)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
      return
    }

    if (activeBlobUrlRef.current) {
      URL.revokeObjectURL(activeBlobUrlRef.current)
      activeBlobUrlRef.current = null
    }

    const blobUrl = URL.createObjectURL(file)
    activeBlobUrlRef.current = blobUrl
    setAvatarFile(file)
    setAvatarExt(validation.ext)
    setAvatarPreview(blobUrl)
    setErrorMsg('')
  }

  // Staged resume selection (Collaborator only)
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateResumeFile(file)
    if (!validation.valid) {
      setErrorMsg(validation.error)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
      return
    }

    setResumeFile(file)
    setResumeName(file.name)
    setErrorMsg('')
  }

  // Skill selection handlers
  const removeSkill = (skillName) => {
    setSelectedSkills((prev) =>
      prev.filter((s) => s.toLowerCase() !== skillName.toLowerCase())
    )
  }

  const addSkill = (skillName) => {
    setSelectedSkills((prev) => {
      if (prev.some((s) => s.toLowerCase() === skillName.toLowerCase())) return prev
      if (prev.length >= maxSkills) return prev
      return [...prev, skillName]
    })
  }

  const toggleSkill = (skillName) => {
    if (selectedSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      removeSkill(skillName)
    } else {
      addSkill(skillName)
    }
  }

  // Submit handler with full safety, diff-based skills mutation, and rollback on failure
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Synchronous double-submit guard
    if (savingRef.current) return
    savingRef.current = true

    setErrorMsg('')

    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    const trimmedLocation = location.trim()
    const trimmedBio = bio.trim()

    // 1. Validation
    if (!trimmedName) {
      setErrorMsg('Full Name is required.')
      savingRef.current = false
      return
    }

    if (trimmedBio.length > MAX_BIO_LENGTH) {
      setErrorMsg(`Bio must be ${MAX_BIO_LENGTH} characters or less.`)
      savingRef.current = false
      return
    }

    // Build canonical ID lookups
    const nameToId = new Map()
    const idToName = new Map()
    availableSkills.forEach((s) => {
      nameToId.set(s.name.toLowerCase(), s.id)
      idToName.set(s.id, s.name)
    })

    const selectedSkillIds = new Set()
    selectedSkills.forEach((skillName) => {
      const id = nameToId.get(skillName.toLowerCase())
      if (id) {
        selectedSkillIds.add(id)
      }
    })

    // Retain legacy IDs if their names are still in selectedSkills
    originalSkillIds.forEach((id) => {
      const canonicalName = idToName.get(id)
      if (canonicalName && selectedSkills.some((s) => s.toLowerCase() === canonicalName.toLowerCase())) {
        selectedSkillIds.add(id)
      }
    })

    const toAdd = []
    selectedSkillIds.forEach((id) => {
      if (!originalSkillIds.has(id)) {
        toAdd.push(id)
      }
    })

    const toRemove = []
    originalSkillIds.forEach((id) => {
      if (!selectedSkillIds.has(id)) {
        toRemove.push(id)
      }
    })

    const skillsDirty = !skillsCatalogError && (toAdd.length > 0 || toRemove.length > 0)

    // Enforce selection limit only if skills selection was actually modified
    if (skillsDirty && selectedSkills.length > maxSkills) {
      setErrorMsg(
        isCreator
          ? `Please select at most ${MAX_CREATOR_SKILLS} creative disciplines.`
          : `Please select at most ${MAX_COLLABORATOR_SKILLS} skills.`
      )
      savingRef.current = false
      return
    }

    setIsSaving(true)

    let uploadedAvatarPath = null
    let uploadedResumePath = null

    try {
      // 2. Upload avatar if selected
      if (avatarFile) {
        const ext = avatarExt || 'jpg'
        const newAvatarPath = `${user.id}/${Date.now()}_avatar.${ext}`
        const { error: avatarUploadErr } = await supabase.storage
          .from('avatars')
          .upload(newAvatarPath, avatarFile, { upsert: false })

        if (avatarUploadErr) {
          console.error('Avatar upload failed:', avatarUploadErr)
          throw new Error('Unable to upload photo. Please try again.')
        }
        uploadedAvatarPath = newAvatarPath
      }

      // 3. Upload resume if selected (Collaborator only)
      if (isCollaborator && resumeFile) {
        const newResumePath = `${user.id}/${Date.now()}_resume.pdf`
        const { error: resumeUploadErr } = await supabase.storage
          .from('resumes')
          .upload(newResumePath, resumeFile, { upsert: false })

        if (resumeUploadErr) {
          console.error('Resume upload failed:', resumeUploadErr)
          // Rollback newly uploaded avatar if created in this attempt
          if (uploadedAvatarPath) {
            try {
              await supabase.storage.from('avatars').remove([uploadedAvatarPath])
            } catch (rbErr) {
              console.warn('Rollback of uploaded avatar failed:', rbErr)
            }
            uploadedAvatarPath = null
          }
          throw new Error('Unable to upload resume. Please try again.')
        }
        uploadedResumePath = newResumePath
      }

      // 4. Update profiles row (Role-aware payload, preserving legacy columns for Creator)
      const updatePayload = {
        name: trimmedName,
        phone: trimmedPhone || null,
        location: trimmedLocation || null,
        bio: trimmedBio || null,
      }

      if (isCollaborator) {
        updatePayload.experience_level = experienceLevel || null
        updatePayload.availability = availability || null
      }

      let newAvatarUrl = null
      if (uploadedAvatarPath) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadedAvatarPath)
        newAvatarUrl = urlData?.publicUrl || null
        if (newAvatarUrl) {
          updatePayload.profile_photo_url = newAvatarUrl
        }
      }

      if (uploadedResumePath) {
        updatePayload.resume_url = uploadedResumePath
      }

      const { data: updatedProfileRow, error: profileUpdateErr } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)
        .select()
        .single()

      if (profileUpdateErr) {
        console.error('Profile update failed:', profileUpdateErr)
        // Roll back uploaded assets from current attempt
        if (uploadedAvatarPath) {
          try {
            await supabase.storage.from('avatars').remove([uploadedAvatarPath])
          } catch (rbErr) {
            console.warn('Rollback of uploaded avatar failed:', rbErr)
          }
        }
        if (uploadedResumePath) {
          try {
            await supabase.storage.from('resumes').remove([uploadedResumePath])
          } catch (rbErr) {
            console.warn('Rollback of uploaded resume failed:', rbErr)
          }
        }
        throw new Error('Unable to update profile. Please try again.')
      }

      // 5. Profile row successfully saved! Best-effort cleanup of replaced old files
      if (newAvatarUrl && (user.avatar || user.profile_photo_url)) {
        const oldAvatarPath = parseOwnedAvatarPath(user.avatar || user.profile_photo_url, user.id)
        if (oldAvatarPath && oldAvatarPath !== uploadedAvatarPath) {
          supabase.storage
            .from('avatars')
            .remove([oldAvatarPath])
            .then(({ error }) => {
              if (error) console.warn('Old avatar cleanup warning:', error)
            })
            .catch((err) => console.warn('Old avatar cleanup error:', err))
        }
      }

      if (uploadedResumePath && (user.resumeUrl || user.resume_url)) {
        const oldResumePath = parseOwnedResumePath(user.resumeUrl || user.resume_url, user.id)
        if (oldResumePath && oldResumePath !== uploadedResumePath) {
          supabase.storage
            .from('resumes')
            .remove([oldResumePath])
            .then(({ error }) => {
              if (error) console.warn('Old resume cleanup warning:', error)
            })
            .catch((err) => console.warn('Old resume cleanup error:', err))
        }
      }

      // 6. Safe skills diff mutations (Add-first, remove-second)
      let skillAddFailed = false
      let skillRemoveFailed = false

      if (skillsDirty) {
        // Step A: Insert additions first
        if (toAdd.length > 0) {
          const insertRows = toAdd.map((id) => ({
            user_id: user.id,
            skill_id: id,
          }))
          const { error: addErr } = await supabase
            .from('user_skills')
            .insert(insertRows)

          if (addErr) {
            console.error('Skill additions failed:', addErr)
            skillAddFailed = true
            // Do NOT execute toRemove. Existing skills remain intact.
          }
        }

        // Step B: Only if additions succeeded, delete intended removals
        if (!skillAddFailed && toRemove.length > 0) {
          const { error: removeErr } = await supabase
            .from('user_skills')
            .delete()
            .eq('user_id', user.id)
            .in('skill_id', toRemove)

          if (removeErr) {
            console.error('Skill removals failed:', removeErr)
            skillRemoveFailed = true
            // Safe superset preserved in DB
          }
        }
      }

      // 7. Refetch authoritative skills from DB
      let finalSkills = selectedSkills
      try {
        const { data: refetchedRows } = await supabase
          .from('user_skills')
          .select('skill_id, skills(name)')
          .eq('user_id', user.id)

        if (refetchedRows) {
          finalSkills = refetchedRows.map((r) => r.skills?.name).filter(Boolean)
        }
      } catch (refetchErr) {
        console.warn('Error refetching authoritative skills:', refetchErr)
      }

      // 8. Construct authoritative user state for ProfilePage and Header sync
      const updatedUser = {
        name: updatedProfileRow?.name || trimmedName,
        phone: updatedProfileRow?.phone || trimmedPhone || '',
        location: updatedProfileRow?.location || trimmedLocation,
        bio: updatedProfileRow?.bio ?? trimmedBio,
        avatar: updatedProfileRow?.profile_photo_url || user.avatar || user.profile_photo_url,
        skills: finalSkills,
      }

      if (isCollaborator) {
        updatedUser.experienceLevel = updatedProfileRow?.experience_level || experienceLevel
        updatedUser.availability = updatedProfileRow?.availability || availability
        updatedUser.resumeUrl = updatedProfileRow?.resume_url || user.resumeUrl || user.resume_url
      } else {
        if (user.experienceLevel) updatedUser.experienceLevel = user.experienceLevel
        if (user.availability) updatedUser.availability = user.availability
        if (user.resumeUrl) updatedUser.resumeUrl = user.resumeUrl
      }

      // 9. Clean active blob URL
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current)
        activeBlobUrlRef.current = null
      }

      // 10. Truthful feedback based on outcome
      if (skillAddFailed) {
        onSaveSuccess(updatedUser, {
          type: 'warning',
          text: 'Your profile details were saved, but your skills could not be updated. Please try again.',
        })
      } else if (skillRemoveFailed) {
        onSaveSuccess(updatedUser, {
          type: 'warning',
          text: 'Your profile details were saved, but some skill changes could not be completed. Please try again.',
        })
      } else {
        onSaveSuccess(updatedUser, {
          type: 'success',
          text: 'Profile updated successfully!',
        })
      }
    } catch (err) {
      console.error('Error in profile save flow:', err)
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      savingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <h2 id="edit-profile-title" className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Edit Profile
            <span className={`ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isCreator ? 'bg-purple/15 text-purple-light border border-purple/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isCreator ? 'Creator' : 'Collaborator'}
            </span>
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close edit profile"
            className="p-1 text-white/50 hover:text-white transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_20px_rgba(98,57,191,0.15)] bg-white/[0.03]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile photo preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <label id="avatar-field-label" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Profile Photo</label>
              <label
                htmlFor="edit-profile-avatar-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs sm:text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light focus-within:outline-none focus-within:ring-2 focus-within:ring-[#6239BF] focus-within:ring-offset-2 focus-within:ring-offset-[#111116]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="truncate max-w-[180px] sm:max-w-xs inline-block" title={avatarFile ? avatarFile.name : undefined}>
                  {avatarFile ? avatarFile.name : 'Choose New Photo'}
                </span>
                <input
                  ref={avatarInputRef}
                  id="edit-profile-avatar-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  aria-labelledby="avatar-field-label"
                  aria-describedby="avatar-helper"
                  onChange={handleAvatarChange}
                  className="sr-only"
                />
              </label>
              <p id="avatar-helper" className="text-[11px] text-white/50 mt-1">JPG, PNG, or WebP. Max 5MB.</p>
            </div>
          </div>

          {/* Full Name & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-profile-name" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Full Name <span className="text-purple-light" aria-hidden="true">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="edit-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                aria-required="true"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="edit-profile-phone" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Phone Number (Private)
              </label>
              <input
                id="edit-profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                aria-describedby="phone-helper"
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all text-sm"
              />
              <p id="phone-helper" className="text-[11px] text-white/50 mt-1">Kept private to your account. Not visible on your public profile.</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="edit-profile-location" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Location
            </label>
            <input
              id="edit-profile-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, India / London, UK / Remote"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all text-sm"
            />
          </div>

          {/* Collaborator Only: Experience Level & Availability Grid */}
          {isCollaborator && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Experience Level */}
              <div>
                <label htmlFor="edit-profile-experience" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <div className="relative">
                  <select
                    id="edit-profile-experience"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-[#16161c] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-purple focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] cursor-pointer pr-10"
                  >
                    <option value="">Select Level</option>
                    {EXPERIENCE_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-[#16161c] text-white">
                        {lvl}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Availability */}
              <div>
                <label htmlFor="edit-profile-availability" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                  Availability Status
                </label>
                <div className="relative">
                  <select
                    id="edit-profile-availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full appearance-none px-4 py-3 bg-[#16161c] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-purple focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] cursor-pointer pr-10"
                  >
                    <option value="">Select Status</option>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-[#16161c] text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Bio / Statement with character limit counter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="edit-profile-bio" className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                Bio / Statement (Optional)
              </label>
              <span id="bio-counter" className="text-[11px] text-white/50 tabular-nums">
                {bio.length} / {MAX_BIO_LENGTH}
              </span>
            </div>
            <p id="bio-helper" className="sr-only">Maximum 1500 characters</p>
            <textarea
              id="edit-profile-bio"
              rows={4}
              maxLength={MAX_BIO_LENGTH}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              aria-describedby="bio-counter bio-helper"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all text-sm leading-relaxed resize-none"
              placeholder="Tell the film industry about your background, aesthetic, and vision..."
            />
          </div>

          {/* Skills Section: Role-Aware Branching */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
                  {isCreator ? 'Creative Disciplines' : 'Skills & Disciplines'}
                </label>
                <p className="text-white/50 text-xs mt-0.5">
                  {isCreator
                    ? `Select up to ${MAX_CREATOR_SKILLS} creative disciplines matching your filmmaker craft`
                    : `Choose up to ${MAX_COLLABORATOR_SKILLS} skills across film departments`}
                </p>
              </div>
              <span className="text-xs font-bold text-purple-light tabular-nums bg-purple/10 border border-purple/20 px-2.5 py-1 rounded-full">
                {selectedSkills.length} / {maxSkills}
              </span>
            </div>

            {skillsCatalogError ? (
              <div role="alert" className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
                Skills catalog is temporarily unavailable. Skill modifications are disabled, but other profile changes can still be saved safely.
              </div>
            ) : skillsLoading ? (
              <div role="status" aria-live="polite" className="py-6 text-center text-white/50 text-xs">
                Loading skills catalog...
              </div>
            ) : (
              <div className="space-y-3">
                {/* Removable Selected Tags */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
                          isCreator
                            ? 'bg-[#6239BF]/20 border-[#6239BF]/40 text-purple-light'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        <span className="break-words">{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          aria-label={`Remove ${skill}`}
                          className="hover:text-white transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* ─── CREATOR PICKER ─── */}
                {isCreator && (
                  <div className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                      <label htmlFor="creator-skill-search" className="sr-only">
                        Search creative disciplines
                      </label>
                      <input
                        id="creator-skill-search"
                        type="search"
                        value={creatorSearch}
                        onChange={(e) => setCreatorSearch(e.target.value)}
                        placeholder={
                          selectedSkills.length >= MAX_CREATOR_SKILLS
                            ? `Maximum ${MAX_CREATOR_SKILLS} disciplines selected`
                            : 'Search creative disciplines...'
                        }
                        disabled={selectedSkills.length >= MAX_CREATOR_SKILLS && !creatorSearch}
                        className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-purple focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all disabled:opacity-40"
                      />
                      {creatorSearch && (
                        <button
                          type="button"
                          onClick={() => setCreatorSearch('')}
                          aria-label="Clear discipline search"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded p-0.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Predefined Disciplines */}
                    {(() => {
                      const isSearching = creatorSearch.trim().length > 0
                      const filtered = isSearching
                        ? CREATOR_DISCIPLINES.filter((d) =>
                            d.toLowerCase().includes(creatorSearch.trim().toLowerCase())
                          )
                        : creatorShowAll
                        ? CREATOR_DISCIPLINES
                        : POPULAR_CREATOR_DISCIPLINES

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-white/50">
                            <span>
                              {isSearching
                                ? `Matching Disciplines (${filtered.length})`
                                : creatorShowAll
                                ? `All Disciplines (${CREATOR_DISCIPLINES.length})`
                                : 'Popular Disciplines'}
                            </span>
                            {!isSearching && (
                              <button
                                type="button"
                                onClick={() => setCreatorShowAll(!creatorShowAll)}
                                className="text-purple-light hover:text-white font-medium transition-colors rounded px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
                              >
                                {creatorShowAll ? 'Show less ↑' : 'Show all (12) ↓'}
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {filtered.map((discipline) => {
                              const isSelected = selectedSkills.some(
                                (s) => s.toLowerCase() === discipline.toLowerCase()
                              )
                              const isMaxed = selectedSkills.length >= MAX_CREATOR_SKILLS && !isSelected

                              return (
                                <button
                                  key={discipline}
                                  type="button"
                                  onClick={() => toggleSkill(discipline)}
                                  disabled={isMaxed}
                                  aria-pressed={isSelected}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] ${
                                    isSelected
                                      ? 'bg-purple/25 border-purple text-purple-light shadow-[0_0_12px_rgba(98,57,191,0.25)]'
                                      : isMaxed
                                      ? 'bg-white/[0.01] border-white/5 text-white/35 cursor-not-allowed opacity-50'
                                      : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                                  }`}
                                >
                                  {isSelected && <span aria-hidden="true">✓ </span>}
                                  {discipline}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ─── COLLABORATOR PICKER ─── */}
                {isCollaborator && (
                  <div className="space-y-3">
                    {/* Search & Department Filters */}
                    <div className="space-y-2">
                      <div className="relative">
                        <label htmlFor="collab-skill-search" className="sr-only">
                          Search skills
                        </label>
                        <input
                          id="collab-skill-search"
                          type="search"
                          value={collabSearch}
                          onChange={(e) => setCollabSearch(e.target.value)}
                          placeholder={
                            selectedSkills.length >= MAX_COLLABORATOR_SKILLS
                              ? `Maximum ${MAX_COLLABORATOR_SKILLS} skills selected`
                              : 'Search skills...'
                          }
                          disabled={selectedSkills.length >= MAX_COLLABORATOR_SKILLS && !collabSearch}
                          className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none focus:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] transition-all disabled:opacity-40"
                        />
                        {collabSearch && (
                          <button
                            type="button"
                            onClick={() => setCollabSearch('')}
                            aria-label="Clear skill search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 rounded p-0.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Department Tabs */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {COLLABORATOR_DEPARTMENTS.map((dept) => {
                          const isActive = collabDept === dept
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setCollabDept(dept)}
                              aria-pressed={isActive}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] ${
                                isActive
                                  ? 'bg-[#6239BF] border-[#6239BF] text-white shadow-[0_0_8px_rgba(98,57,191,0.3)]'
                                  : 'bg-white/[0.02] border-white/10 text-white/70 hover:text-white'
                              }`}
                            >
                              {dept}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Department Skills List */}
                    {(() => {
                      const deptSkills =
                        collabDept === 'All'
                          ? ALL_COLLABORATOR_SKILLS
                          : COLLABORATOR_SKILL_GROUPS.find((g) => g.department === collabDept)?.skills || []

                      const isSearching = collabSearch.trim().length > 0
                      const displayed = isSearching
                        ? deptSkills.filter((s) =>
                            s.toLowerCase().includes(collabSearch.trim().toLowerCase())
                          )
                        : deptSkills

                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-white/50">
                            <span>
                              {isSearching
                                ? `Matching Skills (${displayed.length})`
                                : `${collabDept} Skills (${displayed.length})`}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
                            {displayed.map((skill) => {
                              const isSelected = selectedSkills.some(
                                (s) => s.toLowerCase() === skill.toLowerCase()
                              )
                              const isMaxed = selectedSkills.length >= MAX_COLLABORATOR_SKILLS && !isSelected

                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  onClick={() => toggleSkill(skill)}
                                  disabled={isMaxed}
                                  aria-pressed={isSelected}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116] ${
                                    isSelected
                                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                                      : isMaxed
                                      ? 'bg-white/[0.01] border-white/5 text-white/35 cursor-not-allowed opacity-50'
                                      : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/25 hover:text-white'
                                  }`}
                                >
                                  {isSelected && <span aria-hidden="true">✓ </span>}
                                  {skill}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collaborator Only: Resume Upload */}
          {isCollaborator && (
            <div className="pt-4 border-t border-white/10">
              <label id="resume-field-label" className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Resume / CV (PDF Only)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label
                  htmlFor="edit-profile-resume-input"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs sm:text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light focus-within:outline-none focus-within:ring-2 focus-within:ring-[#6239BF] focus-within:ring-offset-2 focus-within:ring-offset-[#111116]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="truncate max-w-[180px] sm:max-w-xs inline-block" title={resumeFile ? resumeFile.name : undefined}>
                    {resumeName || (resumeFile ? resumeFile.name : 'Upload New PDF Resume')}
                  </span>
                  <input
                    ref={resumeInputRef}
                    id="edit-profile-resume-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    aria-labelledby="resume-field-label"
                    aria-describedby="resume-helper"
                    onChange={handleResumeChange}
                    className="sr-only"
                  />
                </label>
                {user.resumeUrl && !resumeFile && (
                  <span className="text-xs text-emerald-400/80 flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Existing resume on file
                  </span>
                )}
              </div>
              <p id="resume-helper" className="text-[11px] text-white/50 mt-1.5">Max 10MB PDF. Kept private and shared only with creators when you apply.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111116]"
            >
              {isSaving && (
                <svg className="w-4 h-4 text-white animate-spin motion-reduce:animate-none" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
