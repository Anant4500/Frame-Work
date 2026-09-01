import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'

/* ═══════════════════════════════════════════ */
/*              PROFILE PAGE                   */
/* ═══════════════════════════════════════════ */
function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOwnProfile] = useState(true)
  const [creatorProjects, setCreatorProjects] = useState([])
  const [joinedProjectsList, setJoinedProjectsList] = useState([])
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [profileToast, setProfileToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [resumeViewerUrl, setResumeViewerUrl] = useState(null)
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Fetch live projects (either created projects for Creator or joined projects for Collaborator)
  // Auto-dismiss profile toast
  useEffect(() => {
    if (!profileToast) return
    const t = setTimeout(() => setProfileToast(null), 4000)
    return () => clearTimeout(t)
  }, [profileToast])

  useEffect(() => {
    if (!user?.id) return
    let isMounted = true

    const fetchProfileData = async () => {
      try {
        if (user.role === 'creator') {
          const { data, error } = await supabase
            .from('projects')
            .select('*, roles:project_roles(*)')
            .eq('creator_id', user.id)
            .order('created_at', { ascending: false })

          if (error) throw error

          let applicationsData = []
          if (data && Array.isArray(data) && data.length > 0) {
            const projectIds = data.map((p) => p.id).filter(Boolean)
            if (projectIds.length > 0) {
              const { data: apps, error: appsErr } = await supabase
                .from('applications')
                .select('id, project_id, status')
                .in('project_id', projectIds)

              if (!appsErr && apps) {
                applicationsData = apps
              }
            }
          }

          if (isMounted) {
            const mapped = (data || []).map((p) => {
              const projectApps = (applicationsData || []).filter((a) => a.project_id === p.id)
              const pendingCount = projectApps.filter((a) => (a.status || '').toUpperCase() === 'PENDING').length
              const acceptedCount = projectApps.filter((a) => (a.status || '').toUpperCase() === 'ACCEPTED').length
              const filledPositionsCount = Array.isArray(p.roles)
                ? p.roles.reduce((sum, r) => sum + (Number(r.positions_filled) || 0), 0)
                : 0
              const teamMembersCount = Math.max(acceptedCount, filledPositionsCount)

              return {
                id: p.id,
                title: p.title || 'Untitled Project',
                logline: p.description || '',
                description: p.description || '',
                genre: p.genre || 'Drama',
                location: p.location || 'Remote',
                budget: p.budget,
                timeline: p.timeline,
                thumbnail: p.poster_url || '/images/hero-bg.png',
                poster_url: p.poster_url,
                status: p.status === 'OPEN' ? 'Open' : p.status === 'IN_PRODUCTION' ? 'In Production' : p.status === 'COMPLETED' ? 'Completed' : p.status,
                date: p.created_at ? p.created_at.split('T')[0] : '',
                created_at: p.created_at,
                year: p.created_at ? new Date(p.created_at).getFullYear().toString() : '2026',
                role: 'Creator / Director',
                roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
                rawRoles: p.roles || [],
                rolesNeeded: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
                applications: pendingCount,
                pendingApplicationsCount: pendingCount,
                teamMembersCount: teamMembersCount,
              }
            })
            setCreatorProjects(mapped)
          }
        } else {
          // Fetch projects joined by the collaborator (accepted applications)
          const { data, error } = await supabase
            .from('applications')
            .select('id, status, project:projects(*), role:project_roles(role)')
            .eq('applicant_id', user.id)
            .eq('status', 'ACCEPTED')

          if (error) throw error

          if (isMounted) {
            const mappedJoined = (data || []).map((app) => ({
              id: app.project?.id || app.id,
              title: app.project?.title || 'Untitled Project',
              thumbnail: app.project?.poster_url || '/images/hero-bg.png',
              poster_url: app.project?.poster_url,
              genre: app.project?.genre || 'Drama',
              location: app.project?.location || 'Remote',
              status: app.project?.status === 'OPEN' ? 'Open' : app.project?.status === 'IN_PRODUCTION' ? 'In Production' : app.project?.status === 'COMPLETED' ? 'Completed' : (app.project?.status || 'In Production'),
              role: app.role?.role || 'Collaborator',
              year: app.project?.created_at ? new Date(app.project.created_at).getFullYear().toString() : '2026',
              applicationId: app.id,
            }))
            setJoinedProjectsList(mappedJoined)
          }
        }
      } catch (err) {
        console.error('Error fetching profile projects data:', err)
      }
    }

    fetchProfileData()

    return () => {
      isMounted = false
    }
  }, [user?.id, user?.role, refreshKey])

  if (!user) return null

  const primaryRole = user.role === 'creator' ? 'Creator / Filmmaker' : 'Collaborator / Crew'
  const userSkills = Array.isArray(user.skills) ? user.skills : []
  const secondaryRoles = userSkills
  const allRoles = userSkills.length > 0 ? userSkills : [primaryRole]

  const activeProjectsList = creatorProjects.filter((p) => p.status === 'Open' || p.status === 'In Production')

  const p = {
    name: user.name || 'Unknown User',
    primaryRole,
    secondaryRoles,
    allRoles,
    location: user.location || '',
    experienceLevel: user.experienceLevel || '',
    available: user.available !== undefined ? user.available : true,
    availabilityText: user.availabilityText || 'Available for collaboration',
    avatar: user.avatar || '/images/profile/avatar.png',
    bio: user.bio || 'Not added yet',
    bioSecondary: user.bioSecondary || '',
    stats: {
      projectsJoined: joinedProjectsList.length,
      filmsCompleted: user.stats?.filmsCompleted || 0,
      rolesPerformed: user.stats?.rolesPerformed || joinedProjectsList.length,
      credits: user.stats?.credits || joinedProjectsList.length,
      projectsCreated: creatorProjects.length,
      activeProjects: activeProjectsList.length,
      teamMembers: user.stats?.teamMembers || 0,
    },
    skills: userSkills,
    portfolio: Array.isArray(user.portfolio) ? user.portfolio : [],
    experience: Array.isArray(user.experience) ? user.experience : [],
    projectsJoinedList: joinedProjectsList,
    filmCredits: Array.isArray(user.filmCredits) ? user.filmCredits : [],
    availability: user.availability || {
      collaborationTypes: [],
      preferredRoles: [],
      preferredLocations: [],
    },
    // Creator specific properties
    featuredWork: Array.isArray(user.featuredWork) ? user.featuredWork : [],
    activeProjects: activeProjectsList,
    projectsCreatedList: creatorProjects,
    teams: Array.isArray(user.teams) ? user.teams : [],
    filmography: Array.isArray(user.filmography) ? user.filmography : [],
    completedFilms: Array.isArray(user.completedFilms) ? user.completedFilms : [],
    lookingFor: user.lookingFor || {
      roles: [],
      location: 'Not added yet',
      projectType: 'Not added yet',
      budget: 'Not added yet',
      timeline: 'Not added yet',
    },
    resume_url: user.resumeUrl || user.resume_url || null,
    credits: Array.isArray(user.credits) ? user.credits : []
  }

  const handleEditProfile = () => setEditProfileOpen(true)

  const handleViewResume = async (resumePath) => {
    const rawPath = resumePath || user.resumeUrl || user.resume_url
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
    <section className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      {user.role === 'creator' ? (
        <CreatorProfileLayout p={p} isOwn={isOwnProfile} userRole={user.role} onEditProfile={handleEditProfile} onViewResume={handleViewResume} />
      ) : (
        <CollaboratorProfileLayout p={p} isOwn={isOwnProfile} userRole={user.role} onEditProfile={handleEditProfile} onViewResume={handleViewResume} />
      )}

      {/* ─── Edit Profile Modal ─── */}
      <EditProfileModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        user={user}
        onSaveSuccess={() => {
          setEditProfileOpen(false)
          setProfileToast({ type: 'success', text: 'Profile updated successfully!' })
          setRefreshKey((k) => k + 1)
        }}
      />

      {/* ─── Inline Resume Viewer Modal ─── */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[85vh] bg-[#121212] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <h3 className="text-base font-bold text-white">Resume / CV Preview</h3>
              </div>
              <button
                onClick={() => {
                  setIsResumeModalOpen(false)
                  setResumeViewerUrl(null)
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/10 rounded-lg transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* iFrame Container */}
            <div className="flex-1 w-full bg-[#0a0a0a] relative">
              {resumeViewerUrl ? (
                <iframe
                  src={resumeViewerUrl}
                  title="Resume Viewer"
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

/* ─── COLLABORATOR LAYOUT ─── */
function CollaboratorProfileLayout({ p, isOwn, userRole, onEditProfile, onViewResume }) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* ── HERO ── */}
      <ProfileHero profile={p} isOwn={isOwn} userRole={userRole} onEditProfile={onEditProfile} onViewResume={onViewResume} />

      {/* ── STATS ── */}
      <StatsBarCollaborator stats={p.stats} />

      {/* ── ABOUT ── */}
      <SectionCard title="About" id="profile-about">
        <p className="text-white/60 leading-relaxed max-w-2xl text-[15px]">{p.bio}</p>
      </SectionCard>

      {/* ── SKILLS ── */}
      <SectionCard title="Skills" id="profile-skills">
        {p.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {p.skills.map(s => (
              <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(98,57,191,0.15)] cursor-default">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">Not added yet</p>
        )}
      </SectionCard>

      {/* ── PORTFOLIO & SHOWREEL ── */}
      <PortfolioSection items={p.portfolio} title="Portfolio & Showreel" />

      {/* ── WORK EXPERIENCE ── */}
      <ExperienceTimeline items={p.experience} title="Work Experience" />

      {/* ── PROJECTS CONTRIBUTED ── */}
      <ProjectsJoinedSection items={p.projectsJoinedList} title="Projects Contributed" />

      {/* ── FILM CREDITS ── */}
      <CreditsSection items={p.filmCredits} />

      {/* ── AVAILABILITY ── */}
      <AvailabilitySection data={p.availability} available={p.available} />

      {/* ── PROFILE ACTIONS ── */}
      <ProfileActions isOwn={isOwn} userRole={userRole} onEditProfile={onEditProfile} onViewResume={onViewResume} resumeUrl={p.resume_url} />
    </div>
  )
}

/* ─── CREATOR LAYOUT ─── */
function CreatorProfileLayout({ p, isOwn, userRole, onEditProfile, onViewResume }) {
  const [projectTab, setProjectTab] = useState('Active')
  const filteredCreated = p.projectsCreatedList || []

  const lookingForRoles = p.lookingFor?.roles || []
  const lookingForLocation = p.lookingFor?.location || 'Not added yet'
  const lookingForProjectType = p.lookingFor?.projectType || 'Not added yet'
  const lookingForBudget = p.lookingFor?.budget || 'Not added yet'
  const lookingForTimeline = p.lookingFor?.timeline || 'Not added yet'

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── HERO ── */}
      <ProfileHero profile={p} isOwn={isOwn} userRole={userRole} onEditProfile={onEditProfile} onViewResume={onViewResume} />

      {/* ── STATS ── */}
      <StatsBarCreator stats={p.stats} />

      {/* ── ABOUT ── */}
      <SectionCard title="About" id="profile-about">
        <p className="text-white/60 leading-relaxed max-w-2xl text-[15px]">{p.bio}</p>
        {p.bioSecondary && <p className="text-white/50 text-sm mt-2 max-w-2xl">{p.bioSecondary}</p>}
      </SectionCard>

      {/* Featured Work */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-1">Featured Work</h2>
        <p className="text-white/40 text-sm mb-6">Cinematic highlights from my filmography</p>
        {p.featuredWork.length > 0 ? (
          <div className="space-y-6">
            {p.featuredWork.map(fw => <FeaturedCard key={fw.id} item={fw} />)}
          </div>
        ) : (
          <SectionEmpty text="No featured work yet." />
        )}
      </div>

      {/* Active Projects */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-1">Active Projects</h2>
        <p className="text-white/40 text-sm mb-6">Projects currently looking for collaborators</p>
        {p.activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {p.activeProjects.map(ap => <ActiveProjectCard key={ap.id} item={ap} isOwn={isOwn} />)}
          </div>
        ) : (
          <SectionEmpty text="No active projects right now." btnLabel="Start a Project" btnLink="/create-project" />
        )}
      </div>

      {/* Projects Created */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <h2 className="text-xl font-bold">Projects Created</h2>
          <div className="flex gap-2">
            {['Active', 'Completed'].map(t => (
              <button key={t} onClick={() => setProjectTab(t)} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${projectTab === t ? 'bg-purple text-white' : 'bg-white/[0.04] text-white/50 border border-white/10 hover:text-white'}`}>{t}</button>
            ))}
          </div>
        </div>
        {filteredCreated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCreated.filter(pr => projectTab === 'Active' ? pr.status === 'Active' || pr.status === 'Open' : pr.status === 'Completed').map(pr => <ProjectCreatedCard key={pr.id} item={pr} />)}
          </div>
        ) : (
          <SectionEmpty text={`No ${projectTab.toLowerCase()} projects.`} />
        )}
      </div>

      {/* Current Collaborations */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-6">Current Collaborations</h2>
        {p.teams.length > 0 ? (
          <div className="space-y-5">
            {p.teams.map(team => <TeamCard key={team.project} team={team} />)}
          </div>
        ) : (
          <SectionEmpty text="No collaborations yet." />
        )}
      </div>

      {/* Filmography */}
      <SectionCard title="Filmography">
        {p.filmography.length > 0 ? (
          <div className="relative pl-6 sm:pl-8">
            <div className="absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-white/10" />
            <div className="space-y-7">
              {p.filmography.map((f, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-purple/20 border-2 border-purple flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-purple" /></div>
                  <span className="text-xs font-semibold text-purple-light bg-purple/10 px-2 py-0.5 rounded">{f.year}</span>
                  <h3 className="font-['DM_Serif_Display'] font-normal text-base mt-1 cursor-pointer hover:text-purple-light transition-colors">{f.project}</h3>
                  <p className="text-sm text-white/50">{f.role}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full"><span className="w-1 h-1 rounded-full bg-emerald-400" />{f.status}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SectionEmpty text="No filmography entries yet." />
        )}
      </SectionCard>

      {/* Completed Films */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-6">Completed Films</h2>
        {p.completedFilms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {p.completedFilms.map(cf => <CompletedFilmCard key={cf.id} item={cf} />)}
          </div>
        ) : (
          <SectionEmpty text="No completed films yet." />
        )}
      </div>

      {/* Skills */}
      <SectionCard title="Skills">
        {p.skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {p.skills.map(s => (
              <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(98,57,191,0.15)] cursor-default">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">Not added yet</p>
        )}
      </SectionCard>

      {/* Currently Looking For */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-xl font-bold mb-6">Currently Looking For</h2>
        {lookingForRoles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {lookingForRoles.map(r => (
              <div key={r} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-lg">{r === 'Editor' ? '🎬' : r === 'Sound Designer' ? '🎧' : '🎨'}</span>
                <span className="text-sm font-medium text-white">{r}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40 mb-6">Not added yet</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[['Location', lookingForLocation], ['Project Type', lookingForProjectType], ['Budget', lookingForBudget], ['Timeline', lookingForTimeline]].map(([l, v]) => (
            <div key={l}><p className="text-xs text-white/30 uppercase tracking-wider mb-1">{l}</p><p className="text-sm text-white/70 font-medium">{v || 'Not added yet'}</p></div>
          ))}
        </div>
        <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] hover:scale-[1.02] active:scale-95">View Open Roles</button>
      </div>

      {/* Credits */}
      <SectionCard title="Creator Credits">
        {p.credits.length > 0 ? (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_140px_80px] gap-4 px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/5"><span>Project</span><span>Role</span><span>Year</span></div>
            {p.credits.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_80px] gap-1 sm:gap-4 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                <span className="font-medium text-sm text-white group-hover:text-purple-light transition-colors cursor-pointer">{c.project}</span>
                <span className="text-sm text-white/50">{c.role}</span>
                <span className="text-sm text-white/40">{c.year}</span>
              </div>
            ))}
          </>
        ) : (
          <SectionEmpty text="No credits yet." />
        )}
      </SectionCard>

      {/* Bottom Actions */}
      <ProfileActions isOwn={isOwn} userRole={userRole} onEditProfile={onEditProfile} onViewResume={onViewResume} resumeUrl={p.resume_url} />
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*            SUB-COMPONENTS                   */
/* ═══════════════════════════════════════════ */

/* ─── SECTION WRAPPER ─── */
function SectionCard({ title, subtitle, children, id }) {
  return (
    <div id={id} className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-white/40 text-sm mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  )
}

/* ─── PROFILE HERO ─── */
function ProfileHero({ profile, isOwn, userRole, onEditProfile, onViewResume }) {
  const isCreator = userRole === 'creator'
  return (
    <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(98,57,191,0.15)]">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            {profile.available && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#111]" title="Available" />
            )}
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h1 className="font-['DM_Serif_Display'] text-2xl sm:text-3xl font-normal tracking-tight mb-1">{profile.name}</h1>

            {/* ── ROLE BADGE ── */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              {isCreator ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-purple-light bg-purple/15 border border-purple/40 rounded-full shadow-[0_0_10px_rgba(98,57,191,0.15)]">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
            </div>

            {/* Location & Level */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                {profile.location ? profile.location : <span className="text-white/30">Location not set</span>}
              </span>
              {profile.experienceLevel ? (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{profile.experienceLevel}</span>
                </>
              ) : null}
            </div>

            {/* Availability */}
            {profile.available && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {profile.availabilityText}
              </span>
            )}

            {/* Skill Chips */}
            {profile.allRoles.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                {profile.allRoles.map(r => (
                  <span key={r} className="px-3 py-1 text-xs font-medium text-purple-light bg-purple/10 border border-purple/25 rounded-full">{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 shrink-0 sm:min-w-[160px]">
          {isOwn ? (
            <>
              <button
                id="edit-profile-hero-btn"
                onClick={onEditProfile}
                className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] hover:scale-[1.02] active:scale-95"
              >
                Edit Profile
              </button>
              {profile.resume_url && (
                <button
                  id="view-resume-hero-btn"
                  onClick={() => onViewResume(profile.resume_url)}
                  className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View Resume
                </button>
              )}
              {isCreator ? (
                <Link to="/create-project" className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/30 hover:text-purple-light hover:scale-[1.02] active:scale-95 text-center">
                  + Start Project
                </Link>
              ) : (
                <Link to="/explore" className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-emerald-500/30 hover:text-emerald-400 hover:scale-[1.02] active:scale-95 text-center">
                  Find Projects
                </Link>
              )}
            </>
          ) : (
            <>
              {profile.resume_url && (
                <button
                  id="view-resume-hero-btn"
                  onClick={() => onViewResume(profile.resume_url)}
                  className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  View Resume
                </button>
              )}
              <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] hover:scale-[1.02] active:scale-95">
                Invite to Project
              </button>
              <button className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">
                Share Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── STATS BAR COLLABORATOR ─── */
function StatsBarCollaborator({ stats }) {
  const items = [
    { label: 'Projects Joined', value: stats.projectsJoined },
    { label: 'Films Completed', value: stats.filmsCompleted },
    { label: 'Roles Performed', value: stats.rolesPerformed },
    { label: 'Credits', value: stats.credits },
  ]
  return (
    <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {items.map(i => (
        <div key={i.label} className="glass-card rounded-2xl p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{i.value}</p>
          <p className="text-white/40 text-xs sm:text-sm">{i.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── STATS BAR CREATOR ─── */
function StatsBarCreator({ stats }) {
  const items = [
    { label: 'Projects Created', value: stats.projectsCreated },
    { label: 'Films Completed', value: stats.filmsCompleted },
    { label: 'Active Projects', value: stats.activeProjects },
  ]
  return (
    <div className="reveal grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {items.map(i => (
        <div key={i.label} className="glass-card rounded-2xl p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{i.value}</p>
          <p className="text-white/40 text-xs sm:text-sm">{i.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── PORTFOLIO ─── */
function PortfolioSection({ items, title = 'Portfolio' }) {
  return (
    <div id="profile-portfolio" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-white/40 text-sm mb-6">Selected work and previous projects</p>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.12)] hover:-translate-y-1">
              {/* Thumbnail */}
              <div className="relative h-44 overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-white/50">{item.role} • {item.year}</p>
                </div>
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="font-['DM_Serif_Display'] font-normal text-base mb-1.5 group-hover:text-purple-light transition-colors duration-300">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                <button className="w-full py-2.5 text-sm font-semibold text-purple-light border border-purple/25 rounded-lg transition-all duration-300 group-hover:bg-purple group-hover:text-white group-hover:border-purple group-hover:shadow-[0_0_16px_rgba(98,57,191,0.25)]">
                  Watch Film
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/25 text-sm">No portfolio items yet.</p>
          <Link to="/explore" className="inline-block mt-4 text-sm text-purple hover:text-purple-light transition-colors">Explore projects to build your portfolio</Link>
        </div>
      )}
    </div>
  )
}

/* ─── EXPERIENCE TIMELINE ─── */
function ExperienceTimeline({ items, title = 'Experience' }) {
  return (
    <SectionCard title={title} id="profile-experience">
      {items.length > 0 ? (
        <div className="relative pl-6 sm:pl-8">
          {/* Vertical line */}
          <div className="absolute left-[7px] sm:left-[11px] top-2 bottom-2 w-px bg-white/10" />
          <div className="space-y-8">
            {items.map((item, i) => (
              <div key={i} className="relative">
                {/* Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-purple/20 border-2 border-purple flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-light bg-purple/10 px-2 py-0.5 rounded">{item.year}</span>
                    <span className="text-xs text-white/30">{item.location}</span>
                  </div>
                  <h3 className="font-['DM_Serif_Display'] font-normal text-base mb-0.5">{item.project}</h3>
                  <p className="text-sm text-white/50 mb-1">{item.role}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/25 text-sm">No experience entries yet.</p>
        </div>
      )}
    </SectionCard>
  )
}

/* ─── PROJECTS JOINED ─── */
function ProjectsJoinedSection({ items, title = 'Projects Joined' }) {
  return (
    <div id="profile-projects" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="text-xl font-bold mb-1">{title}</h2>
      <p className="text-white/40 text-sm mb-6">Films and projects I've contributed to</p>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.12)] hover:-translate-y-1">
              <div className="relative h-36 overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre}</span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm rounded-full">{item.status}</span>
              </div>
              <div className="p-4">
                <h3 className="font-['DM_Serif_Display'] font-normal text-sm mb-1 group-hover:text-purple-light transition-colors duration-300">{item.title}</h3>
                <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.location}
                </p>
                <p className="text-xs text-purple-light mb-3">Role: {item.role}</p>
                <Link to={`/project/${item.id}`} className="block w-full py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(98,57,191,0.25)]">
                  View Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/25 text-sm">No projects joined yet.</p>
          <Link to="/explore" className="inline-block mt-4 text-sm text-purple hover:text-purple-light transition-colors">Explore projects to collaborate on</Link>
        </div>
      )}
    </div>
  )
}

/* ─── FILM CREDITS ─── */
function CreditsSection({ items }) {
  return (
    <SectionCard title="Film Credits" id="profile-credits">
      {items.length > 0 ? (
        <div className="space-y-0">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px] gap-4 px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/5">
            <span>Project</span><span>Role</span><span>Year</span><span className="text-right">Status</span>
          </div>
          {items.map((c, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px_100px] gap-1 sm:gap-4 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200 group">
              <span className="font-medium text-sm text-white group-hover:text-purple-light transition-colors duration-200 cursor-pointer">{c.project}</span>
              <span className="text-sm text-white/50"><span className="sm:hidden text-white/30 text-xs">Role: </span>{c.role}</span>
              <span className="text-sm text-white/40"><span className="sm:hidden text-white/30 text-xs">Year: </span>{c.year}</span>
              <span className="sm:text-right">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  {c.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-white/25 text-sm">No film credits yet.</p>
        </div>
      )}
    </SectionCard>
  )
}

/* ─── AVAILABILITY ─── */
function AvailabilitySection({ data, available }) {
  const types = data.collaborationTypes || []
  const prefRoles = data.preferredRoles || []
  const locations = data.preferredLocations || []
  return (
    <SectionCard title="Availability & Preferences" id="profile-availability">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Collaboration Types</p>
          {types.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {types.map(t => <span key={t} className="px-3 py-1 text-xs font-medium text-purple-light bg-purple/10 border border-purple/20 rounded-full">{t}</span>)}
            </div>
          ) : (
            <p className="text-xs text-white/30">Not specified</p>
          )}
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Preferred Roles</p>
          {prefRoles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {prefRoles.map(r => <span key={r} className="px-3 py-1 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 rounded-full">{r}</span>)}
            </div>
          ) : (
            <p className="text-xs text-white/30">Not specified</p>
          )}
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 font-medium">Preferred Locations</p>
          {locations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {locations.map(l => <span key={l} className="px-3 py-1 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 rounded-full">{l}</span>)}
            </div>
          ) : (
            <p className="text-xs text-white/30">Not specified</p>
          )}
        </div>
      </div>
      <div className="mt-6 pt-5 border-t border-white/5 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
        <span className="text-xs text-white/50">{available ? 'Currently accepting new collaboration requests' : 'Not currently accepting new projects'}</span>
      </div>
    </SectionCard>
  )
}

/* ─── FEATURED CARD ─── */
function FeaturedCard({ item }) {
  return (
    <div className="group rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_12px_40px_rgba(98,57,191,0.12)]">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <span className="px-3 py-1 text-xs font-semibold bg-purple text-white rounded-full mb-3 inline-block">{item.role}</span>
          <h3 className="font-['DM_Serif_Display'] font-normal text-2xl text-white mb-2">{item.title}</h3>
          <p className="text-white/60 text-sm max-w-xl line-clamp-2 mb-4">{item.description}</p>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.3)]">Watch Film</button>
            <Link to={`/project/${item.id}`} className="px-5 py-2.5 bg-white/[0.06] border border-white/10 text-white/70 text-sm font-medium rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">View Project</Link>
          </div>
        </div>
        <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm rounded-full">{item.status}</span>
      </div>
    </div>
  )
}

/* ─── ACTIVE PROJECT CARD ─── */
function ActiveProjectCard({ item, isOwn }) {
  if (!item) return null
  const rolesNeeded = Array.isArray(item.rolesNeeded) ? item.rolesNeeded : []
  const pendingCount = item.pendingApplicationsCount != null ? Number(item.pendingApplicationsCount) : (item.applications != null ? Number(item.applications) : 0)
  const teamCount = item.teamMembersCount != null ? Number(item.teamMembersCount) : 0

  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(98,57,191,0.12)] hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative h-40 overflow-hidden">
          <img src={item.thumbnail || '/images/hero-bg.png'} alt={item.title || 'Project'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre || 'Film'}</span>
          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold border border-amber-500/40 text-amber-400 bg-amber-500/20 backdrop-blur-sm rounded-full">{item.status || 'Open'}</span>
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-['DM_Serif_Display'] font-normal text-base mb-1 group-hover:text-purple-light transition-colors">{item.title || 'Untitled Project'}</h3>
          <p className="text-white/40 text-xs mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {item.location || 'Remote'}
          </p>
          {rolesNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {rolesNeeded.map(r => <span key={r} className="px-2 py-0.5 text-[10px] font-medium text-purple-light border border-purple/20 rounded-full">{r}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0">
        {/* Dynamic Pending Applications & Team Members count */}
        <div className="flex items-center justify-between text-xs py-2 mb-3 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${pendingCount > 0 ? 'bg-purple animate-pulse' : 'bg-white/20'}`} />
            <span className={pendingCount > 0 ? 'text-purple-light font-semibold' : 'text-white/40'}>
              {pendingCount} Pending {pendingCount === 1 ? 'Application' : 'Applications'}
            </span>
          </span>
          <span className="flex items-center gap-1 text-white/40">
            <svg className="w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {teamCount} {teamCount === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        <div className="flex gap-2">
          <Link to={`/project/${item.id}`} className="flex-1 py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark">View Project</Link>
          {isOwn && <Link to="/my-projects" className="flex-1 py-2 text-xs font-semibold text-center bg-white/[0.04] border border-white/10 text-white/60 rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">Manage</Link>}
        </div>
      </div>
    </div>
  )
}

/* ─── PROJECT CREATED CARD ─── */
function ProjectCreatedCard({ item }) {
  if (!item) return null
  const pendingCount = item.pendingApplicationsCount != null ? Number(item.pendingApplicationsCount) : 0
  const teamCount = item.teamMembersCount != null ? Number(item.teamMembersCount) : 0

  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative h-36 overflow-hidden">
          <img src={item.thumbnail || '/images/hero-bg.png'} alt={item.title || 'Project'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre || 'Film'}</span>
          <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${item.status === 'Completed' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20' : 'border-amber-500/40 text-amber-400 bg-amber-500/20'}`}>{item.status || 'Open'}</span>
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-['DM_Serif_Display'] font-normal text-sm mb-0.5 group-hover:text-purple-light transition-colors">{item.title || 'Untitled Project'}</h3>
          <p className="text-white/40 text-xs mb-1">{item.language || 'English'} • {item.location || 'Remote'} • {item.year || '2026'}</p>
          <p className="text-xs text-purple-light mb-2">{item.role || 'Creator'}</p>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="flex items-center justify-between text-xs py-2 mb-3 border-t border-white/5 text-white/40">
          <span>{pendingCount} Pending</span>
          <span>{teamCount} Team</span>
        </div>
        <Link to={`/project/${item.id}`} className="block w-full py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark">View Project</Link>
      </div>
    </div>
  )
}

/* ─── TEAM CARD ─── */
function TeamCard({ team }) {
  const members = Array.isArray(team.members) ? team.members : []
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-['DM_Serif_Display'] font-normal text-base mb-4 uppercase tracking-wide text-white/80">{team.project}</h3>
      {members.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {members.map(m => (
            <div key={m.name} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
                {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-purple">{m.name.charAt(0)}</span>}
              </div>
              <div><p className="text-xs font-medium text-white leading-tight">{m.name}</p><p className="text-[10px] text-white/40">{m.role}</p></div>
            </div>
          ))}
        </div>
      )}
      <button className="px-4 py-2 text-xs font-medium bg-white/[0.04] border border-white/10 text-white/60 rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">View Team</button>
    </div>
  )
}

/* ─── COMPLETED FILM CARD ─── */
function CompletedFilmCard({ item }) {
  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-['DM_Serif_Display'] font-normal text-base mb-1 group-hover:text-purple-light transition-colors">{item.title}</h3>
        <p className="text-white/40 text-xs mb-1">{item.genre} • {item.runtime} • {item.language || 'English'} • {item.year}</p>
        <p className="text-xs text-purple-light mb-3">{item.role}</p>
        <button className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${item.hasVideo ? 'bg-purple text-white hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(98,57,191,0.25)]' : 'bg-white/[0.04] border border-white/10 text-white/40 cursor-default'}`}>
          {item.hasVideo ? 'Watch Film' : 'Film Coming Soon'}
        </button>
      </div>
    </div>
  )
}

/* ─── SECTION EMPTY ─── */
function SectionEmpty({ text, btnLabel, btnLink }) {
  return (
    <div className="col-span-full py-10 text-center border border-white/10 border-dashed rounded-xl bg-white/[0.02]">
      <p className="text-white/40 text-sm">{text}</p>
      {btnLabel && btnLink && (
        <Link to={btnLink} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.3)] hover:scale-[1.02] active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {btnLabel}
        </Link>
      )}
    </div>
  )
}

/* ─── PROFILE ACTIONS ─── */
function ProfileActions({ isOwn, userRole, onEditProfile, onViewResume, resumeUrl }) {
  const isCreator = userRole === 'creator'
  return (
    <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 mb-8">
      {isOwn ? (
        <>
          <button onClick={onEditProfile} className="w-full sm:w-auto px-8 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] hover:scale-[1.02] active:scale-95">Edit Profile</button>
          {resumeUrl && (
            <button
              onClick={() => onViewResume && onViewResume(resumeUrl)}
              className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Resume
            </button>
          )}
          {isCreator ? (
            <>
              <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Manage Portfolio</button>
              <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Update Availability</button>
            </>
          ) : (
            <>
              <Link to="/explore" className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-emerald-500/30 hover:text-emerald-400 hover:scale-[1.02] active:scale-95 text-center">
                Find Projects to Join
              </Link>
              <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Update Availability</button>
            </>
          )}
        </>
      ) : (
        <>
          {resumeUrl && (
            <button
              onClick={() => onViewResume && onViewResume(resumeUrl)}
              className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-purple/40 hover:text-white hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              View Resume
            </button>
          )}
          <button className="w-full sm:w-auto px-8 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] hover:scale-[1.02] active:scale-95">Invite to Project</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">View Portfolio</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Share Profile</button>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*        EDIT PROFILE MODAL COMPONENT         */
/* ═══════════════════════════════════════════ */
function EditProfileModal({ isOpen, onClose, user, onSaveSuccess }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [skills, setSkills] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeName, setResumeName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '')
      setLocation(user.location || '')
      setBio(user.bio || '')
      const userSkills = Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '')
      setSkills(userSkills)
      setAvatarFile(null)
      setAvatarPreview(user.avatar || user.profile_photo_url || '')
      setResumeFile(null)
      setResumeName('')
      setErrorMsg('')
    }
  }, [user, isOpen])

  if (!isOpen || !user) return null

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
      let newResumeUrl = null

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

        newResumeUrl = resumePath
      }

      // 3. Update profile
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const updatePayload = {
        name: name.trim(),
        location: location.trim(),
        bio: bio.trim(),
        skills: skillsArray,
      }

      if (newAvatarUrl) {
        updatePayload.profile_photo_url = newAvatarUrl
      }
      if (newResumeUrl) {
        updatePayload.resume_url = newResumeUrl
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      if (updateErr) throw updateErr

      onSaveSuccess()
    } catch (err) {
      console.error('Error updating profile:', err)
      setErrorMsg(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
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
              <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(98,57,191,0.15)] bg-white/[0.03]">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Profile Photo</label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {avatarFile ? avatarFile.name : 'Choose Image'}
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-[11px] text-white/30 mt-1.5">JPG, PNG, or WebP. Max 5MB.</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
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
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="e.g. Mumbai, India"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="Tell the film industry about yourself..."
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Skills</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="e.g. Cinematography, Sound Design, Editing"
            />
            <p className="text-[11px] text-white/30 mt-1.5">Separate skills with commas</p>
          </div>

          {/* Resume Upload */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Resume / CV</label>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white/70 cursor-pointer transition-all hover:border-purple/40 hover:text-purple-light">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {resumeName || 'Upload PDF Resume'}
              <input type="file" accept="application/pdf" onChange={handleResumeChange} className="hidden" />
            </label>
            {user.resume_url && !resumeFile && (
              <p className="text-[11px] text-emerald-400/70 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Resume already uploaded
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.4)] disabled:opacity-50"
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
