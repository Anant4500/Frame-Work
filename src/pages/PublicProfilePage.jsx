import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const normalizeProjectStatus = (status) => {
  const s = (status || '').toUpperCase()
  if (s === 'OPEN') return 'Open'
  if (s === 'CLOSED') return 'Closed'
  if (s === 'IN_PRODUCTION') return 'In Production'
  if (s === 'COMPLETED') return 'Completed'
  return status || 'Open'
}

const normalizeCreditStatus = (status) => {
  const s = (status || '').toUpperCase()
  if (s === 'COMPLETED') return 'Completed Credit'
  if (s === 'CLOSED') return 'Closed'
  if (s === 'IN_PRODUCTION') return 'In Production'
  if (s === 'OPEN') return 'Open'
  return status || 'Open'
}

const getStatusBadgeClass = (status) => {
  if (status === 'Completed' || status === 'Completed Credit') {
    return 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20'
  }
  if (status === 'In Production') {
    return 'border-amber-500/40 text-amber-400 bg-amber-500/20'
  }
  if (status === 'Closed') {
    return 'border-white/20 text-white/70 bg-white/[0.08]'
  }
  return 'border-purple/40 text-purple-light bg-purple/20'
}

const handleAvatarError = (e) => {
  if (!e.target.src.endsWith('/images/profile/avatar.png')) {
    e.target.src = '/images/profile/avatar.png'
  }
}

const handlePosterError = (e) => {
  if (!e.target.src.endsWith('/images/hero-bg.png')) {
    e.target.src = '/images/hero-bg.png'
  }
}

function PublicProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileNotFound, setProfileNotFound] = useState(false)
  const [profileError, setProfileError] = useState(false)

  const [skills, setSkills] = useState([])
  const [skillsError, setSkillsError] = useState(false)

  const [creatorProjects, setCreatorProjects] = useState([])
  const [creatorProjectsError, setCreatorProjectsError] = useState(false)

  const [collaboratorCredits, setCollaboratorCredits] = useState([])
  const [collaboratorCreditsError, setCollaboratorCreditsError] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const pageTitle = profileNotFound
    ? 'Profile Not Found | FrameWork'
    : (profile?.name ? `${profile.name} | FrameWork` : 'Profile | FrameWork')
  usePageTitle(pageTitle)

  const fetchPublicProfileData = useCallback(async () => {
    if (!id || !UUID_REGEX.test(id)) {
      setLoading(false)
      setProfile(null)
      setProfileNotFound(true)
      setProfileError(false)
      return
    }

    setLoading(true)
    setProfile(null)
    setProfileNotFound(false)
    setProfileError(false)
    setSkills([])
    setSkillsError(false)
    setCreatorProjects([])
    setCreatorProjectsError(false)
    setCollaboratorCredits([])
    setCollaboratorCreditsError(false)

    try {
      // 1. Fetch public profile record with explicit safe fields (excluding phone, resume_url, updated_at, created_at)
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('id, name, role, bio, location, experience_level, availability, profile_photo_url')
        .eq('id', id)
        .maybeSingle()

      if (profileErr) {
        console.error('Error fetching public profile:', profileErr)
        setProfile(null)
        setProfileError(true)
        setLoading(false)
        return
      }

      if (!profileData) {
        setProfile(null)
        setProfileNotFound(true)
        setLoading(false)
        return
      }

      const isCreatorRole = (profileData.role || '').toUpperCase() === 'CREATOR'

      const mappedProfile = {
        id: profileData.id,
        name: profileData.name || 'Filmmaker',
        role: isCreatorRole ? 'CREATOR' : 'COLLABORATOR',
        bio: profileData.bio || '',
        location: profileData.location || '',
        experienceLevel: profileData.experience_level || '',
        availability: profileData.availability || '',
        avatar: profileData.profile_photo_url || '/images/profile/avatar.png',
      }

      setProfile(mappedProfile)

      // 2. Concurrently fetch skills and role-specific productions/credits
      const skillsPromise = (async () => {
        try {
          const { data: userSkillsData, error: skillsErr } = await supabase
            .from('user_skills')
            .select('skills(name)')
            .eq('user_id', id)

          if (skillsErr) {
            console.error('Error fetching public user skills:', skillsErr)
            setSkillsError(true)
          } else if (userSkillsData) {
            const sortedSkills = userSkillsData
              .map((us) => us.skills?.name)
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
            setSkills(sortedSkills)
          }
        } catch (err) {
          console.error('Error fetching public user skills:', err)
          setSkillsError(true)
        }
      })()

      const roleContentPromise = (async () => {
        if (isCreatorRole) {
          try {
            // Minimized creator projects query: removed unused budget, timeline, created_at, positions_needed, positions_filled
            const { data: projData, error: projErr } = await supabase
              .from('projects')
              .select('id, title, description, genre, location, poster_url, status, roles:project_roles(role)')
              .eq('creator_id', id)
              .order('created_at', { ascending: false })

            if (projErr) {
              console.error('Error fetching creator public projects:', projErr)
              setCreatorProjectsError(true)
            } else if (projData) {
              const mappedProjects = projData.map((p) => {
                const rolesList = Array.isArray(p.roles) ? p.roles : []
                return {
                  id: p.id,
                  title: p.title || 'Untitled Project',
                  description: p.description || '',
                  genre: p.genre || 'Film',
                  location: p.location || 'Remote',
                  thumbnail: p.poster_url || '/images/hero-bg.png',
                  status: normalizeProjectStatus(p.status),
                  rawStatus: p.status,
                  roles: rolesList.map((r) => r.role).filter(Boolean),
                }
              })
              setCreatorProjects(mappedProjects)
            }
          } catch (err) {
            console.error('Error fetching creator public projects:', err)
            setCreatorProjectsError(true)
          }
        } else {
          try {
            // Collaborator credits via safe sanitized RPC (bypasses restrictive applications RLS without exposing private columns)
            const { data: creditsData, error: creditsErr } = await supabase
              .rpc('get_public_profile_credits', { p_profile_id: id })

            if (creditsErr) {
              console.error('Error fetching collaborator public credits:', creditsErr)
              setCollaboratorCreditsError(true)
            } else if (creditsData) {
              const mappedCredits = creditsData.map((c) => ({
                creditId: c.application_id,
                projectId: c.project_id,
                title: c.project_title || 'Untitled Project',
                role: c.role_name || 'Collaborator',
                genre: c.project_genre || 'Film',
                location: c.project_location || 'Remote',
                thumbnail: c.project_poster_url || '/images/hero-bg.png',
                status: normalizeCreditStatus(c.project_status),
                rawStatus: c.project_status,
              }))
              setCollaboratorCredits(mappedCredits)
            }
          } catch (err) {
            console.error('Error fetching collaborator public credits:', err)
            setCollaboratorCreditsError(true)
          }
        }
      })()

      await Promise.all([skillsPromise, roleContentPromise])
    } catch (err) {
      console.error('Error fetching public profile:', err)
      setProfile(null)
      setProfileError(true)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPublicProfileData()
  }, [fetchPublicProfileData])

  // Full-page Loading State with accessibility attributes
  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div role="status" aria-live="polite" className="flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          <p className="text-white/60 text-sm font-medium">Loading film portfolio...</p>
        </div>
      </section>
    )
  }

  // Full-page Network / Database Error State with Retry
  if (profileError) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div role="alert" className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 7.5h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Unable to load profile</h2>
          <p className="text-white/60 mb-6 text-sm">
            We couldn't load this filmmaker profile right now. Please check your connection and try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={fetchPublicProfileData}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_24px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Try Again
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.04] text-white/80 hover:text-white text-sm font-medium rounded-full border border-white/10 hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Explore Productions
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Full-page Genuine Profile Not Found State
  if (profileNotFound || !profile) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Profile Not Found</h2>
          <p className="text-white/60 mb-6 text-sm">
            This filmmaker profile may have been removed or does not exist.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            Explore Productions
          </Link>
        </div>
      </section>
    )
  }

  const isCreator = profile.role === 'CREATOR'
  const isSelf = authUser?.id === profile.id

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back & Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] rounded-md px-1 py-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {isSelf && (
            <Link
              to="/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-purple border border-white/10 hover:border-purple text-xs font-medium text-white/80 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Edit Your Profile
            </Link>
          )}
        </div>

        {/* ─── Hero Card ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar (Above-the-fold: eager load, async decoding) */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(98,57,191,0.2)] bg-white/[0.03]">
                <img
                  src={profile.avatar}
                  alt={`${profile.name}'s profile photo`}
                  className="w-full h-full object-cover"
                  decoding="async"
                  onError={handleAvatarError}
                />
              </div>
              {!isCreator && profile.availability === 'Available' && (
                <span
                  className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#0A0A0F]"
                  title="Available for Projects"
                  aria-hidden="true"
                />
              )}
              {!isCreator && profile.availability === 'Limited Availability' && (
                <span
                  className="absolute bottom-1 right-1 w-5 h-5 bg-amber-400 rounded-full border-[3px] border-[#0A0A0F]"
                  title="Limited Availability"
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Identity Details */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-white mb-2 break-words leading-tight">
                {profile.name}
              </h1>

              {/* Role Badge & Context */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                {isCreator ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-purple-light bg-purple/15 border border-purple/40 rounded-full shadow-[0_0_10px_rgba(98,57,191,0.15)]">
                    <svg className="w-3.5 h-3.5 text-purple" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Creator / Filmmaker
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Collaborator / Crew
                  </span>
                )}

                {/* Experience Level: Collaborator Only */}
                {!isCreator && profile.experienceLevel && (
                  <span className="px-2.5 py-0.5 text-xs text-white/70 bg-white/[0.04] border border-white/10 rounded-full font-medium">
                    {profile.experienceLevel}
                  </span>
                )}
              </div>

              {/* Location & Real Availability (Availability is Collaborator only) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-xs sm:text-sm text-white/60 mb-3">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5 text-white/70">
                    <svg className="w-3.5 h-3.5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {profile.location}
                  </span>
                )}

                {!isCreator && profile.availability && (
                  <span className={`inline-flex items-center gap-1.5 font-medium ${
                    profile.availability === 'Available' ? 'text-emerald-400' :
                    profile.availability === 'Limited Availability' ? 'text-amber-400' :
                    'text-white/60'
                  }`}>
                    <span
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 rounded-full ${
                        profile.availability === 'Available' ? 'bg-emerald-400 animate-pulse motion-reduce:animate-none' :
                        profile.availability === 'Limited Availability' ? 'bg-amber-400' :
                        'bg-white/40'
                      }`}
                    />
                    {profile.availability}
                  </span>
                )}
              </div>

              {/* Skills summary chips */}
              {skills.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {skills.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 text-xs font-medium text-purple-light bg-purple/10 border border-purple/20 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length > 5 && (
                    <span className="px-2 py-0.5 text-[11px] text-white/60 font-medium">
                      +{skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── About Section ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-3">About</h2>
          {profile.bio ? (
            <p className="text-white/70 leading-relaxed text-sm sm:text-base whitespace-pre-line break-words max-w-4xl">
              {profile.bio}
            </p>
          ) : (
            <p className="text-white/50 text-sm italic">
              No bio provided yet.
            </p>
          )}
        </div>

        {/* ─── Skills Section ─── */}
        {skillsError ? (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-3">Skills & Disciplines</h2>
            <div className="py-4 px-5 rounded-xl bg-white/[0.02] border border-white/10 text-white/60 text-xs flex items-center justify-between">
              <span>Unable to load skills & disciplines right now.</span>
              <button
                type="button"
                onClick={fetchPublicProfileData}
                className="text-purple-light hover:text-white font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded px-1"
              >
                Retry
              </button>
            </div>
          </div>
        ) : skills.length > 0 ? (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-4">Skills & Disciplines</h2>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(98,57,191,0.15)] cursor-default"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── Creator Projects Section ─── */}
        {isCreator && (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Projects by {profile.name}</h2>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                  Productions and films published by this creator
                </p>
              </div>
              {!creatorProjectsError && (
                <span className="text-xs font-semibold text-purple-light bg-purple/10 border border-purple/20 px-3 py-1 rounded-full">
                  {creatorProjects.length} {creatorProjects.length === 1 ? 'Project' : 'Projects'}
                </span>
              )}
            </div>

            {creatorProjectsError ? (
              <div className="py-8 text-center border border-white/10 rounded-xl bg-white/[0.01]">
                <p className="text-white/60 text-sm mb-3">Unable to load productions.</p>
                <button
                  type="button"
                  onClick={fetchPublicProfileData}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-purple border border-white/10 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  Try Again
                </button>
              </div>
            ) : creatorProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {creatorProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.1)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Poster Thumbnail (Below fold: lazy loading, async decoding) */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={proj.thumbnail}
                          alt={`${proj.title} poster`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={handlePosterError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full text-white">
                          {proj.genre}
                        </span>
                        <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${getStatusBadgeClass(proj.status)}`}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 pb-2">
                        <h3 className="font-['Bebas_Neue',_sans-serif] font-normal text-xl text-white mb-1 tracking-wide group-hover:text-purple-light transition-colors line-clamp-2 break-words leading-tight">
                          {proj.title}
                        </h3>
                        <p className="text-white/60 text-xs mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {proj.location}
                        </p>
                        {proj.description && (
                          <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3 break-words">
                            {proj.description}
                          </p>
                        )}
                        {proj.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {proj.roles.slice(0, 2).map((r) => (
                              <span key={r} className="px-2 py-0.5 text-[10px] font-medium text-purple-light border border-purple/20 rounded-full break-words">
                                {r}
                              </span>
                            ))}
                            {proj.roles.length > 2 && (
                              <span className="text-[10px] text-white/60 self-center font-medium">
                                +{proj.roles.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        to={`/project/${proj.id}`}
                        className="block w-full py-2.5 text-xs font-semibold text-center bg-[#6239BF] text-white rounded-lg transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_16px_rgba(98,57,191,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                      >
                        View Project &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-white/50 text-sm">No productions published yet.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Collaborator Credits Section ─── */}
        {!isCreator && (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Film Credits & Contributions</h2>
                <p className="text-white/60 text-xs sm:text-sm mt-0.5">
                  Verified productions joined and credits earned on FrameWork
                </p>
              </div>
              {!collaboratorCreditsError && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  {collaboratorCredits.length} {collaboratorCredits.length === 1 ? 'Credit' : 'Credits'}
                </span>
              )}
            </div>

            {collaboratorCreditsError ? (
              <div className="py-8 text-center border border-white/10 rounded-xl bg-white/[0.01]">
                <p className="text-white/60 text-sm mb-3">Unable to load production credits.</p>
                <button
                  type="button"
                  onClick={fetchPublicProfileData}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-purple border border-white/10 text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  Try Again
                </button>
              </div>
            ) : collaboratorCredits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {collaboratorCredits.map((credit) => (
                  <div
                    key={credit.creditId}
                    className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.1)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Poster Thumbnail (Below fold: lazy loading, async decoding) */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={credit.thumbnail}
                          alt={`${credit.title} poster`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
                          onError={handlePosterError}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full text-white">
                          {credit.genre}
                        </span>
                        <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${getStatusBadgeClass(credit.status)}`}>
                          {credit.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-4 pb-2">
                        <h3 className="font-['Bebas_Neue',_sans-serif] font-normal text-xl text-white mb-1.5 tracking-wide group-hover:text-purple-light transition-colors line-clamp-2 break-words leading-tight">
                          {credit.title}
                        </h3>

                        {/* Role Performed Pill */}
                        <div className="flex items-start gap-1.5 mb-2.5 min-w-0">
                          <span className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full inline-flex items-center gap-1.5 break-words min-w-0">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="break-words min-w-0 leading-tight">{credit.role}</span>
                          </span>
                        </div>

                        <p className="text-white/60 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {credit.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <Link
                        to={`/project/${credit.projectId}`}
                        className="block w-full py-2.5 text-xs font-semibold text-center bg-white/[0.04] hover:bg-purple hover:text-white border border-white/10 hover:border-purple rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                      >
                        View Project &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-white/50 text-sm">No production credits yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default PublicProfilePage
