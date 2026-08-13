import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'
import { joinedProjects, myApplications, getDashboardStats } from '../data/myProjectsData'

const STATUS_STYLES = {
  'Open': 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
  'Open for Collaboration': 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
  'Team Forming': 'border-sky-400/40 text-sky-300 bg-sky-500/15',
  'In Production': 'border-amber-500/40 text-amber-400 bg-amber-500/15',
  'Completed': 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15',
}

const APP_STATUS = {
  Pending: 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(139,92,246,0.15)]',
  Accepted: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15',
  Rejected: 'border-white/10 text-white/30 bg-white/5',
}

function MyProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState('created')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'creator') { navigate('/'); return }
  }, [user, navigate])

  const createdProjects = useMemo(() =>
    projects.filter((p) => p.creator?.name === user?.name),
    [projects, user]
  )

  const stats = useMemo(() =>
    getDashboardStats(createdProjects, joinedProjects, myApplications),
    [createdProjects]
  )

  if (!user || user.role !== 'creator') return null

  const tabs = [
    { key: 'created', label: 'Created', count: createdProjects.length },
    { key: 'joined', label: 'Joined', count: joinedProjects.length },
    { key: 'applications', label: 'Applications', count: myApplications.length },
  ]

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4 animate-fade-in-up">
          <div>
            <h1 className="font-[Montserrat] text-4xl sm:text-5xl font-black tracking-tight mb-3">
              My <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-white/40 text-lg max-w-xl">
              Manage the projects you're creating and the films you're helping bring to life.
            </p>
          </div>
          <Link
            to="/create-project"
            id="start-new-project-btn"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.03] active:scale-95 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Start New Project
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100" style={{ animationFillMode: 'both' }}>
          <StatCard label="Projects Created" value={stats.projectsCreated} icon={<IconFilm />} />
          <StatCard label="Projects Joined" value={stats.projectsJoined} icon={<IconUsers />} />
          <StatCard label="Active Collaborations" value={stats.activeCollaborations} icon={<IconBolt />} />
          <StatCard label="Completed Credits" value={stats.completedCredits} icon={<IconTrophy />} />
        </div>

        {/* Tabs */}
        <div className="relative flex gap-1 mb-8 border-b border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3.5 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                  activeTab === tab.key ? 'bg-purple/20 text-purple-light' : 'bg-white/5 text-white/30'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple rounded-full" style={{ animation: 'fadeIn 0.3s ease-out' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ animation: 'fadeInUp 0.5s ease-out' }} key={activeTab}>
          {activeTab === 'created' && <CreatedTab projects={createdProjects} />}
          {activeTab === 'joined' && <JoinedTab />}
          {activeTab === 'applications' && <ApplicationsTab />}
        </div>
      </div>
    </section>
  )
}

/* ─── Stats Card ─── */
function StatCard({ label, value, icon }) {
  return (
    <div className="group bg-[#111111] border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:border-white/10 hover:bg-[#141414]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center text-purple transition-all duration-300 group-hover:bg-purple/15 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]">
          {icon}
        </div>
        <span className="text-white/35 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-black font-[Montserrat] text-white">{value}</p>
    </div>
  )
}

/* ─── Created Tab ─── */
function CreatedTab({ projects }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<IconFilm />}
        title="You haven't created a project yet."
        subtitle="Bring your vision to life — start your first film project on FrameWork."
        btnLabel="Start Your First Project"
        btnLink="/create-project"
      />
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((p) => <CreatedCard key={p.id} project={p} />)}
    </div>
  )
}

function CreatedCard({ project }) {
  const isActive = project.status === 'Open' || project.status === 'In Production'
  return (
    <div className={`group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${isActive ? 'hover:border-purple/25 hover:shadow-[0_12px_40px_rgba(139,92,246,0.1)]' : 'hover:border-white/10'}`}>
      {/* Poster */}
      <div className="relative h-44 overflow-hidden">
        <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-transparent" />
        <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
          {project.genre}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${STATUS_STYLES[project.status] || STATUS_STYLES['Open']}`}>
          {project.status === 'Open' ? 'Open for Collaboration' : project.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-[Montserrat] text-lg font-bold mb-2 group-hover:text-purple-light transition-colors duration-300">
          {project.title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/35 text-xs mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {project.location}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
            {project.date}
          </span>
        </div>

        {/* Counts */}
        <div className="flex items-center gap-4 mb-5">
          <span className="flex items-center gap-1.5 text-xs text-white/40">
            <svg className="w-4 h-4 text-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            {project.applicants?.length || 0} Applications
          </span>
          <span className="flex items-center gap-1.5 text-xs text-white/40">
            <svg className="w-4 h-4 text-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            {project.applicants?.filter((a) => a.status === 'accepted').length || 0} Team
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/project/${project.id}`}
            className="flex-1 py-2.5 text-sm font-semibold bg-purple text-white rounded-xl text-center transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-95"
          >
            Manage Project
          </Link>
          <Link
            to={`/project/${project.id}`}
            className="flex-1 py-2.5 text-sm font-medium border border-white/10 text-white/60 rounded-xl text-center transition-all duration-300 hover:border-white/20 hover:text-white hover:bg-white/5 hover:scale-[1.02] active:scale-95"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ─── Joined Tab ─── */
function JoinedTab() {
  if (joinedProjects.length === 0) {
    return (
      <EmptyState
        icon={<IconUsers />}
        title="You haven't joined a project yet."
        subtitle="Discover films looking for collaborators like you."
        btnLabel="Explore Projects"
        btnLink="/explore"
      />
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {joinedProjects.map((p) => (
        <div key={p.id} className="group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:border-white/10">
          <div className="relative h-40 overflow-hidden">
            <img src={p.poster} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-transparent" />
            <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${STATUS_STYLES[p.status] || STATUS_STYLES['Open']}`}>
              {p.status}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-[Montserrat] text-lg font-bold mb-1 group-hover:text-purple-light transition-colors">{p.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple/15 border border-purple/30 text-purple-light rounded-full">
                {p.role}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-xs text-white/35">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                Created by <span className="text-white/60 font-medium">{p.creatorName}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {p.location}
              </span>
            </div>
            <Link
              to={`/project/${p.projectId}`}
              className="block w-full mt-4 py-2.5 text-sm font-medium border border-white/10 text-white/60 rounded-xl text-center transition-all duration-300 hover:border-purple/30 hover:text-white hover:bg-purple/5 hover:scale-[1.02] active:scale-95"
            >
              View Project
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Applications Tab ─── */
function ApplicationsTab() {
  if (myApplications.length === 0) {
    return (
      <EmptyState
        icon={<IconSend />}
        title="You haven't applied to any projects yet."
        subtitle="Find a project that matches your skills and apply."
        btnLabel="Find a Project"
        btnLink="/explore"
      />
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {myApplications.map((app) => (
        <div key={app.id} className={`group bg-[#111111] border rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] ${app.status === 'Rejected' ? 'border-white/5 opacity-60 hover:opacity-80' : 'border-white/5 hover:border-white/10'}`}>
          <div className="relative h-36 overflow-hidden">
            <img src={app.poster} alt={app.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-transparent" />
            <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${APP_STATUS[app.status]}`}>
              {app.status}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-[Montserrat] text-base font-bold mb-2 group-hover:text-purple-light transition-colors">{app.title}</h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">
                Applied as <span className="text-purple-light">{app.roleApplied}</span>
              </span>
              <span className="text-xs text-white/25">{app.dateApplied}</span>
            </div>
            <Link
              to={`/project/${app.projectId}`}
              className="block w-full py-2.5 text-sm font-medium border border-white/10 text-white/60 rounded-xl text-center transition-all duration-300 hover:border-purple/30 hover:text-white hover:bg-purple/5 hover:scale-[1.02] active:scale-95"
            >
              View Project
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Empty State ─── */
function EmptyState({ icon, title, subtitle, btnLabel, btnLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 text-white/15">
        {icon}
      </div>
      <h3 className="font-[Montserrat] text-xl font-bold text-white/70 mb-2">{title}</h3>
      <p className="text-white/30 text-sm mb-6 max-w-sm">{subtitle}</p>
      <Link
        to={btnLink}
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.03] active:scale-95"
      >
        {btnLabel}
      </Link>
    </div>
  )
}

/* ─── Icons ─── */
function IconFilm() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" /></svg>
}
function IconUsers() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
}
function IconBolt() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
}
function IconTrophy() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.852m0 0a6.023 6.023 0 01-2.77-.852" /></svg>
}
function IconSend() {
  return <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}

export default MyProjectsPage
