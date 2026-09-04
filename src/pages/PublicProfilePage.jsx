import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function PublicProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [skills, setSkills] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (!id) return
    let isMounted = true

    const fetchPublicProfile = async () => {
      try {
        setLoading(true)

        // 1. Fetch public profile record
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, name, role, bio, location, experience_level, availability, profile_photo_url, created_at')
          .eq('id', id)
          .single()

        if (profileErr || !profileData) {
          if (isMounted) {
            setProfile(null)
            setLoading(false)
          }
          return
        }

        // 2. Fetch relational skills from user_skills
        let resolvedSkills = []
        try {
          const { data: userSkillsData, error: skillsErr } = await supabase
            .from('user_skills')
            .select('skill_id, skills(name)')
            .eq('user_id', id)

          if (!skillsErr && userSkillsData) {
            resolvedSkills = userSkillsData.map((us) => us.skills?.name).filter(Boolean)
          }
        } catch (skillsErr) {
          console.error('Error fetching user skills:', skillsErr)
        }

        // 3. Fetch creator's public projects
        let creatorProjects = []
        try {
          const { data: projData, error: projErr } = await supabase
            .from('projects')
            .select('id, title, description, genre, location, budget, timeline, poster_url, status, created_at, roles:project_roles(role, positions_needed, positions_filled)')
            .eq('creator_id', id)
            .order('created_at', { ascending: false })

          if (!projErr && projData) {
            creatorProjects = projData.map((p) => ({
              id: p.id,
              title: p.title || 'Untitled Project',
              description: p.description || '',
              genre: p.genre || 'Film',
              location: p.location || 'Remote',
              budget: p.budget,
              timeline: p.timeline,
              thumbnail: p.poster_url || '/images/hero-bg.png',
              status: p.status === 'OPEN' ? 'Open' : p.status === 'IN_PRODUCTION' ? 'In Production' : p.status === 'COMPLETED' ? 'Completed' : (p.status || 'Open'),
              roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
              created_at: p.created_at,
            }))
          }
        } catch (projErr) {
          console.error('Error fetching creator projects:', projErr)
        }

        if (isMounted) {
          setProfile({
            id: profileData.id,
            name: profileData.name || 'Creator',
            role: (profileData.role || 'COLLABORATOR').toUpperCase(),
            bio: profileData.bio || '',
            location: profileData.location || '',
            experienceLevel: profileData.experience_level || '',
            availability: profileData.availability,
            avatar: profileData.profile_photo_url || '/images/profile/avatar.png',
            createdAt: profileData.created_at,
          })
          setSkills(resolvedSkills)
          setProjects(creatorProjects)
        }
      } catch (err) {
        console.error('Error fetching public profile:', err)
        if (isMounted) setProfile(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchPublicProfile()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          <p className="text-white/40 text-sm font-medium">Loading creator profile...</p>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-white/40 mb-6 text-sm">
            This creator profile may have been removed or does not exist.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)]"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    )
  }

  const isCreator = profile.role === 'CREATOR'

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ─── Profile Hero Card ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(98,57,191,0.15)] bg-white/[0.03]">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/profile/avatar.png'
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white mb-2">
                {profile.name}
              </h1>

              {/* Role Badge */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                {isCreator ? (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-purple-light bg-purple/15 border border-purple/40 rounded-full shadow-[0_0_10px_rgba(98,57,191,0.15)]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Creator / Filmmaker
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Collaborator / Crew
                  </span>
                )}
              </div>

              {/* Location & Experience Level */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-white/50 mb-4">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {profile.location}
                  </span>
                )}
                {profile.experienceLevel && (
                  <>
                    {profile.location && <span className="w-1 h-1 rounded-full bg-white/20" />}
                    <span>{profile.experienceLevel}</span>
                  </>
                )}
              </div>

              {/* Skills summary chips */}
              {skills.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {skills.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 text-xs font-medium text-purple-light bg-purple/10 border border-purple/20 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                  {skills.length > 5 && (
                    <span className="px-2.5 py-1 text-xs text-white/40">
                      +{skills.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── About Section ─── */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-white mb-3">About</h2>
          {profile.bio ? (
            <p className="text-white/60 leading-relaxed text-sm sm:text-base whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <p className="text-white/30 text-sm italic">
              No bio provided yet.
            </p>
          )}
        </div>

        {/* ─── Skills Section ─── */}
        {skills.length > 0 && (
          <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8">
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
        )}

        {/* ─── Creator Projects Section ─── */}
        {isCreator && (
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Projects by {profile.name}</h2>
                <p className="text-white/40 text-xs sm:text-sm mt-0.5">
                  Films and collaborations created by this filmmaker
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-light bg-purple/10 border border-purple/20 px-3 py-1 rounded-full">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.12)] hover:-translate-y-1 flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={proj.thumbnail}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/images/hero-bg.png'
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full text-white">
                          {proj.genre}
                        </span>
                        <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${
                          proj.status === 'Completed'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20'
                            : 'border-purple/40 text-purple-light bg-purple/20'
                        }`}>
                          {proj.status}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-4 pb-2">
                        <h3 className="font-['DM_Serif_Display'] font-normal text-base text-white mb-1 group-hover:text-purple-light transition-colors line-clamp-1">
                          {proj.title}
                        </h3>
                        <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
                          <svg className="w-3 h-3 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {proj.location}
                        </p>
                        {proj.description && (
                          <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-3">
                            {proj.description}
                          </p>
                        )}
                        {proj.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {proj.roles.slice(0, 3).map((r) => (
                              <span key={r} className="px-2 py-0.5 text-[10px] font-medium text-purple-light border border-purple/20 rounded-full">
                                {r}
                              </span>
                            ))}
                            {proj.roles.length > 3 && (
                              <span className="text-[10px] text-white/30 self-center">
                                +{proj.roles.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="p-4 pt-0">
                      <Link
                        to={`/project/${proj.id}`}
                        className="block w-full py-2.5 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(98,57,191,0.25)]"
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]">
                <p className="text-white/30 text-sm">No public projects created yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default PublicProfilePage
