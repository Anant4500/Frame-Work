import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'
import CreatorProjectView from '../components/project/CreatorProjectView'
import CollaboratorProjectView from '../components/project/CollaboratorProjectView'
import EditProjectModal from '../components/project/EditProjectModal'
import ApplyModal from '../components/project/ApplyModal'
import { getRoleOccupancy } from '../components/project/projectRoleUtils'

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [signedScriptUrl, setSignedScriptUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [applyRole, setApplyRole] = useState('')
  const [applyMessage, setApplyMessage] = useState('')
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [processingApplicantId, setProcessingApplicantId] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const fetchProject = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
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
              location: a.applicant?.location || null,
            }))
          }
        } catch (appErr) {
          console.error('Error fetching applications for project:', appErr)
        }

        const mapped = {
          id: data.id,
          title: data.title || 'Untitled Project',
          logline: data.logline || '',
          description: data.description || '',
          genre: data.genre || 'Drama',
          location: data.location || 'Remote',
          budget: data.budget,
          timeline: data.timeline,
          status: data.status === 'OPEN' ? 'Open' : data.status === 'IN_PRODUCTION' ? 'In Production' : data.status === 'COMPLETED' ? 'Completed' : data.status,
          thumbnail: data.poster_url || '/images/hero-bg.png',
          poster_url: data.poster_url,
          script_url: data.script_url || null,
          script_visibility: data.script_visibility || 'ACCEPTED_TEAM',
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

        // Generate signed URL for private script if uploaded and authorized
        if (data.script_url) {
          const { data: signedData, error: signedError } = await supabase
            .storage
            .from('scripts')
            .createSignedUrl(data.script_url, 15 * 60) // 15-minute lifetime (900s)

          if (!signedError && signedData?.signedUrl) {
            setSignedScriptUrl(signedData.signedUrl)
          } else {
            // Unauthorized or unavailable
            setSignedScriptUrl(null)
            if (signedError) {
              console.warn('[Storage] Script access denied or unavailable:', signedError.message)
            }
          }
        } else {
          setSignedScriptUrl(null)
        }
      }
    } catch (err) {
      console.error('Error fetching project detail:', err)
      setProject(null)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchProject(true)
    }
  }, [id, fetchProject])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Ownership determined strictly by authenticated UUID matching project creator UUID
  const isCreatorOwner = Boolean(
    user?.id &&
    (
      (project?.creator_id && user.id === project.creator_id) ||
      (project?.creator?.id && user.id === project.creator.id)
    )
  )

  const handleApplyRole = (role) => {
    if (!user) {
      navigate('/login')
      return
    }
    if (isCreatorOwner) return

    const roleObj = Array.isArray(project?.rawRoles)
      ? project.rawRoles.find((r) => r.role === role)
      : null
    const { isFilled } = getRoleOccupancy(roleObj, project?.applicants)
    if (isFilled) {
      setToast({ type: 'error', text: 'This role has already been filled.' })
      return
    }

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

    const roleObj = Array.isArray(project?.rawRoles)
      ? project.rawRoles.find((r) => r.role === applyRole)
      : null
    const projectRoleId = roleObj?.id || null

    const { isFilled } = getRoleOccupancy(roleObj, project?.applicants)
    if (isFilled) {
      setToast({ type: 'error', text: 'This role has already been filled.' })
      setApplyModalOpen(false)
      return
    }

    // Double check with Supabase live count
    if (projectRoleId) {
      const { count: liveAccepted } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('project_role_id', projectRoleId)
        .eq('status', 'ACCEPTED')

      const reqCount = Math.max(1, Number(roleObj?.positions_needed) || 1)
      if (liveAccepted != null && liveAccepted >= reqCount) {
        setToast({ type: 'error', text: 'This role has already been filled.' })
        setApplyModalOpen(false)
        await fetchProject(false)
        return
      }
    }

    try {
      setIsSubmittingApplication(true)
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
        location: user?.location || null,
      }

      setProject((prev) => prev ? {
        ...prev,
        applicants: [...(prev.applicants || []), mappedApp]
      } : prev)

      setApplyModalOpen(false)
      setApplyMessage('')
      setApplyRole('')
      setToast({ type: 'success', text: `Applied for ${applyRole} successfully!` })

      // Refetch project to re-evaluate script access if visibility was APPLICANTS
      await fetchProject(false)
    } catch (err) {
      console.error('Error submitting application:', err)
      setToast({ type: 'error', text: err.message || 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmittingApplication(false)
    }
  }

  const handleAccept = async (applicantId) => {
    const appObj = (project?.applicants || []).find((a) => a.id === applicantId)
    if (!appObj) return

    const roleObj = Array.isArray(project?.rawRoles)
      ? project.rawRoles.find((r) =>
          appObj.project_role_id && r.id
            ? String(r.id) === String(appObj.project_role_id)
            : r.role === appObj.role
        )
      : null

    const { requiredCount, acceptedCount } = getRoleOccupancy(roleObj, project?.applicants)
    if (acceptedCount >= requiredCount) {
      setToast({ type: 'error', text: 'This role is already filled.' })
      return
    }

    try {
      setProcessingApplicantId(applicantId)

      // Atomic Postgres RPC enforces role capacity and updates
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('accept_project_application', {
        p_application_id: applicantId,
      })

      if (rpcErr) {
        throw rpcErr
      }

      if (rpcRes && !rpcRes.success) {
        setToast({ type: 'error', text: rpcRes.error || 'This role is already filled.' })
        setProcessingApplicantId(null)
        await fetchProject(false)
        return
      }

      // Optimistic update of local state
      const isNowFilled = acceptedCount + 1 >= requiredCount
      setProject((prev) => {
        if (!prev) return prev
        const updatedApplicants = (prev.applicants || []).map((a) => {
          if (a.id === applicantId) {
            return { ...a, status: 'accepted' }
          }
          if (
            isNowFilled &&
            a.status === 'pending' &&
            (roleObj?.id && a.project_role_id
              ? String(a.project_role_id) === String(roleObj.id)
              : a.role === appObj.role)
          ) {
            return { ...a, status: 'rejected' }
          }
          return a
        })

        const updatedRawRoles = (prev.rawRoles || []).map((r) => {
          if (roleObj?.id && String(r.id) === String(roleObj.id)) {
            return { ...r, positions_filled: acceptedCount + 1 }
          }
          return r
        })

        return {
          ...prev,
          applicants: updatedApplicants,
          rawRoles: updatedRawRoles,
        }
      })

      setToast({ type: 'success', text: 'Applicant accepted!' })
      await fetchProject(false)
    } catch (err) {
      console.error('Error accepting applicant:', err)
      setToast({ type: 'error', text: err.message || 'Failed to accept applicant' })
    } finally {
      setProcessingApplicantId(null)
    }
  }

  const handleReject = async (applicantId) => {
    try {
      setProcessingApplicantId(applicantId)
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_project_application', {
        p_application_id: applicantId,
      })

      if (rpcErr) throw rpcErr

      if (rpcRes && !rpcRes.success) {
        setToast({ type: 'error', text: rpcRes.error || 'Failed to reject application' })
        return
      }

      setProject((prev) => prev ? {
        ...prev,
        applicants: (prev.applicants || []).map((a) => a.id === applicantId ? { ...a, status: 'rejected' } : a)
      } : prev)
      setToast({ type: 'info', text: 'Application rejected.' })
      await fetchProject(false)
    } catch (err) {
      console.error('Error rejecting applicant:', err)
      setToast({ type: 'error', text: err.message || 'Failed to reject applicant' })
    } finally {
      setProcessingApplicantId(null)
    }
  }

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
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-white/40 mb-6">This project may have been removed or is not available yet.</p>
          <Link
            to="/explore"
            className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)]"
          >
            Explore Projects
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {isCreatorOwner ? (
          <CreatorProjectView
            project={project}
            signedScriptUrl={signedScriptUrl}
            onEdit={() => setEditModalOpen(true)}
            onAccept={handleAccept}
            onReject={handleReject}
            processingApplicantId={processingApplicantId}
            initialTab={initialTab}
          />
        ) : (
          <CollaboratorProjectView
            project={project}
            user={user}
            signedScriptUrl={signedScriptUrl}
            onApplyRole={handleApplyRole}
          />
        )}
      </div>

      {/* ─── Apply Modal (Collaborator) ─── */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        role={applyRole}
        projectTitle={project.title}
        message={applyMessage}
        onMessageChange={setApplyMessage}
        onSubmit={handleApplySubmit}
        isSubmitting={isSubmittingApplication}
      />

      {/* ─── Edit Project Modal (Creator) ─── */}
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

      {/* ─── Toast Notifications ─── */}
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

export default ProjectDetailPage
