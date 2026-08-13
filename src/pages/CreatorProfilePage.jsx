import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { creatorData as p } from '../data/creatorProfileData'

function CreatorProfilePage() {
  const [isOwn] = useState(true)
  const [projectTab, setProjectTab] = useState('Active')
  useEffect(() => { window.scrollTo(0, 0) }, [])

  const filteredProjects = p.projectsCreated.filter(pr => projectTab === 'Active' ? pr.status === 'Active' : pr.status === 'Completed')

  return (
    <section className="min-h-screen pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <CreatorHero profile={p} isOwn={isOwn} />
        <StatsBar stats={p.stats} />
        <Sec title="About"><p className="text-white/60 leading-relaxed max-w-2xl text-[15px]">{p.bio}</p><p className="text-white/50 text-sm mt-2 max-w-2xl">{p.bioSecondary}</p></Sec>

        {/* Featured Work */}
        <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-[Montserrat] text-xl font-bold mb-1">Featured Work</h2>
          <p className="text-white/40 text-sm mb-6">Cinematic highlights from my filmography</p>
          <div className="space-y-6">
            {p.featuredWork.map(fw => <FeaturedCard key={fw.id} item={fw} />)}
          </div>
        </div>

        {/* Active Projects */}
        <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-[Montserrat] text-xl font-bold mb-1">Active Projects</h2>
          <p className="text-white/40 text-sm mb-6">Projects currently looking for collaborators</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {p.activeProjects.map(ap => <ActiveProjectCard key={ap.id} item={ap} isOwn={isOwn} />)}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map(pr => <ProjectCreatedCard key={pr.id} item={pr} />)}
          </div>
        </div>

        {/* Current Collaborations */}
        <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-[Montserrat] text-xl font-bold mb-6">Current Collaborations</h2>
          <div className="space-y-5">
            {p.teams.map(team => <TeamCard key={team.project} team={team} />)}
          </div>
        </div>

        {/* Filmography */}
        <Sec title="Filmography">
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
        </Sec>

        {/* Completed Films */}
        <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-[Montserrat] text-xl font-bold mb-6">Completed Films</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {p.completedFilms.map(cf => <CompletedFilmCard key={cf.id} item={cf} />)}
          </div>
        </div>

        {/* Skills */}
        <Sec title="Skills">
          <div className="flex flex-wrap gap-3">{p.skills.map(s => <span key={s} className="px-4 py-2 text-sm font-medium text-white bg-white/[0.04] border border-white/10 rounded-full transition-all duration-300 hover:border-purple/50 hover:shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-default">{s}</span>)}</div>
        </Sec>

        {/* Currently Looking For */}
        <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
          <h2 className="font-[Montserrat] text-xl font-bold mb-6">Currently Looking For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {p.lookingFor.roles.map(r => (
              <div key={r} className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                <span className="text-lg">{r === 'Editor' ? '🎬' : r === 'Sound Designer' ? '🎧' : '🎨'}</span>
                <span className="text-sm font-medium text-white">{r}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[['Location', p.lookingFor.location], ['Project Type', p.lookingFor.projectType], ['Budget', p.lookingFor.budget], ['Timeline', p.lookingFor.timeline]].map(([l, v]) => (
              <div key={l}><p className="text-xs text-white/30 uppercase tracking-wider mb-1">{l}</p><p className="text-sm text-white/70 font-medium">{v}</p></div>
            ))}
          </div>
          <button className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:scale-[1.02] active:scale-95">View Open Roles</button>
        </div>

        {/* Credits */}
        <Sec title="Creator Credits">
          <div className="hidden sm:grid grid-cols-[1fr_140px_80px] gap-4 px-4 py-2 text-xs font-semibold text-white/30 uppercase tracking-wider border-b border-white/5"><span>Project</span><span>Role</span><span>Year</span></div>
          {p.credits.map((c, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_80px] gap-1 sm:gap-4 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
              <span className="font-medium text-sm text-white group-hover:text-purple-light transition-colors cursor-pointer">{c.project}</span>
              <span className="text-sm text-white/50">{c.role}</span>
              <span className="text-sm text-white/40">{c.year}</span>
            </div>
          ))}
        </Sec>

        {/* Bottom Actions */}
        <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 mb-8">
          {isOwn ? (<>
            <Btn primary>Edit Profile</Btn><Btn>Start New Project</Btn><Btn>Manage Projects</Btn>
          </>) : (<>
            <Btn primary>Invite to Project</Btn><Btn>View Active Projects</Btn><Btn>Share Profile</Btn>
          </>)}
        </div>
      </div>
    </section>
  )
}

/* ── Reusable helpers ── */
function Sec({ title, children }) {
  return <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6"><h2 className="font-[Montserrat] text-xl font-bold mb-5">{title}</h2>{children}</div>
}

function Btn({ children, primary }) {
  return <button className={`w-full sm:w-auto px-8 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 ${primary ? 'bg-purple text-white hover:bg-purple-dark hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]' : 'bg-white/[0.04] border border-white/10 text-white/70 hover:border-white/20 hover:text-white'}`}>{children}</button>
}

