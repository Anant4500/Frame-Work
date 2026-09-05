import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ApplicantCard from './ApplicantCard'
import { getRoleOccupancy, STATUS_COLORS } from './projectRoleUtils'

const VALID_TABS = ['overview', 'roles', 'applications', 'team']

export default function CreatorProjectView({
  project,
  signedScriptUrl,
  onEdit,
  onAccept,
  onReject,
  processingApplicantId,
  initialTab,
}) {
  const [activeTab, setActiveTab] = useState(() =>
    initialTab && VALID_TABS.includes(initialTab.toLowerCase())
      ? initialTab.toLowerCase()
      : 'overview'
  )

  useEffect(() => {
    if (initialTab && VALID_TABS.includes(initialTab.toLowerCase())) {
      setActiveTab(initialTab.toLowerCase())
    }
  }, [initialTab])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showScriptPreview, setShowScriptPreview] = useState(false)

  // Derived application lists & counts
  const applicants = useMemo(() => project?.applicants || [], [project?.applicants])
  const teamMembers = useMemo(
    () => applicants.filter((a) => (a.status || '').toLowerCase() === 'accepted'),
    [applicants]
  )
  const pendingApplicants = useMemo(
    () => applicants.filter((a) => (a.status || '').toLowerCase() === 'pending'),
    [applicants]
  )
  const rejectedApplicants = useMemo(
    () => applicants.filter((a) => (a.status || '').toLowerCase() === 'rejected'),
    [applicants]
  )

  // Role capacity summary across entire project
  const { totalRequired, totalFilled } = useMemo(() => {
    const rawRoles = Array.isArray(project?.rawRoles) ? project.rawRoles : []
    let reqSum = 0
    let fillSum = 0

    rawRoles.forEach((r) => {
      const { requiredCount, acceptedCount } = getRoleOccupancy(r, applicants)
      reqSum += requiredCount
      fillSum += acceptedCount
    })

    return { totalRequired: reqSum, totalFilled: fillSum }
  }, [project?.rawRoles, applicants])

  const remainingPositionsTotal = Math.max(0, totalRequired - totalFilled)

  // Available unique roles for the filter dropdown
  const availableFilterRoles = useMemo(() => {
    const rolesSet = new Set()
    if (Array.isArray(project?.roles)) {
      project.roles.forEach((r) => rolesSet.add(r))
    }
    applicants.forEach((a) => {
      if (a.role) rolesSet.add(a.role)
    })
    return Array.from(rolesSet).sort()
  }, [project?.roles, applicants])

  // Filtered applicants for Applications tab
  const filteredApplicants = useMemo(() => {
    return applicants.filter((app) => {
      const appStatus = (app.status || '').toLowerCase()
      const matchesStatus =
        statusFilter === 'all' ? true : appStatus === statusFilter.toLowerCase()

      const matchesRole =
        roleFilter === 'all' ? true : app.role === roleFilter

      return matchesStatus && matchesRole
    })
  }, [applicants, statusFilter, roleFilter])

  // Contextual empty filter message
  const emptyFilterMessage = useMemo(() => {
    if (applicants.length === 0) {
      return 'No applications received yet.'
    }
    const statusLabel = statusFilter === 'all' ? '' : `${statusFilter} `
    const roleLabel = roleFilter === 'all' ? '' : ` for ${roleFilter}`
    return `No ${statusLabel}applications${roleLabel}.`
  }, [applicants.length, statusFilter, roleFilter])

  // Clean metadata list without orphaned separators
  const metadataItems = useMemo(() => {
    const items = []
    if (project?.location) {
      items.push({
        key: 'location',
        node: (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {project.location}
          </span>
        ),
      })
    }
    const numBudget = Number(project?.budget)
    if (project?.budget != null && project?.budget !== '' && !isNaN(numBudget) && numBudget > 0) {
      items.push({
        key: 'budget',
        node: (
          <span className="flex items-center gap-1">
            <span className="text-emerald-400">₹</span>
            {numBudget.toLocaleString('en-IN')}
          </span>
        ),
      })
    }
    if (project?.timeline) {
      items.push({
        key: 'timeline',
        node: (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {project.timeline}
          </span>
        ),
      })
    }
    return items
  }, [project?.location, project?.budget, project?.timeline])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ─── Top Navigation ─── */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-projects"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40 hover:text-white transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          My Projects
        </Link>
      </div>

      {/* ════════════════════════════════════════════════════
          PROJECT MANAGEMENT HEADER
          ════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-8 bg-[#111116] border border-white/[0.08] rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
          {/* Compact Poster Thumbnail (2:3 aspect ratio, ~180px wide desktop) */}
          <div className="w-36 sm:w-44 lg:w-48 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#1A1A22] relative group">
            <img
              src={project?.thumbnail || '/images/hero-bg.png'}
              alt={project?.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/images/hero-bg.png' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          </div>

          {/* Details & Management Controls */}
          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            <div>
              {/* Eyebrow & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-light flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse" />
                    Project Management
                  </span>
                  <span className="text-white/20">•</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold border rounded-full ${STATUS_COLORS[project?.status] || 'border-white/20 text-white/60'}`}>
                    <span className={`w-1 h-1 rounded-full ${project?.status === 'Open' ? 'bg-purple' : project?.status === 'In Production' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    {project?.status}
                  </span>
                  {project?.genre && (
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 bg-white/[0.04] border border-white/10 rounded-full">
                      {project.genre}
                    </span>
                  )}
                </div>

                {/* Edit Project Button */}
                <button
                  id="edit-project-header-btn"
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple/15 hover:bg-purple text-purple-light hover:text-white border border-purple/30 hover:border-purple text-xs font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-[0_0_20px_rgba(98,57,191,0.3)] shrink-0"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Project
                </button>
              </div>

              {/* Title (Natural wrap, break-words) */}
              <h1 className="font-['Fraunces',_serif] text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em] text-white leading-tight mb-3 break-words">
                {project?.title}
              </h1>

              {/* Logline */}
              {project?.logline && (
                <p className="text-sm text-white/65 leading-relaxed mb-4 max-w-2xl break-words font-normal">
                  {project.logline}
                </p>
              )}

              {/* Metadata Row */}
              {metadataItems.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-xs text-white/50 mb-6">
                  {metadataItems.map((item, idx) => (
                    <span key={item.key} className="flex items-center gap-3.5">
                      {idx > 0 && <span className="text-white/20 select-none">•</span>}
                      {item.node}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.08]">
              <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                  Positions Filled
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-none">
                  {totalFilled} <span className="text-white/30 text-xs font-medium">/ {totalRequired}</span>
                </p>
                <span className="text-[10px] text-white/40 mt-1 block">
                  {totalRequired === 0
                    ? 'No positions defined'
                    : remainingPositionsTotal === 0
                    ? 'Capacity complete'
                    : `${remainingPositionsTotal} position${remainingPositionsTotal === 1 ? '' : 's'} remaining`}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                  Applications
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-none">
                  {applicants.length}
                </p>
                <span className="text-[10px] text-purple-light mt-1 block">
                  {pendingApplicants.length} pending review
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                  Team Members
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-none">
                  {teamMembers.length}
                </p>
                <span className="text-[10px] text-emerald-400/80 mt-1 block">
                  {teamMembers.length} active collaborator{teamMembers.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          WORKSPACE NAVIGATION TABS
          ════════════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.08] overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-8 min-w-max" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-semibold transition-all relative ${
              activeTab === 'overview'
                ? 'text-white'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            Overview
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            className={`pb-3.5 text-sm font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'text-white'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            <span>Roles</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/[0.06] text-white/60">
              {project?.roles ? project.roles.length : 0}
            </span>
            {activeTab === 'roles' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'applications'}
            onClick={() => setActiveTab('applications')}
            className={`pb-3.5 text-sm font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'text-white'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            <span>Applications</span>
            {pendingApplicants.length > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple/25 text-purple-light border border-purple/30">
                {pendingApplicants.length}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/[0.06] text-white/50">
                {applicants.length}
              </span>
            )}
            {activeTab === 'applications' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'team'}
            onClick={() => setActiveTab('team')}
            className={`pb-3.5 text-sm font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === 'team'
                ? 'text-white'
                : 'text-white/45 hover:text-white/80'
            }`}
          >
            <span>Team</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/[0.06] text-white/60">
              {teamMembers.length}
            </span>
            {activeTab === 'team' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* ════════════════════════════════════════════════════
          ACTIVE WORKSPACE TAB CONTENT
          ════════════════════════════════════════════════════ */}
      <div>
        {/* ─── TAB 1: OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* About the Project */}
            <div className="p-6 sm:p-8 bg-[#111116] border border-white/[0.08] rounded-2xl">
              <h2 className="font-['Fraunces',_serif] text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-white mb-4">
                About the Project
              </h2>
              <div className="h-px bg-white/[0.06] mb-6" />
              {project?.description ? (
                <p className="text-white/70 text-sm sm:text-base leading-[1.8] max-w-3xl whitespace-pre-line break-words">
                  {project.description}
                </p>
              ) : (
                <p className="text-white/40 text-sm italic">No project description added yet.</p>
              )}
            </div>

            {/* Production Details & Script Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Production Details */}
              <div className="lg:col-span-2 p-6 sm:p-8 bg-[#111116] border border-white/[0.08] rounded-2xl">
                <h3 className="font-['Fraunces',_serif] text-lg font-semibold text-white mb-4">
                  Production Details
                </h3>
                <div className="h-px bg-white/[0.06] mb-6" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Location
                    </span>
                    <p className="text-sm font-medium text-white">{project?.location || 'Remote / Not specified'}</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Budget
                    </span>
                    <p className="text-sm font-medium text-emerald-400">
                      {project?.budget != null && project?.budget !== '' && !isNaN(Number(project.budget))
                        ? `₹${Number(project.budget).toLocaleString('en-IN')}`
                        : 'Not disclosed'}
                    </p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Timeline
                    </span>
                    <p className="text-sm font-medium text-white">{project?.timeline || 'Not specified'}</p>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
                      Genre
                    </span>
                    <p className="text-sm font-medium text-white">{project?.genre || 'Drama'}</p>
                  </div>
                </div>
              </div>

              {/* Script Card */}
              <div className="p-6 sm:p-8 bg-[#111116] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                    <h3 className="font-['Fraunces',_serif] text-lg font-semibold text-white">
                      Script
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {project.script_url && (
                        <span className="px-2 py-0.5 text-[10px] font-medium text-purple-light bg-purple/15 border border-purple/25 rounded-full">
                          {project.script_visibility === 'PUBLIC'
                            ? 'Anyone Viewing Project'
                            : project.script_visibility === 'APPLICANTS'
                            ? 'Applicants & Team'
                            : 'Accepted Team Only'}
                        </span>
                      )}
                      {signedScriptUrl && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          Attached
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.06] mb-6" />

                  {signedScriptUrl ? (
                    <div>
                      <p className="text-xs text-white/60 leading-relaxed mb-6">
                        Project screenplay attached • Access set to{' '}
                        <span className="text-white/90 font-medium">
                          {project.script_visibility === 'PUBLIC'
                            ? 'Anyone Viewing Project'
                            : project.script_visibility === 'APPLICANTS'
                            ? 'Applicants & Team'
                            : 'Accepted Team Only'}
                        </span>. You can preview or open the file directly.
                      </p>
                      <div className="space-y-2.5">
                        <a
                          href={signedScriptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-4 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(98,57,191,0.3)]"
                        >
                          <span>Open Script</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                        </a>
                        <button
                          type="button"
                          onClick={() => setShowScriptPreview(!showScriptPreview)}
                          className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                          <span>{showScriptPreview ? 'Hide Preview' : 'Preview Script'}</span>
                          <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showScriptPreview ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-white/40 leading-relaxed mb-6">
                        No script has been uploaded for this project yet. Screenplays can be added via project settings.
                      </p>
                      <button
                        type="button"
                        onClick={onEdit}
                        className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all text-center"
                      >
                        Upload in Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collapsible Script Preview Frame */}
            {signedScriptUrl && showScriptPreview && (
              <div className="p-6 bg-[#111116] border border-white/[0.08] rounded-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-white/70">Screenplay Preview</span>
                  <a
                    href={signedScriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-light hover:text-white transition-colors"
                  >
                    Open in separate tab ↗
                  </a>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a]" style={{ height: '540px' }}>
                  <iframe
                    src={signedScriptUrl}
                    title="Script Preview"
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: ROLES & CAPACITY ─── */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            {/* Roles Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111116] border border-white/[0.08] rounded-2xl">
              <div>
                <h2 className="font-['Fraunces',_serif] text-xl font-semibold text-white">
                  Roles & Capacity
                </h2>
                <p className="text-xs text-white/45 mt-0.5">
                  {totalFilled} of {totalRequired} total positions filled across {project?.roles ? project.roles.length : 0} role{project?.roles?.length === 1 ? '' : 's'}.
                </p>
              </div>

              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple/15 hover:bg-purple text-purple-light hover:text-white border border-purple/30 text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Manage Roles
              </button>
            </div>

            {/* Roles List */}
            {Array.isArray(project?.roles) && project.roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.roles.map((role) => {
                  const rawRole = Array.isArray(project.rawRoles)
                    ? project.rawRoles.find((r) => r.role === role)
                    : null
                  const { requiredCount, acceptedCount, isFilled, remainingSlots } = getRoleOccupancy(
                    rawRole,
                    applicants
                  )
                  const percentage = requiredCount > 0
                    ? Math.min(100, Math.max(0, Math.round((acceptedCount / requiredCount) * 100)))
                    : 0
                  const experience = rawRole?.experience_level || rawRole?.experience || null

                  return (
                    <div
                      key={role}
                      className="p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-xl transition-all duration-200 flex flex-col justify-between gap-4"
                    >
                      <div>
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-white leading-snug break-words">
                              {role}
                            </h3>
                            {experience && (
                              <span className="text-[11px] text-white/40 font-medium">
                                {experience} Level
                              </span>
                            )}
                          </div>

                          {isFilled ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-white/70 border border-white/10 rounded-full shrink-0">
                              Role Filled
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple/15 text-purple-light border border-purple/25 rounded-full shrink-0">
                              Open
                            </span>
                          )}
                        </div>

                        {/* Occupancy counts */}
                        <div className="flex items-baseline justify-between text-xs mb-2">
                          <span className="font-semibold text-white/80">
                            {acceptedCount} / {requiredCount} <span className="font-normal text-white/40">positions filled</span>
                          </span>
                          <span className="text-[11px] text-white/40">
                            {isFilled ? 'Capacity complete' : `${remainingSlots} position${remainingSlots === 1 ? '' : 's'} remaining`}
                          </span>
                        </div>

                        {/* Subtle Horizontal Occupancy Bar */}
                        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFilled ? 'bg-purple-light/70' : 'bg-purple'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
                <p className="text-white/40 text-sm mb-4">No roles added yet.</p>
                <button
                  type="button"
                  onClick={onEdit}
                  className="px-4 py-2 bg-purple text-white text-xs font-semibold rounded-xl hover:bg-purple-dark transition-all"
                >
                  Add Roles
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: APPLICATIONS ─── */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Header with quick stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#111116] border border-white/[0.08] rounded-2xl">
              <div>
                <h2 className="font-['Fraunces',_serif] text-xl font-semibold text-white">
                  Applications
                </h2>
                <p className="text-xs text-white/45 mt-0.5">
                  Review and manage candidate applications for your production.
                </p>
              </div>

              {/* Status summary counters */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white/60">
                  <strong className="text-purple-light font-bold mr-1">{pendingApplicants.length}</strong> Pending
                </span>
                <span className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white/60">
                  <strong className="text-emerald-400/90 font-bold mr-1">{teamMembers.length}</strong> Accepted
                </span>
                <span className="px-3 py-1 bg-white/[0.03] border border-white/[0.06] rounded-lg text-white/60">
                  <strong className="text-red-400 font-bold mr-1">{rejectedApplicants.length}</strong> Rejected
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#111116] border border-white/[0.08] rounded-xl">
              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'pending', label: 'Pending', count: pendingApplicants.length },
                  { id: 'accepted', label: 'Accepted', count: teamMembers.length },
                  { id: 'rejected', label: 'Rejected', count: rejectedApplicants.length },
                  { id: 'all', label: 'All', count: applicants.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? 'bg-purple text-white shadow-sm'
                        : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Role dropdown filter */}
              <div className="shrink-0">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full sm:w-auto appearance-none px-3.5 py-1.5 bg-black/40 border border-white/[0.1] rounded-lg text-xs text-white outline-none focus:border-purple cursor-pointer pr-8"
                >
                  <option value="all" className="bg-[#111116]">All Roles</option>
                  {availableFilterRoles.map((r) => (
                    <option key={r} value={r} className="bg-[#111116]">{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applications Grid */}
            {filteredApplicants.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredApplicants.map((applicant) => {
                  const matchingRole = (project?.rawRoles || []).find((r) =>
                    applicant.project_role_id && r.id
                      ? String(r.id) === String(applicant.project_role_id)
                      : r.role === applicant.role
                  )
                  const { isFilled } = getRoleOccupancy(matchingRole, applicants)

                  return (
                    <ApplicantCard
                      key={applicant.id}
                      applicant={applicant}
                      isRoleFull={isFilled}
                      isProcessing={processingApplicantId === applicant.id}
                      onAccept={() => onAccept(applicant.id)}
                      onReject={() => onReject(applicant.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
                <p className="text-white/40 text-sm mb-2">
                  {emptyFilterMessage}
                </p>
                {(statusFilter !== 'all' || roleFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all')
                      setRoleFilter('all')
                    }}
                    className="text-xs text-purple-light hover:text-white font-medium transition-colors underline"
                  >
                    Clear filter settings
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 4: TEAM ─── */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Header */}
            <div className="flex items-center justify-between p-5 bg-[#111116] border border-white/[0.08] rounded-2xl">
              <div>
                <h2 className="font-['Fraunces',_serif] text-xl font-semibold text-white">
                  Team
                </h2>
                <p className="text-xs text-white/45 mt-0.5">
                  Collaborators currently accepted into this production.
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                {teamMembers.length} {teamMembers.length === 1 ? 'Collaborator' : 'Collaborators'}
              </span>
            </div>

            {/* Team Members Grid */}
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {teamMembers.map((member) => {
                  const profileId = member.applicant_id || member.applicant?.id || null
                  const profileUrl = profileId ? `/profile/${profileId}` : null

                  return (
                    <div
                      key={member.id}
                      className="p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-xl transition-all duration-200 flex flex-col justify-between text-center gap-3 group"
                    >
                      <div className="flex flex-col items-center">
                        {profileUrl ? (
                          <Link to={profileUrl} className="block group/avatar">
                            <div className="w-16 h-16 rounded-full bg-purple/15 border border-purple/30 group-hover/avatar:border-purple flex items-center justify-center overflow-hidden mb-3 transition-colors">
                              {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xl font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden mb-3">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                            )}
                          </div>
                        )}

                        {profileUrl ? (
                          <Link to={profileUrl} className="text-sm font-semibold text-white hover:text-purple-light transition-colors truncate max-w-full">
                            {member.name}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-white truncate max-w-full">{member.name}</p>
                        )}

                        <p className="text-xs text-purple-light font-medium mt-0.5">{member.role}</p>

                        {member.location && (
                          <p className="text-[11px] text-white/40 mt-1">{member.location}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/[0.05]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Team Member
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#111116] border border-white/[0.08] rounded-2xl">
                <p className="text-white/40 text-sm font-medium mb-1">No team members yet.</p>
                <p className="text-white/25 text-xs mb-4">Accepted collaborators will appear here.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('applications')}
                  className="px-4 py-2 bg-purple/15 hover:bg-purple text-purple-light hover:text-white border border-purple/30 text-xs font-semibold rounded-xl transition-all"
                >
                  View Applications
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
