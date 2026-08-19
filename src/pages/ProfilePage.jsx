import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'



/* ═══════════════════════════════════════════ */
/*              PROFILE PAGE                   */
/* ═══════════════════════════════════════════ */
function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isOwnProfile] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (!user) return null

  const userSkills = user.skills || []
  const primaryRole = userSkills[0] || (user.role === 'creator' ? 'Creator' : 'Collaborator')
  const secondaryRoles = userSkills.slice(1)
  const allRoles = userSkills.length > 0 ? userSkills : [primaryRole]

  const p = {
    name: user.name || 'Unknown User',
    primaryRole,
    secondaryRoles,
    allRoles,
    location: user.location || 'Not added yet',
    experienceLevel: user.experienceLevel || 'Not added yet',
    available: user.available !== undefined ? user.available : true,
    availabilityText: user.availabilityText || 'Available for collaboration',
    avatar: user.avatar || '/images/profile/avatar.png',
    bio: user.bio || 'Not added yet',
    bioSecondary: user.bioSecondary || '',
    stats: {
      projectsJoined: user.stats?.projectsJoined || 0,
      filmsCompleted: user.stats?.filmsCompleted || 0,
      rolesPerformed: user.stats?.rolesPerformed || 0,
      credits: user.stats?.credits || 0,
      projectsCreated: user.stats?.projectsCreated || 0,
      activeProjects: user.stats?.activeProjects || 0,
      teamMembers: user.stats?.teamMembers || 0,
    },
    skills: userSkills,
    portfolio: user.portfolio || [],
    experience: user.experience || [],
    projectsJoinedList: user.projectsJoinedList || [],
    filmCredits: user.filmCredits || [],
    availability: user.availability || {
      collaborationTypes: [],
      preferredRoles: [],
      preferredLocations: [],
    },
    // Creator specific properties
    featuredWork: user.featuredWork || [],
    activeProjects: user.activeProjects || [],
    projectsCreatedList: user.projectsCreatedList || [],
    teams: user.teams || [],
    filmography: user.filmography || [],
    completedFilms: user.completedFilms || [],
    lookingFor: user.lookingFor || {
      roles: [],
      location: 'Not added yet',
      projectType: 'Not added yet',
      budget: 'Not added yet',
      timeline: 'Not added yet',
    },
    credits: user.credits || []
  }

  return (
    <section className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      {user.role === 'creator' ? (
        <CreatorProfileLayout p={p} isOwn={isOwnProfile} />
      ) : (
        <CollaboratorProfileLayout p={p} isOwn={isOwnProfile} />
      )}
    </section>
  )
}

/* ─── COLLABORATOR LAYOUT ─── */
function CollaboratorProfileLayout({ p, isOwn }) {
  return (
    <div className="max-w-6xl mx-auto">
      {/* ── HERO ── */}
      <ProfileHero profile={p} isOwn={isOwn} />

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
              <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-default">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">Not added yet</p>
        )}
      </SectionCard>

      {/* ── PORTFOLIO ── */}
      <PortfolioSection items={p.portfolio} />

      {/* ── EXPERIENCE ── */}
      <ExperienceTimeline items={p.experience} />

      {/* ── PROJECTS JOINED ── */}
      <ProjectsJoinedSection items={p.projectsJoinedList} />

      {/* ── FILM CREDITS ── */}
      <CreditsSection items={p.filmCredits} />

      {/* ── AVAILABILITY ── */}
      <AvailabilitySection data={p.availability} available={p.available} />

      {/* ── PROFILE ACTIONS ── */}
      <ProfileActions isOwn={isOwn} />
    </div>
  )
}

/* ─── CREATOR LAYOUT ─── */
function CreatorProfileLayout({ p, isOwn }) {
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
      <ProfileHero profile={p} isOwn={isOwn} />

      {/* ── STATS ── */}
      <StatsBarCreator stats={p.stats} />

      {/* ── ABOUT ── */}
      <SectionCard title="About" id="profile-about">
        <p className="text-white/60 leading-relaxed max-w-2xl text-[15px]">{p.bio}</p>
        {p.bioSecondary && <p className="text-white/50 text-sm mt-2 max-w-2xl">{p.bioSecondary}</p>}
      </SectionCard>

      {/* Featured Work */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="font-[Montserrat] text-xl font-bold mb-1">Featured Work</h2>
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
        <h2 className="font-[Montserrat] text-xl font-bold mb-1">Active Projects</h2>
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
          <h2 className="font-[Montserrat] text-xl font-bold">Projects Created</h2>
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
        <h2 className="font-[Montserrat] text-xl font-bold mb-6">Current Collaborations</h2>
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
                  <h3 className="font-[Montserrat] font-bold text-base mt-1 cursor-pointer hover:text-purple-light transition-colors">{f.project}</h3>
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
        <h2 className="font-[Montserrat] text-xl font-bold mb-6">Completed Films</h2>
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
              <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-default">{s}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">Not added yet</p>
        )}
      </SectionCard>

      {/* Currently Looking For */}
      <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="font-[Montserrat] text-xl font-bold mb-6">Currently Looking For</h2>
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
        <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">View Open Roles</button>
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
      <ProfileActions isOwn={isOwn} />
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
      <h2 className="font-[Montserrat] text-xl font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-white/40 text-sm mb-5">{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  )
}