/* ── Creator Hero ── */
function CreatorHero({ profile, isOwn }) {
  return (
    <div className="reveal glass-card rounded-2xl p-6 sm:p-8 mb-6">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[3px] border-purple/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]"><img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" /></div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-[Montserrat] text-2xl sm:text-3xl font-bold tracking-tight mb-1">{profile.name}</h1>
            <p className="text-white/60 text-sm sm:text-base mb-3">{profile.primaryRole} • {profile.secondaryRoles.join(' • ')}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4 text-sm text-white/50">
              <span className="inline-flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>{profile.location}</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span>{profile.experienceLevel}</span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {profile.allRoles.map(r => <span key={r} className="px-3 py-1 text-xs font-medium text-purple-light bg-purple/10 border border-purple/25 rounded-full">{r}</span>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 shrink-0 sm:min-w-[170px]">
          {isOwn ? (<><Btn primary>Edit Profile</Btn><Btn>Start New Project</Btn></>) : (<><Btn primary>Invite to Project</Btn><Btn>Share Profile</Btn></>)}
        </div>
      </div>
    </div>
  )
}

/* ── Stats ── */
function StatsBar({ stats }) {
  const items = [['Projects Created', stats.projectsCreated], ['Films Completed', stats.filmsCompleted], ['Active Projects', stats.activeProjects], ['Team Members', stats.teamMembers]]
  return (
    <div className="reveal grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {items.map(([l, v]) => <div key={l} className="glass-card rounded-2xl p-5 text-center"><p className="font-[Montserrat] text-2xl sm:text-3xl font-bold text-white mb-1">{v}</p><p className="text-white/40 text-xs sm:text-sm">{l}</p></div>)}
    </div>
  )
}

/* ── Featured Card ── */
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
            <button className="px-5 py-2.5 bg-white/[0.06] border border-white/10 text-white/70 text-sm font-medium rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">View Project</button>
          </div>
        </div>
        <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold border border-emerald-500/40 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm rounded-full">{item.status}</span>
      </div>
    </div>
  )
}

/* ── Active Project Card ── */
function ActiveProjectCard({ item, isOwn }) {
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
        <div className="flex flex-wrap gap-1.5 mb-3">{item.rolesNeeded.map(r => <span key={r} className="px-2 py-0.5 text-[10px] font-medium text-purple-light border border-purple/20 rounded-full">{r}</span>)}</div>
        <p className="text-xs text-white/30 mb-3">{item.applications} Applications</p>
        <div className="flex gap-2">
          <Link to={`/project/${item.id}`} className="flex-1 py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark">View Project</Link>
          {isOwn && <button className="flex-1 py-2 text-xs font-semibold text-center bg-white/[0.04] border border-white/10 text-white/60 rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">Manage</button>}
        </div>
      </div>
    </div>
  )
}

/* ── Project Created Card ── */
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
        <p className="text-white/40 text-xs mb-1">{item.language} • {item.location} • {item.year}</p>
        <p className="text-xs text-purple-light mb-3">{item.role}</p>
        <Link to={`/project/${item.id}`} className="block w-full py-2 text-xs font-semibold text-center bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark">View Project</Link>
      </div>
    </div>
  )
}

/* ── Team Card ── */
function TeamCard({ team }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="font-[Montserrat] font-bold text-base mb-4 uppercase tracking-wide text-white/80">{team.project}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {team.members.map(m => (
          <div key={m.name} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-purple/20 border border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
              {m.avatar ? <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-purple">{m.name.charAt(0)}</span>}
            </div>
            <div><p className="text-xs font-medium text-white leading-tight">{m.name}</p><p className="text-[10px] text-white/40">{m.role}</p></div>
          </div>
        ))}
      </div>
      <button className="px-4 py-2 text-xs font-medium bg-white/[0.04] border border-white/10 text-white/60 rounded-lg transition-all duration-300 hover:text-white hover:border-white/20">View Team</button>
    </div>
  )
}

/* ── Completed Film Card ── */
function CompletedFilmCard({ item }) {
  return (
    <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-white/[0.02] transition-all duration-500 hover:border-purple/30 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="p-4">
        <h3 className="font-[Montserrat] font-bold text-base mb-1 group-hover:text-purple-light transition-colors">{item.title}</h3>
        <p className="text-white/40 text-xs mb-1">{item.genre} • {item.runtime} • {item.language} • {item.year}</p>
        <p className="text-xs text-purple-light mb-3">{item.role}</p>
        <button className={`w-full py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 ${item.hasVideo ? 'bg-purple text-white hover:bg-purple-dark hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]' : 'bg-white/[0.04] border border-white/10 text-white/40 cursor-default'}`}>
          {item.hasVideo ? 'Watch Film' : 'Film Coming Soon'}
        </button>
      </div>
    </div>
  )
}

export default CreatorProfilePage
