import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'

const EXPERIENCE_OPTIONS = ['Beginner', 'Student', 'Intermediate', 'Professional']
const AVAILABILITY_OPTIONS = ['Available', 'Limited Availability', 'Unavailable']

/* ═══════════════════════════════════════════ */
/*              PROFILE PAGE HUB               */
/* ═══════════════════════════════════════════ */
function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [creatorProjects, setCreatorProjects] = useState([])
  const [joinedCredits, setJoinedCredits] = useState([])
  const [loadingWork, setLoadingWork] = useState(true)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileToast, setProfileToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [resumeViewerUrl, setResumeViewerUrl] = useState(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)
  const [profileOverrides, setProfileOverrides] = useState(null)

  useEffect(() => {
    setProfileOverrides(null)
  }, [user?.id])

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

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

  const handleEditProfile = () => setEditProfileOpen(true)

  const handleViewResume = async (resumePath) => {
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
      <div className="max-w-5xl mx-auto space-y-8">
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
                onClick={handleEditProfile}
                className="text-xs font-semibold text-purple-light hover:text-white transition-colors"
              >
                + Add Bio
              </button>
            )}
          </div>
          {effectiveUser.bio ? (
            <p className="text-white/70 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {effectiveUser.bio}
            </p>
          ) : (
            <div className="py-6 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
              <p className="text-white/40 text-sm mb-2">No bio added yet.</p>
              <p className="text-white/25 text-xs">
                Introduce yourself to filmmakers, your creative vision, and preferred collaboration style.
              </p>
            </div>
          )}
        </div>

        {/* ─── 3. Skills & Disciplines Card ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Skills & Disciplines</h2>
              <p className="text-white/40 text-xs mt-0.5">Your verified craft proficiencies across film departments</p>
            </div>
            <button
              type="button"
              onClick={handleEditProfile}
              className="text-xs font-semibold text-purple-light hover:text-white transition-colors"
            >
              Manage Skills
            </button>
          </div>
          {userSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 pt-2">
              {userSkills.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(98,57,191,0.15)] cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
              <p className="text-white/40 text-sm mb-3">No skills selected yet.</p>
              <button
                type="button"
                onClick={handleEditProfile}
                className="px-4 py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark"
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

        {/* ─── 5. Account & Documents Card ─── */}
        <AccountDocumentsCard
          user={effectiveUser}
          onViewResume={handleViewResume}
          onEditProfile={handleEditProfile}
        />
      </div>

      {/* ─── Edit Profile Modal ─── */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={effectiveUser}
        onSaveSuccess={(updated) => {
          if (updated) {
            setProfileOverrides((prev) => ({ ...prev, ...updated }))
            if (updateUser) {
              updateUser(updated)
            }
          }
          setEditProfileOpen(false)
          setProfileToast({ type: 'success', text: 'Profile updated successfully!' })
          setRefreshKey((k) => k + 1)
        }}
      />

      {/* ─── Inline Resume Viewer Modal ─── */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl h-[85vh] bg-[#121216] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16161c]">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="text-base font-bold text-white">Resume Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResumeModalOpen(false)
                  setResumeViewerUrl(null)
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/10 rounded-lg transition-all"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 w-full bg-[#0a0a0d] relative">
              {resumeViewerUrl ? (
                <iframe
                  src={resumeViewerUrl}
                  title="Resume Preview"
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/30 text-sm">
                  Loading resume preview...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Profile Toast ─── */}
      {profileToast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl flex items-center gap-3 ${
          profileToast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          profileToast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-purple/10 border-purple/20 text-purple-light'
        }`}>
          {profileToast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {profileToast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/profile/avatar.png'
                }}
              />
            </div>
            {availabilityText === 'Available' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#0A0A0F]" title="Available for Projects" />
            )}
            {availabilityText === 'Limited Availability' && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-amber-400 rounded-full border-[3px] border-[#0A0A0F]" title="Limited Availability" />
            )}
          </div>

          {/* Identity Information */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="font-['Fraunces',_serif] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em] text-white mb-2">
              {user.name}
            </h1>

            {/* Role & Context Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              {isCreator ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-light bg-purple/15 border border-purple/40 rounded-full shadow-[0_0_10px_rgba(98,57,191,0.15)]">
                  <svg className="w-3 h-3 text-purple" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Creator / Filmmaker
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  Collaborator / Crew
                </span>
              )}

              {user.experienceLevel && (
                <span className="px-2.5 py-0.5 text-xs text-white/50 bg-white/[0.03] border border-white/10 rounded-full">
                  {user.experienceLevel}
                </span>
              )}
            </div>

            {/* Location & Availability Subtext */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-white/50 mb-3">
              {user.location ? (
                <span className="inline-flex items-center gap-1 text-white/60">
                  <svg className="w-3.5 h-3.5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {user.location}
                </span>
              ) : (
                <span className="text-white/30 italic">Location not set</span>
              )}

              {availabilityText && (
                <span className={`inline-flex items-center gap-1.5 font-medium ${
                  availabilityText === 'Available' ? 'text-emerald-400' :
                  availabilityText === 'Limited Availability' ? 'text-amber-400' :
                  'text-white/40'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    availabilityText === 'Available' ? 'bg-emerald-400 animate-pulse' :
                    availabilityText === 'Limited Availability' ? 'bg-amber-400' :
                    'bg-white/30'
                  }`} />
                  {availabilityText}
                </span>
              )}
            </div>

            {/* Top Skills Preview */}
            {skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                {skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2.5 py-0.5 text-xs font-medium text-purple-light bg-purple/10 border border-purple/20 rounded-full">
                    {s}
                  </span>
                ))}
                {skills.length > 4 && (
                  <span className="text-[11px] text-white/40">+{skills.length - 4} more</span>
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
            onClick={onEditProfile}
            className="w-full px-5 py-2.5 bg-[#6239BF] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] text-center flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            Edit Profile
          </button>

          <Link
            to={`/profile/${user.id}`}
            id="view-public-profile-btn"
            className="w-full px-5 py-2.5 bg-white/[0.04] border border-white/10 text-white/80 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white text-center flex items-center justify-center gap-2"
          >
            <span>View Public Profile</span>
            <span className="text-purple-light">&rarr;</span>
          </Link>

          {user.resumeUrl && (
            <button
              type="button"
              onClick={() => onViewResume(user.resumeUrl)}
              className="w-full px-5 py-2.5 bg-white/[0.03] border border-white/10 text-white/70 text-xs sm:text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/30 hover:text-white text-center flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Resume
            </button>
          )}

          {isCreator ? (
            <Link
              to="/create-project"
              className="w-full px-5 py-2.5 bg-purple/10 border border-purple/30 text-purple-light text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple/20 text-center"
            >
              + Start Project
            </Link>
          ) : (
            <Link
              to="/explore"
              className="w-full px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-emerald-500/20 text-center"
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
      <div className="py-12 text-center text-white/40 text-sm">
        <svg className="w-8 h-8 text-purple animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none">
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
          <p className="text-white/40 text-xs sm:text-sm mt-0.5">Films and creative projects created by you</p>
        </div>
        <Link
          to="/my-projects"
          className="text-xs font-semibold text-purple-light hover:text-white transition-colors"
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
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/hero-bg.png'
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
                  <h3 className="font-['Fraunces',_serif] font-medium text-base text-white mb-1 group-hover:text-purple-light transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-white/40 text-xs mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {p.location}
                  </p>
                  {p.description && (
                    <p className="text-white/50 text-xs line-clamp-2 leading-relaxed mb-3">
                      {p.description}
                    </p>
                  )}
                  {p.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.roles.slice(0, 2).map((r) => (
                        <span key={r} className="px-2 py-0.5 text-[10px] text-white/50 bg-white/[0.04] border border-white/5 rounded-full">
                          {r}
                        </span>
                      ))}
                      {p.roles.length > 2 && (
                        <span className="text-[10px] text-white/30 self-center">+{p.roles.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/project/${p.id}`}
                  className="block w-full py-2 text-xs font-semibold text-center bg-white/[0.04] hover:bg-purple hover:text-white border border-white/10 hover:border-purple rounded-lg transition-all duration-300"
                >
                  Manage Production &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
          <p className="text-white/40 text-sm mb-4">You haven't created any productions yet.</p>
          <Link
            to="/create-project"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white text-xs font-semibold rounded-lg transition-all hover:bg-purple-dark"
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
      <div className="py-12 text-center text-white/40 text-sm">
        <svg className="w-8 h-8 text-purple animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" className="opacity-75" />
        </svg>
        Loading verified credits...
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Productions & Credits</h2>
          <p className="text-white/40 text-xs sm:text-sm mt-0.5">Films you have joined as a verified collaborator</p>
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
                    alt={c.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/images/hero-bg.png'
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
                  <h3 className="font-['Fraunces',_serif] font-medium text-base text-white mb-1.5 group-hover:text-purple-light transition-colors line-clamp-1">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {c.role}
                    </span>
                  </div>

                  <p className="text-white/40 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
                  className="block w-full py-2 text-xs font-semibold text-center bg-white/[0.04] hover:bg-purple hover:text-white border border-white/10 hover:border-purple rounded-lg transition-all duration-300"
                >
                  View Production &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
          <p className="text-white/40 text-sm mb-3">No productions joined yet.</p>
          <p className="text-white/25 text-xs mb-5 max-w-md mx-auto">
            Apply to open roles on FrameWork to collaborate with filmmakers and build your verified credits.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple text-white text-xs font-semibold rounded-lg transition-all hover:bg-purple-dark"
          >
            Explore Open Roles
          </Link>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*        ACCOUNT & DOCUMENTS CARD             */
/* ═══════════════════════════════════════════ */
function AccountDocumentsCard({ user, onViewResume, onEditProfile }) {
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '2026'

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Account & Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email & Account Details */}
        <div className="space-y-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Account Email (Private)
            </span>
            <p className="text-sm font-medium text-white">{user.email || 'Email not available'}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Member Since
            </span>
            <p className="text-sm font-medium text-white/80">{formattedDate}</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-1">
              Account Type
            </span>
            <p className="text-sm font-medium text-white/80 capitalize">{user.role || 'Collaborator'}</p>
          </div>
        </div>

        {/* Resume Document */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 block mb-2">
              Resume / CV (Private)
            </span>
            {user.resumeUrl ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple/15 text-purple flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">PDF Resume Stored</p>
                  <p className="text-[10px] text-emerald-400">Available to creators when you apply</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40 leading-relaxed mb-4">
                No resume uploaded. Upload a PDF resume so creators can review your film industry background.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {user.resumeUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => onViewResume(user.resumeUrl)}
                  className="flex-1 py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark text-center"
                >
                  Preview Resume
                </button>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="px-3 py-2 text-xs font-medium bg-white/[0.04] border border-white/10 text-white/60 hover:text-white rounded-lg transition-all"
                >
                  Replace
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onEditProfile}
                className="w-full py-2 text-xs font-semibold bg-purple text-white rounded-lg transition-all hover:bg-purple-dark text-center"
              >
                + Upload Resume
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*             EDIT PROFILE MODAL              */
/* ═══════════════════════════════════════════ */
function EditProfileModal({ isOpen, onClose, user, onSaveSuccess }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [availability, setAvailability] = useState('')
  const [availableSkills, setAvailableSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch canonical skills from public.skills
  useEffect(() => {
    if (!isOpen) return
    let isMounted = true

    const fetchSkills = async () => {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name')
          .order('name', { ascending: true })

        if (!error && data && isMounted) {
          setAvailableSkills(data)
        }
      } catch (err) {
        console.error('Error fetching canonical skills:', err)
      }
    }

    fetchSkills()

    return () => {
      isMounted = false
    }
  }, [isOpen])

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '')
      setLocation(user.location || '')
      setBio(user.bio || '')
      setExperienceLevel(user.experienceLevel || user.experience_level || '')
      setAvailability(user.availability || '')
      const initialSkills = Array.isArray(user.skills)
        ? user.skills
        : typeof user.skills === 'string'
        ? user.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      setSelectedSkills(initialSkills)
      setAvatarFile(null)
      setAvatarPreview(user.avatar || user.profile_photo_url || '')
      setResumeFile(null)
      setResumeName('')
      setErrorMsg('')
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.toLowerCase() === skillName.toLowerCase())
      if (exists) {
        return prev.filter((s) => s.toLowerCase() !== skillName.toLowerCase())
      } else {
        return [...prev, skillName]
      }
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file.')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setErrorMsg('')
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a PDF file for your resume.')
      return
    }
    setResumeFile(file)
    setResumeName(file.name)
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErrorMsg('Name is required.')
      return
    }

    try {
      setIsSaving(true)
      setErrorMsg('')

      let newAvatarUrl = null
      let newResumePath = null

      // 1. Upload avatar if selected
      if (avatarFile) {
        const avatarPath = `${user.id}/${Date.now()}_avatar`
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(avatarPath, avatarFile, { upsert: true })

        if (uploadErr) throw new Error('Avatar upload failed: ' + uploadErr.message)

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(avatarPath)

        newAvatarUrl = urlData?.publicUrl || null
      }

      // 2. Upload resume if selected
      if (resumeFile) {
        const resumePath = `${user.id}/${Date.now()}_resume.pdf`
        const { error: uploadErr } = await supabase.storage
          .from('resumes')
          .upload(resumePath, resumeFile, { upsert: true })

        if (uploadErr) throw new Error('Resume upload failed: ' + uploadErr.message)

        newResumePath = resumePath
      }

      // 3. Update profile table fields
      const updatePayload = {
        name: name.trim(),
        location: location.trim() || null,
        bio: bio.trim() || null,
        experience_level: experienceLevel || null,
        availability: availability || null,
      }

      if (newAvatarUrl) {
        updatePayload.profile_photo_url = newAvatarUrl
      }
      if (newResumePath) {
        updatePayload.resume_url = newResumePath
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (updateErr) throw updateErr

      // 4. Update normalized skills in public.user_skills
      const skillRows = selectedSkills
        .map((skillName) => {
          const matched = availableSkills.find(
            (s) => s.name.toLowerCase() === skillName.toLowerCase()
          )
          return matched ? { user_id: user.id, skill_id: matched.id } : null
        })
        .filter(Boolean)

      const { error: deleteErr } = await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', user.id)

      if (deleteErr) {
        throw new Error('Failed to update skills: ' + deleteErr.message)
      }

      if (skillRows.length > 0) {
        const { error: insertErr } = await supabase
          .from('user_skills')
          .insert(skillRows)

        if (insertErr) {
          throw new Error('Failed to save skills: ' + insertErr.message)
        }
      }

      onSaveSuccess({
        name: name.trim(),
        location: location.trim(),
        bio: bio.trim(),
        experienceLevel: experienceLevel,
        availability: availability,
        skills: selectedSkills,
        avatar: newAvatarUrl || avatarPreview,
        resumeUrl: newResumePath || user.resumeUrl,
      })
    } catch (err) {
      console.error('Error updating profile:', err)
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#111116] border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_20px_rgba(98,57,191,0.15)] bg-white/[0.03]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">Profile Photo</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs sm:text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {avatarFile ? avatarFile.name : 'Choose New Photo'}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-[11px] text-white/30 mt-1">JPG, PNG, or WebP. Max 5MB.</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all text-sm"
              placeholder="Your full name"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all text-sm"
              placeholder="e.g. Mumbai, India / London, UK / Remote"
            />
          </div>

          {/* Experience Level & Availability Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Experience Level */}
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-[#16161c] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-purple cursor-pointer pr-10"
                >
                  <option value="">Select Level</option>
                  {EXPERIENCE_OPTIONS.map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-[#16161c] text-white">
                      {lvl}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Availability Status
              </label>
              <div className="relative">
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-[#16161c] border border-white/10 rounded-xl text-white text-sm outline-none transition-all focus:border-purple cursor-pointer pr-10"
                >
                  <option value="">Select Status</option>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#16161c] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Bio / Statement</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all text-sm leading-relaxed"
              placeholder="Tell the film industry about your background, aesthetic, and credits..."
            />
          </div>

          {/* Skills & Disciplines */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Skills & Disciplines
            </label>
            {availableSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl bg-white/[0.02] border border-white/5">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.toLowerCase() === skill.name.toLowerCase()
                  )
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.name)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 ${
                        isSelected
                          ? 'bg-purple/20 border-purple text-purple-light shadow-[0_0_12px_rgba(98,57,191,0.2)]'
                          : 'bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      {skill.name}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-white/30 text-xs">Loading skills catalog...</p>
            )}
            <p className="text-[11px] text-white/30 mt-1.5">Click to toggle skills attached to your profile</p>
          </div>

          {/* Resume Upload */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Resume / CV (PDF)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs sm:text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {resumeName || 'Upload PDF Resume'}
                <input type="file" accept="application/pdf" onChange={handleResumeChange} className="hidden" />
              </label>
              {user.resumeUrl && !resumeFile && (
                <span className="text-xs text-emerald-400/80 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Existing resume on file
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/30 mt-1.5">Max 10MB PDF. Kept private and accessible only to creators you apply to.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] disabled:opacity-50"
            >
              {isSaving && (
                <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
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