/* ─── PROFILE HERO ─── */
function ProfileHero({ profile, isOwn }) {
  return (
    <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
        {/* Left: Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            {profile.available && (
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#111]" title="Available" />
            )}
          </div>

          {/* Info */}
          <div className="text-center sm:text-left">
            <h1 className="font-[Montserrat] text-2xl sm:text-3xl font-bold tracking-tight mb-1">{profile.name}</h1>
            <p className="text-white/60 text-sm sm:text-base mb-3">
              {profile.primaryRole}{profile.secondaryRoles.length > 0 && ` • ${profile.secondaryRoles.join(' • ')}`}
            </p>

            {/* Location & Level */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                {profile.location}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{profile.experienceLevel}</span>
            </div>

            {/* Availability */}
            {profile.available && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {profile.availabilityText}
              </span>
            )}

            {/* Role Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
              {profile.allRoles.map(r => (
                <span key={r} className="px-3 py-1 text-xs font-medium text-purple-light bg-purple/10 border border-purple/25 rounded-full">{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-3 shrink-0 sm:min-w-[160px]">
          {isOwn ? (
            <>
              <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">
                Edit Profile
              </button>
              <button className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">
                Share Profile
              </button>
            </>
          ) : (
            <>
              <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">
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
          <p className="font-[Montserrat] text-2xl sm:text-3xl font-bold text-white mb-1">{i.value}</p>
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
    { label: 'Team Members', value: stats.teamMembers },
  ]
  return (
    <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {items.map(i => (
        <div key={i.label} className="glass-card rounded-2xl p-5 text-center">
          <p className="font-[Montserrat] text-2xl sm:text-3xl font-bold text-white mb-1">{i.value}</p>
          <p className="text-white/40 text-xs sm:text-sm">{i.label}</p>
        </div>
      ))}
    </div>
  )
}

/* ─── PORTFOLIO ─── */
function PortfolioSection({ items }) {
  return (
    <div id="profile-portfolio" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="font-[Montserrat] text-xl font-bold mb-1">Portfolio</h2>
      <p className="text-white/40 text-sm mb-6">Selected work and previous projects</p>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)] hover:-translate-y-1">
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
                <h3 className="font-[Montserrat] font-bold text-base mb-1.5 group-hover:text-purple-light transition-colors duration-300">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                <button className="w-full py-2.5 text-sm font-semibold text-purple-light border border-purple/25 rounded-lg transition-all duration-300 group-hover:bg-purple group-hover:text-white group-hover:border-purple group-hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]">
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
function ExperienceTimeline({ items }) {
  return (
    <SectionCard title="Experience" id="profile-experience">
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
                  <h3 className="font-[Montserrat] font-bold text-base mb-0.5">{item.project}</h3>
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
function ProjectsJoinedSection({ items }) {
  return (
    <div id="profile-projects" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="font-[Montserrat] text-xl font-bold mb-1">Projects Joined</h2>
      <p className="text-white/40 text-sm mb-6">Films and projects I've contributed to</p>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)] hover:-translate-y-1">
              <div className="relative h-36 overflow-hidden">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre}</span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm rounded-full">{item.status}</span>
              </div>
              <div className="p-4">
                <h3 className="font-[Montserrat] font-bold text-sm mb-1 group-hover:text-purple-light transition-colors duration-300">{item.title}</h3>
                <p className="text-white/40 text-xs mb-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {item.location}
                </p>
                <p className="text-xs text-purple-light mb-3">Role: {item.role}</p>
                <Link to={`/project/${item.id}`} className="block w-full py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]">
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
  const collaborationTypes = data?.collaborationTypes || []
  const preferredRoles = data?.preferredRoles || []
  const preferredLocations = data?.preferredLocations || []

  return (
    <SectionCard title={available ? 'Currently Available' : 'Currently Unavailable'} id="profile-availability">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AvailChipGroup label="Preferred Collaboration" items={collaborationTypes} />
        <AvailChipGroup label="Preferred Roles" items={preferredRoles} />
        <AvailChipGroup label="Preferred Locations" items={preferredLocations} />
      </div>
    </SectionCard>
  )
}

function AvailChipGroup({ label, items }) {
  const list = Array.isArray(items) ? items : []
  return (
    <div>
      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">{label}</p>
      {list.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {list.map(i => (
            <span key={i} className="px-3 py-1.5 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 rounded-full">{i}</span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/20">Not added yet</p>
      )}
    </div>
  )
}

/* ─── PROFILE ACTIONS (bottom) ─── */
function ProfileActions({ isOwn }) {
  return (
    <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 mb-8">
      {isOwn ? (
        <>
          <button className="w-full sm:w-auto px-8 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">Edit Profile</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Manage Portfolio</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Update Availability</button>
        </>
      ) : (
        <>
          <button className="w-full sm:w-auto px-8 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">Invite to Project</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">View Portfolio</button>
          <button className="w-full sm:w-auto px-8 py-3 bg-white/[0.04] border border-white/10 text-white/70 text-sm font-medium rounded-xl transition-all duration-300 hover:border-white/20 hover:text-white hover:scale-[1.02] active:scale-95">Share Profile</button>
        </>
      )}
    </div>
  )
}

/* ─── SECTION EMPTY ─── */
function SectionEmpty({ text, btnLabel, btnLink }) {
  return (
    <div className="text-center py-10">
      <p className="text-white/25 text-sm">{text}</p>
      {btnLabel && btnLink && (
        <Link to={btnLink} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {btnLabel}
        </Link>
      )}
    </div>
  )
}

/* ─── FEATURED CARD ─── */
function FeaturedCard({ item }) {
  return (
    <div className="group relative rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_40px_rgba(139,92,246,0.12)]">
      <div className="relative aspect-video overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-white/50">
            <span>{item.genre}</span><span>•</span><span>{item.language}</span><span>•</span><span>{item.year}</span><span>•</span><span>{item.runtime}</span>
          </div>
          <h3 className="font-[Montserrat] text-xl sm:text-2xl font-bold mb-2 group-hover:text-purple-light transition-colors">{item.title}</h3>
          <p className="text-white/50 text-sm mb-4 max-w-lg">{item.logline}</p>
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-purple text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]">Watch Film</button>
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
  const rolesNeeded = Array.isArray(item.rolesNeeded) ? item.rolesNeeded : []
  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:shadow-[0_8px_32px_rgba(139,92,246,0.12)] hover:-translate-y-1">
      <div className="relative h-40 overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre}</span>
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold border border-amber-500/40 text-amber-400 bg-amber-500/20 backdrop-blur-sm rounded-full">{item.status}</span>
      </div>
      <div className="p-4">
        <h3 className="font-[Montserrat] font-bold text-base mb-1 group-hover:text-purple-light transition-colors">{item.title}</h3>
        <p className="text-white/40 text-xs mb-2 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{item.location}</p>
        {rolesNeeded.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {rolesNeeded.map(r => <span key={r} className="px-2 py-0.5 text-[10px] font-medium text-purple-light border border-purple/20 rounded-full">{r}</span>)}
          </div>
        )}
        <p className="text-xs text-white/30 mb-3">{item.applications || 0} Applications</p>
        <div className="flex gap-2">
          <Link to={`/project/${item.id}`} className="flex-1 py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark">View Project</Link>
          {isOwn && <button className="flex-1 py-2 text-xs font-semibold text-center bg-white/[0.04] border border-white/10 text-white/60 rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">Manage</button>}
        </div>
      </div>
    </div>
  )
}

/* ─── PROJECT CREATED CARD ─── */
function ProjectCreatedCard({ item }) {
  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:-translate-y-1">
      <div className="relative h-36 overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold bg-purple/80 backdrop-blur-sm rounded-full">{item.genre}</span>
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm rounded-full border ${item.status === 'Completed' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/20' : 'border-amber-500/40 text-amber-400 bg-amber-500/20'}`}>{item.status}</span>
      </div>
      <div className="p-4">
        <h3 className="font-[Montserrat] font-bold text-sm mb-0.5 group-hover:text-purple-light transition-colors">{item.title}</h3>
        <p className="text-white/40 text-xs mb-1">{item.language || 'English'} • {item.location} • {item.year}</p>
        <p className="text-xs text-purple-light mb-3">{item.role}</p>
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
      <h3 className="font-[Montserrat] font-bold text-base mb-4 uppercase tracking-wide text-white/80">{team.project}</h3>
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
        <h3 className="font-[Montserrat] font-bold text-base mb-1 group-hover:text-purple-light transition-colors">{item.title}</h3>
        <p className="text-white/40 text-xs mb-1">{item.genre} • {item.runtime} • {item.language || 'English'} • {item.year}</p>
        <p className="text-xs text-purple-light mb-3">{item.role}</p>
        <button className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${item.hasVideo ? 'bg-purple text-white hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]' : 'bg-white/[0.04] border border-white/10 text-white/40 cursor-default'}`}>
          {item.hasVideo ? 'Watch Film' : 'Film Coming Soon'}
        </button>
      </div>
    </div>
  )
}

export default ProfilePage
