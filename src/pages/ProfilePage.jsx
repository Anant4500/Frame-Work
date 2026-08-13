import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Mock Profile Data ── */
const profileData = {
  name: 'Aryan Kulkarni',
  primaryRole: 'Editor',
  secondaryRoles: ['Colorist'],
  allRoles: ['Editor', 'Colorist'],
  location: 'Pune, Maharashtra',
  experienceLevel: 'Student Filmmaker',
  available: true,
  availabilityText: 'Available for collaboration',
  avatar: '/images/profile/avatar.png',
  bio: 'Film editing student passionate about narrative editing, color grading and experimental short films. Interested in collaborating with emerging filmmakers and building meaningful independent projects.',
  stats: { projectsJoined: 12, filmsCompleted: 5, rolesPerformed: 3, credits: 8 },
  skills: ['Adobe Premiere Pro', 'DaVinci Resolve', 'Color Grading', 'Video Editing', 'Sound Editing', 'Storytelling'],
  portfolio: [
    { id: 1, title: 'The Last Frame', role: 'Editor', year: '2026', description: 'Character-driven short film exploring memory and identity.', thumbnail: '/images/profile/the-last-frame.png' },
    { id: 2, title: 'Echoes', role: 'Editor / Colorist', year: '2025', description: 'Experimental short exploring urban isolation and longing.', thumbnail: '/images/profile/echoes.png' },
    { id: 3, title: 'Unwritten', role: 'Colorist', year: '2025', description: 'A documentary about forgotten stories in rural Maharashtra.', thumbnail: '/images/profile/unwritten.png' },
  ],
  experience: [
    { year: '2026', project: 'The Last Frame', role: 'Editor', location: 'Pune', description: 'Handled narrative editing, pacing and final color correction.' },
    { year: '2025', project: 'Echoes', role: 'Editor / Colorist', location: 'Mumbai', description: 'Led post-production workflow including editing and color grading.' },
    { year: '2025', project: 'Unwritten', role: 'Colorist', location: 'Pune', description: 'Created the color palette and graded all footage for documentary release.' },
  ],
  projectsJoinedList: [
    { id: 1, title: 'The Last Frame', genre: 'Thriller', location: 'Pune', role: 'Editor', status: 'Completed', thumbnail: '/images/profile/the-last-frame.png' },
    { id: 2, title: 'Echoes', genre: 'Drama', location: 'Mumbai', role: 'Editor / Colorist', status: 'Completed', thumbnail: '/images/profile/echoes.png' },
    { id: 3, title: 'Unwritten', genre: 'Documentary', location: 'Pune', role: 'Colorist', status: 'Completed', thumbnail: '/images/profile/unwritten.png' },
  ],
  filmCredits: [
    { project: 'The Last Frame', role: 'Editor', year: '2026', status: 'Completed' },
    { project: 'Echoes', role: 'Colorist', year: '2025', status: 'Completed' },
    { project: 'Unwritten', role: 'Colorist', year: '2025', status: 'Completed' },
    { project: 'Still Waters', role: 'Editor', year: '2025', status: 'Completed' },
    { project: 'Fractured', role: 'Editor', year: '2024', status: 'Completed' },
  ],
  availability: {
    collaborationTypes: ['Passion Projects', 'Short Films', 'Student Films'],
    preferredRoles: ['Editor', 'Colorist'],
    preferredLocations: ['Pune', 'Mumbai', 'Remote'],
  },
}

/* ═══════════════════════════════════════════ */
/*              PROFILE PAGE                   */
/* ═══════════════════════════════════════════ */
function ProfilePage() {
  const { user } = useAuth()
  const [isOwnProfile] = useState(true)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const p = profileData

  return (
    <section className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── HERO ── */}
        <ProfileHero profile={p} isOwn={isOwnProfile} />

        {/* ── STATS ── */}
        <StatsBar stats={p.stats} />

        {/* ── ABOUT ── */}
        <SectionCard title="About" id="profile-about">
          <p className="text-white/60 leading-relaxed max-w-2xl text-[15px]">{p.bio}</p>
        </SectionCard>

        {/* ── SKILLS ── */}
        <SectionCard title="Skills" id="profile-skills">
          <div className="flex flex-wrap gap-3">
            {p.skills.map(s => (
              <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-default">
                {s}
              </span>
            ))}
          </div>
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
        <ProfileActions isOwn={isOwnProfile} />

      </div>
    </section>
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

/* ─── STATS BAR ─── */
function StatsBar({ stats }) {
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

/* ─── PORTFOLIO ─── */
function PortfolioSection({ items }) {
  return (
    <div id="profile-portfolio" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="font-[Montserrat] text-xl font-bold mb-1">Portfolio</h2>
      <p className="text-white/40 text-sm mb-6">Selected work and previous projects</p>
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
    </div>
  )
}

/* ─── EXPERIENCE TIMELINE ─── */
function ExperienceTimeline({ items }) {
  return (
    <SectionCard title="Experience" id="profile-experience">
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
    </SectionCard>
  )
}

/* ─── PROJECTS JOINED ─── */
function ProjectsJoinedSection({ items }) {
  return (
    <div id="profile-projects" className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <h2 className="font-[Montserrat] text-xl font-bold mb-1">Projects Joined</h2>
      <p className="text-white/40 text-sm mb-6">Films and projects I've contributed to</p>
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
    </div>
  )
}

/* ─── FILM CREDITS ─── */
function CreditsSection({ items }) {
  return (
    <SectionCard title="Film Credits" id="profile-credits">
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
    </SectionCard>
  )
}

/* ─── AVAILABILITY ─── */
function AvailabilitySection({ data, available }) {
  return (
    <SectionCard title={available ? 'Currently Available' : 'Currently Unavailable'} id="profile-availability">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AvailChipGroup label="Preferred Collaboration" items={data.collaborationTypes} />
        <AvailChipGroup label="Preferred Roles" items={data.preferredRoles} />
        <AvailChipGroup label="Preferred Locations" items={data.preferredLocations} />
      </div>
    </SectionCard>
  )
}

function AvailChipGroup({ label, items }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(i => (
          <span key={i} className="px-3 py-1.5 text-xs font-medium text-white/70 bg-white/[0.04] border border-white/10 rounded-full">{i}</span>
        ))}
      </div>
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

export default ProfilePage
