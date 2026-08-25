import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'

const generateApplicantId = () => `a${Date.now()}`

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [signedScriptUrl, setSignedScriptUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [applyRole, setApplyRole] = useState('')
  const [applyMessage, setApplyMessage] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const fetchProject = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      setSignedScriptUrl(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*, creator:profiles(*), roles:project_roles(*)')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        // Fetch applications for this project
        let projectApplicants = []
        try {
          const { data: appData } = await supabase
            .from('applications')
            .select('*, applicant:profiles(id, name, profile_photo_url, location, resume_url), role:project_roles(role)')
            .eq('project_id', id)

          if (appData) {
            projectApplicants = appData.map((a) => ({
              id: a.id,
              applicant_id: a.applicant_id,
              project_role_id: a.project_role_id,
              name: a.applicant?.name || 'Applicant',
              role: a.role?.role || 'Collaborator',
              message: a.message || '',
              status: (a.status || 'pending').toLowerCase(),
              avatar: a.applicant?.profile_photo_url || null,
              resumeUrl: a.applicant?.resume_url || null,
            }))
          }
        } catch (appErr) {
          console.error('Error fetching applications for project:', appErr)
        }

        const mapped = {
          id: data.id,
          title: data.title || 'Untitled Project',
          logline: data.description || '',
          description: data.description || '',
          genre: data.genre || 'Drama',
          location: data.location || 'Remote',
          budget: data.budget,
          timeline: data.timeline,
          status: data.status === 'OPEN' ? 'Open' : data.status === 'IN_PRODUCTION' ? 'In Production' : data.status === 'COMPLETED' ? 'Completed' : data.status,
          thumbnail: data.poster_url || '/images/hero-bg.png',
          poster_url: data.poster_url,
          script_url: data.script_url || null,
          created_at: data.created_at,
          creator_id: data.creator_id,
          creator: data.creator ? {
            id: data.creator.id,
            name: data.creator.name || 'Creator',
            role: data.creator.role === 'CREATOR' ? 'Director' : (data.creator.role || 'Creator'),
            avatar: data.creator.profile_photo_url || null,
            bio: data.creator.bio || '',
            location: data.creator.location || data.location,
          } : null,
          roles: Array.isArray(data.roles) ? data.roles.map((r) => r.role) : [],
          rawRoles: data.roles || [],
          applicants: projectApplicants
        }
        setProject(mapped)

        // Generate signed URL for private script if uploaded
        if (data.script_url) {
          const { data: signedData, error: signedError } = await supabase
            .storage
            .from('scripts')
            .createSignedUrl(data.script_url, 60 * 60)

          if (!signedError && signedData?.signedUrl) {
            setSignedScriptUrl(signedData.signedUrl)
          } else if (signedError) {
            console.error('Error generating signed URL for script:', signedError)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching project detail:', err)
      setError(err.message)
      setProject(null)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchProject(true)
    }
  }, [id])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
          </svg>
          <p className="text-white/40 text-sm font-medium">Loading project details...</p>
        </div>
      </section>
    )
  }

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
          <p className="text-white/40 mb-6">This project may have been removed or is not available yet.</p>
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

  const isCreatorRole = user?.role?.toLowerCase() === 'creator'
  const isCreatorOwner = Boolean(
    user &&
    isCreatorRole &&
    (
      (user.id && (user.id === project.creator?.id || user.id === project.creator_id)) ||
      (user.name && (user.name === project.creator?.name))
    )
  )
  const hasApplied = Boolean(
    user &&
    project.applicants &&
    project.applicants.some((a) => (user.id && (a.applicant_id === user.id || a.id === user.id)) || (user.name && a.name === user.name))
  )

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

  const handleApplySubmit = async () => {
    if (!applyMessage.trim()) {
      setToast({ type: 'error', text: 'Please write a short message' })
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    const activeUserId = session?.user?.id || user?.id

    if (!activeUserId) {
      navigate('/login')
      return
    }

    const roleObj = Array.isArray(project.rawRoles)
      ? project.rawRoles.find((r) => r.role === applyRole)
      : null
    const projectRoleId = roleObj?.id || null

    try {
      const { data: newApp, error: insertError } = await supabase
        .from('applications')
        .insert({
          project_id: project.id,
          project_role_id: projectRoleId,
          applicant_id: activeUserId,
          message: applyMessage.trim(),
          status: 'PENDING',
        })
        .select('*, applicant:profiles(id, name, profile_photo_url), role:project_roles(role)')
        .single()

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
          setToast({ type: 'info', text: 'You have already applied for this role.' })
          setApplyModalOpen(false)
          return
        }
        throw insertError
      }

      const mappedApp = {
        id: newApp.id,
        applicant_id: activeUserId,
        project_role_id: projectRoleId,
        name: user?.name || 'Applicant',
        role: applyRole,
        message: applyMessage.trim(),
        status: 'pending',
        avatar: user?.avatar || null,
      }

      setProject((prev) => prev ? {
        ...prev,
        applicants: [...(prev.applicants || []), mappedApp]
      } : prev)

      // Fire notification to the project creator
      if (project.creator_id && project.creator_id !== activeUserId) {
        supabase.from('notifications').insert({
          user_id: project.creator_id,
          project_id: project.id,
          message: `${user?.name || 'Someone'} applied for "${applyRole}" on "${project.title}".`,
        }).then(() => {}).catch(() => {})
      }

      setApplyModalOpen(false)
      setApplyMessage('')
      setApplyRole('')
      setToast({ type: 'success', text: `Applied for ${applyRole} successfully!` })
    } catch (err) {
      console.error('Error submitting application:', err)
      setToast({ type: 'error', text: err.message || 'Failed to submit application. Please try again.' })
    }
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
    setApplyRole((Array.isArray(project.roles) && project.roles[0]) || 'General')
    setApplyModalOpen(true)
  }

  const handleAccept = async (applicantId) => {
    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'ACCEPTED' })
        .eq('id', applicantId)

      if (updateError) throw updateError

      setProject((prev) => prev ? {
        ...prev,
        applicants: (prev.applicants || []).map((a) => a.id === applicantId ? { ...a, status: 'accepted' } : a)
      } : prev)
      setToast({ type: 'success', text: 'Applicant accepted!' })
    } catch (err) {
      console.error('Error accepting applicant:', err)
      setToast({ type: 'error', text: err.message || 'Failed to accept applicant' })
    }
  }

  const handleReject = async (applicantId) => {
    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'REJECTED' })
        .eq('id', applicantId)

      if (updateError) throw updateError

      setProject((prev) => prev ? {
        ...prev,
        applicants: (prev.applicants || []).map((a) => a.id === applicantId ? { ...a, status: 'rejected' } : a)
      } : prev)
      setToast({ type: 'error', text: 'Applicant rejected' })
    } catch (err) {
      console.error('Error rejecting applicant:', err)
      setToast({ type: 'error', text: err.message || 'Failed to reject applicant' })
    }
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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <h1 className="font-[Montserrat] text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">
              {project.title}
            </h1>
            {user?.id && project?.creator_id && user.id === project.creator_id && (
              <button
                id="edit-project-btn"
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple/20 text-purple-light border border-purple/40 text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple hover:text-white hover:shadow-[0_0_25px_rgba(139,92,246,0.35)] shrink-0 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Edit Project
              </button>
            )}
          </div>
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
            {/* Budget */}
            {project.budget != null && project.budget !== '' && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white/[0.04] border border-white/10 rounded-full text-white/70">
                <span className="text-emerald-400">₹</span>
                {Number(project.budget).toLocaleString('en-IN')} Budget
              </span>
            )}
            {/* Timeline */}
            {project.timeline && (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white/[0.04] border border-white/10 rounded-full text-white/70">
                🗓️ {project.timeline}
              </span>
            )}
          </div>
        </div>

        {/* ─── Two Column Layout ─── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ═══ Left Column ═══ */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Script Preview — conditional on signedScriptUrl */}
            {signedScriptUrl ? (
              <div className="reveal glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h2 className="font-[Montserrat] text-lg font-bold">Script Preview</h2>
                  <a
                    href={signedScriptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs text-purple/70 hover:text-purple transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Open full screen
                  </a>
                </div>
                <div className="relative bg-[#0a0a0a]" style={{ height: '600px' }}>
                  <iframe
                    src={signedScriptUrl}
                    title="Script Preview"
                    className="w-full h-full border-0"
                    style={{ filter: 'invert(0.85) hue-rotate(180deg)', background: '#1a1a1a' }}
                  />
                  {/* Overlay gradient at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="reveal glass-card rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h2 className="font-[Montserrat] text-lg font-bold text-white/50">Script Preview</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-sm font-medium mb-1">No script uploaded for this project yet.</p>
                  <p className="text-white/20 text-xs">The creator may share the script after reviewing your application.</p>
                </div>
              </div>
            )}

            {/* Required Roles */}
            <div className="reveal glass-card rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple/15 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h2 className="font-[Montserrat] text-lg font-bold">Required Roles</h2>
                <span className="ml-auto text-xs text-white/30">{(Array.isArray(project.roles) ? project.roles : []).length} roles open</span>
              </div>

              {Array.isArray(project.roles) && project.roles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.roles.map((role) => {
                    const roleIcons = {
                      'Actor': '🎭', 'Editor': '✂️', 'Sound Designer': '🎧', 'Cinematographer': '📷',
                      'VFX Artist': '✨', 'Director': '🎬', 'Writer': '✍️', 'DOP': '📹',
                      'Composer': '🎵', 'Stunt Coordinator': '🤸', 'Producer': '🎞️',
                    }
                    const alreadyAppliedForRole = Boolean(
                      user &&
                      project.applicants &&
                      project.applicants.some((a) => ((user.id && a.id === user.id) || (user.name && a.name === user.name)) && a.role === role)
                    )
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
              ) : (
                <p className="text-white/30 text-sm py-4 text-center">No roles specified for this project.</p>
              )}
            </div>

            {/* Team / Credits */}
            {(() => {
              const teamMembers = (project.applicants || []).filter((a) => a.status === 'accepted')
              if (teamMembers.length === 0) return null
              return (
                <div className="reveal glass-card rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <h2 className="font-[Montserrat] text-lg font-bold">Team & Credits</h2>
                    <span className="ml-auto text-xs text-white/30">{teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3.5 p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple/10 border border-purple/20 flex items-center justify-center shrink-0 overflow-hidden">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-purple">{(member.name || 'U').charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                          <p className="text-xs text-emerald-400/80">{member.role}</p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          Hired
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* ═══ Right Column (Sidebar) ═══ */}
          <div className="w-full lg:w-80 lg:min-w-[320px] shrink-0 space-y-6">

            {/* About the Creator */}
            <div className="reveal glass-card rounded-2xl p-6 sticky top-28">
              <h3 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-5">About the Creator</h3>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-purple/15 border-2 border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
                  {project.creator?.avatar ? (
                    <img src={project.creator.avatar} alt={project.creator?.name || 'Unknown Creator'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-purple">
                      {(project.creator?.name || 'Unknown Creator').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-[Montserrat] font-bold text-white">{project.creator?.name || 'Unknown Creator'}</p>
                  <p className="text-sm text-white/40">{project.creator?.role || 'Creator'}</p>
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

      {/* ─── Edit Project Modal ─── */}
      <EditProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        project={project}
        onSaveSuccess={() => {
          setEditModalOpen(false)
          setToast({ type: 'success', text: 'Project & roles updated successfully!' })
          fetchProject(false)
        }}
      />

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

/* ─── Edit Project Modal Component ─── */
function EditProjectModal({ isOpen, onClose, project, onSaveSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('Drama')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [rolesList, setRolesList] = useState([])
  const [rolesToDelete, setRolesToDelete] = useState([])
  const [newRoleInput, setNewRoleInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (project && isOpen) {
      setTitle(project.title || '')
      setDescription(project.description || project.logline || '')
      setGenre(project.genre || 'Drama')
      setLocation(project.location || '')
      setBudget(project.budget || '')
      setTimeline(project.timeline || '')

      const raw = Array.isArray(project.rawRoles) ? project.rawRoles : []
      setRolesList(raw.map((r) => ({
        id: r.id,
        role: r.role,
        positions_needed: r.positions_needed || 1,
        positions_filled: r.positions_filled || 0,
        isNew: false
      })))
      setRolesToDelete([])
      setNewRoleInput('')
      setErrorMsg('')
    }
  }, [project, isOpen])

  if (!isOpen || !project) return null

  const handleAddRole = (e) => {
    e.preventDefault()
    const trimmed = newRoleInput.trim()
    if (!trimmed) return
    if (rolesList.some((r) => r.role.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg('Role already exists in list')
      return
    }
    setErrorMsg('')
    setRolesList((prev) => [
      ...prev,
      { role: trimmed, positions_needed: 1, positions_filled: 0, isNew: true }
    ])
    setNewRoleInput('')
  }

  const handleRemoveRole = (index, roleObj) => {
    if ((roleObj.positions_filled || 0) > 0) {
      setErrorMsg(`Cannot remove "${roleObj.role}" because positions have already been filled.`)
      return
    }
    setErrorMsg('')
    if (roleObj.id && !roleObj.isNew) {
      setRolesToDelete((prev) => [...prev, roleObj.id])
    }
    setRolesList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Title and Description are required.')
      return
    }

    try {
      setIsSaving(true)
      setErrorMsg('')

      // 1. UPDATE projects text fields
      const { error: updateErr } = await supabase
        .from('projects')
        .update({
          title: title.trim(),
          description: description.trim(),
          genre,
          location: location.trim(),
          budget: budget === '' || budget == null ? null : (isNaN(Number(budget)) ? budget.trim() : Number(budget)),
          timeline: timeline.trim() || null,
        })
        .eq('id', project.id)
        .eq('creator_id', project.creator_id)

      if (updateErr) throw updateErr

      // 2. DELETE removed existing roles
      if (rolesToDelete.length > 0) {
        const { error: delErr } = await supabase
          .from('project_roles')
          .delete()
          .in('id', rolesToDelete)

        if (delErr) throw delErr
      }

      // 3. INSERT new roles
      const rolesToAdd = rolesList.filter((r) => r.isNew || !r.id)
      if (rolesToAdd.length > 0) {
        const payload = rolesToAdd.map((r) => ({
          project_id: project.id,
          role: r.role.trim(),
          positions_needed: Number(r.positions_needed) || 1,
          positions_filled: 0
        }))

        const { error: insErr } = await supabase
          .from('project_roles')
          .insert(payload)

        if (insErr) throw insErr
      }

      onSaveSuccess()
    } catch (err) {
      console.error('Error updating project:', err)
      setErrorMsg(err.message || 'Failed to update project.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <h2 className="font-[Montserrat] text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit Project & Roles
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="e.g. Echoes of Silence"
              required
            />
          </div>

          {/* Logline / Description */}
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Description / Logline</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
              placeholder="Brief summary of your film project..."
              required
            />
          </div>

          {/* Grid 2-col for Genre, Location, Budget, Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple transition-all"
              >
                {['Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Documentary', 'Comedy', 'Action', 'Romance', 'Animation', 'Experimental'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
                placeholder="e.g. Mumbai / Remote"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Budget</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
                placeholder="e.g. ₹5,00,000 / Indie"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Timeline</label>
              <input
                type="text"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple transition-all"
                placeholder="e.g. Shooting Nov 2026"
              />
            </div>
          </div>

          {/* Manage Roles Section */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Project Roles Management</label>

            {/* Existing and Added Roles List */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
              {rolesList.length > 0 ? (
                rolesList.map((r, idx) => (
                  <div key={r.id || `new-${idx}`} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{r.role}</span>
                      {r.isNew && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-purple-light bg-purple/10 border border-purple/20 rounded-full">New</span>
                      )}
                      {(r.positions_filled || 0) > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          {r.positions_filled} Filled
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRole(idx, r)}
                      disabled={(r.positions_filled || 0) > 0}
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                        (r.positions_filled || 0) > 0
                          ? 'text-white/20 cursor-not-allowed'
                          : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                      }`}
                      title={(r.positions_filled || 0) > 0 ? 'Cannot remove filled role' : 'Remove role'}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-white/30 text-xs py-2">No roles currently listed.</p>
              )}
            </div>

            {/* Add Role Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                placeholder="e.g. Sound Designer"
                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-4 py-2.5 bg-white/[0.08] hover:bg-purple text-white text-xs font-semibold rounded-xl border border-white/10 transition-all"
              >
                Add Role
              </button>
            </div>
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] disabled:opacity-50"
            >
              {isSaving && (
                <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectDetailPage
