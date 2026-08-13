import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProjects } from '../context/ProjectsContext'

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { projects, updateApplicantStatus, applyToProject } = useProjects()
  const [toast, setToast] = useState(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [applyRole, setApplyRole] = useState('')
  const [applyMessage, setApplyMessage] = useState('')

  const project = projects.find((p) => p.id === Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  if (!project) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
            </svg>
          </div>
          <h2 className="font-[Montserrat] text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-white/40 mb-6">This project doesn't exist or has been removed.</p>
          <Link
            to="/explore"
            className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    )
  }

  const isCreatorOwner = user && user.role === 'creator' && user.name === project.creator.name
  const hasApplied = user && project.applicants.some((a) => a.name === user.name)

  const statusColors = {
    'Open': 'border-purple text-purple-light bg-purple/10',
    'In Production': 'border-amber-500/60 text-amber-400 bg-amber-500/10',
    'Completed': 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10',
  }

  const handleApplyRole = (role) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role === 'creator' && isCreatorOwner) return
    setApplyRole(role)
    setApplyModalOpen(true)
  }

  const handleApplySubmit = () => {
    if (!applyMessage.trim()) {
      setToast({ type: 'error', text: 'Please write a short message' })
      return
    }
    const newApplicant = {
      id: `a${Date.now()}`,
      name: user.name,
      role: applyRole,
      message: applyMessage,
      status: 'pending',
      avatar: user.avatar || null,
    }
    applyToProject(project.id, newApplicant)
    setApplyModalOpen(false)
    setApplyMessage('')
    setApplyRole('')
    setToast({ type: 'success', text: `Applied for ${applyRole} successfully!` })
  }

  const handleApplyGeneral = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (hasApplied) {
      setToast({ type: 'info', text: 'You have already applied to this project' })
      return
    }
    setApplyRole(project.roles[0] || 'General')
    setApplyModalOpen(true)
  }

  const handleAccept = (applicantId) => {
    updateApplicantStatus(project.id, applicantId, 'accepted')
    setToast({ type: 'success', text: 'Applicant accepted!' })
  }

  const handleReject = (applicantId) => {
    updateApplicantStatus(project.id, applicantId, 'rejected')
    setToast({ type: 'error', text: 'Applicant rejected' })
  }

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* ─── Back Nav ─── */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors duration-300 mb-8 group"
        >
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* ─── Top Section ─── */}
        <div className="mb-10 reveal">
          <h1 className="font-[Montserrat] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            {project.title}
          </h1>
          <p className="text-white/50 text-lg sm:text-xl max-w-3xl leading-relaxed mb-6">
            {project.logline}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Genre */}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white/[0.04] border border-white/10 rounded-full text-white/70">
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
              </svg>
              {project.genre}
            </span>
            {/* Location */}
            <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white/[0.04] border border-white/10 rounded-full text-white/70">
              <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {project.location}
            </span>
            {/* Status */}
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border rounded-full ${statusColors[project.status] || 'border-white/20 text-white/60'}`}>
              <span className={`w-2 h-2 rounded-full ${project.status === 'Open' ? 'bg-purple animate-pulse' : project.status === 'In Production' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              {project.status}
            </span>
          </div>
        </div>

        {/* ─── Two Column Layout ─── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ═══ Left Column ═══ */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Script Preview */}
            <div className="reveal glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h2 className="font-[Montserrat] text-lg font-bold">Script Preview</h2>
              </div>
              <div className="relative bg-[#0a0a0a]" style={{ height: '600px' }}>
                <iframe
                  src={project.scriptUrl}
                  title="Script Preview"
                  className="w-full h-full border-0"
                  style={{ filter: 'invert(0.85) hue-rotate(180deg)', background: '#1a1a1a' }}
                />
                {/* Overlay gradient at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Required Roles */}
            <div className="reveal glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h2 className="font-[Montserrat] text-lg font-bold">Required Roles</h2>
                <span className="ml-auto text-xs text-white/30">{project.roles.length} roles open</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.roles.map((role) => {
                  const roleIcons = {
                    'Actor': '🎭', 'Editor': '✂️', 'Sound Designer': '🎧', 'Cinematographer': '📷',
                    'VFX Artist': '✨', 'Director': '🎬', 'Writer': '✍️', 'DOP': '📹',
                    'Composer': '🎵', 'Stunt Coordinator': '🤸', 'Producer': '🎞️',
                  }
                  const alreadyAppliedForRole = user && project.applicants.some((a) => a.name === user.name && a.role === role)

                  return (
                    <div
                      key={role}
                      className="group flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300 hover:border-purple/20 hover:bg-purple/[0.03]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{roleIcons[role] || '🎬'}</span>
                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{role}</span>
                      </div>
                      {isCreatorOwner ? (
                        <span className="text-xs text-white/30">Your project</span>
                      ) : alreadyAppliedForRole ? (
                        <span className="px-3 py-1.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 rounded-lg bg-emerald-500/10">
                          Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyRole(role)}
                          className="px-4 py-1.5 text-xs font-semibold bg-purple text-white rounded-lg transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ═══ Right Column (Sidebar) ═══ */}
          <div className="w-full lg:w-80 lg:min-w-[320px] shrink-0 space-y-6">

            {/* About the Creator */}
            <div className="reveal glass-card rounded-2xl p-6 sticky top-28">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-5">About the Creator</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-purple/15 border-2 border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
                  {project.creator.avatar ? (
                    <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-purple">{project.creator.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-[Montserrat] font-bold text-white">{project.creator.name}</p>
                  <p className="text-sm text-white/40">{project.creator.role}</p>
                </div>
              </div>
              <button className="w-full py-3 text-sm font-medium border border-white/10 rounded-xl text-white/60 transition-all duration-300 hover:border-purple/30 hover:text-white hover:bg-white/[0.03]">
                View Profile
              </button>

              {/* Divider */}
              <div className="h-px bg-white/5 my-6" />

              {/* Apply Section */}
              {!isCreatorOwner && (
                <div>
                  <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Join This Project</h3>
                  <button
                    id="apply-to-project-btn"
                    onClick={handleApplyGeneral}
                    disabled={hasApplied}
                    className={`w-full py-4 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                      hasApplied
                        ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5'
                        : 'bg-purple text-white hover:bg-purple-dark hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] active:scale-[0.98] animate-pulse-glow'
                    }`}
                  >
                    {hasApplied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Already Applied
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Apply to Project
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Creator-Only: Application List */}
              {isCreatorOwner && (
                <div>
                  <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">
                    Applications
                    <span className="ml-2 px-2 py-0.5 bg-purple/15 text-purple-light text-[10px] font-bold rounded-full">
                      {project.applicants.length}
                    </span>
                  </h3>

                  {project.applicants.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/20 text-sm">No applications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
                      {project.applicants.map((applicant) => (
                        <ApplicantCard
                          key={applicant.id}
                          applicant={applicant}
                          onAccept={() => handleAccept(applicant.id)}
                          onReject={() => handleReject(applicant.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Apply Modal ─── */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setApplyModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_16px_64px_rgba(0,0,0,0.6)] animate-fade-in-up">
            <button
              onClick={() => setApplyModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-[Montserrat] text-xl font-bold mb-1">Apply as {applyRole}</h3>
            <p className="text-white/40 text-sm mb-6">for {project.title}</p>

            <label className="block text-sm font-medium text-white/60 mb-2">Your Message *</label>
            <textarea
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="Tell the creator why you're a great fit for this role..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] resize-none mb-1"
            />
            <p className="text-white/20 text-xs text-right mb-6">{applyMessage.length}/500</p>

            <button
              onClick={handleApplySubmit}
              className="w-full py-3.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* ─── Toast ─── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl toast-enter flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
          'bg-purple/10 border-purple/20 text-purple-light'
        }`}>
          {toast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}
    </section>
  )
}

/* ─── Applicant Card (Creator View) ─── */
function ApplicantCard({ applicant, onAccept, onReject }) {
  const statusBadge = {
    pending: null,
    accepted: <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full">Accepted</span>,
    rejected: <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20 rounded-full">Rejected</span>,
  }

  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300 hover:border-white/10">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center shrink-0 overflow-hidden">
          {applicant.avatar ? (
            <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-purple">{applicant.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">{applicant.name}</p>
            {statusBadge[applicant.status]}
          </div>
          <p className="text-xs text-purple-light">{applicant.role}</p>
        </div>
      </div>
      <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">{applicant.message}</p>

      {applicant.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 py-2 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectDetailPage
