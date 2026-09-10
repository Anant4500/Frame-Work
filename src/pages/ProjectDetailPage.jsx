import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import CreatorProjectView from '../components/project/CreatorProjectView'
import CollaboratorProjectView from '../components/project/CollaboratorProjectView'
import EditProjectModal from '../components/project/EditProjectModal'
import ApplyModal from '../components/project/ApplyModal'
import { getRoleOccupancy, formatProjectStatus } from '../components/project/projectRoleUtils'

function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  return <ProjectDetailContent key={`${id}:${user?.id || 'anonymous'}`} />
}

function ProjectDetailContent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab')
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [signedScriptUrl, setSignedScriptUrl] = useState(null)
  const [signedScriptExpiresAt, setSignedScriptExpiresAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState(false)
  const [toast, setToast] = useState(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [applyRole, setApplyRole] = useState('')
  const [applyMessage, setApplyMessage] = useState('')
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const [processingApplicantId, setProcessingApplicantId] = useState(null)

  const pageTitle = notFound
    ? 'Project Not Found | FrameWork'
    : (project?.title ? `${project.title} | FrameWork` : 'Project Details | FrameWork')
  usePageTitle(pageTitle)

  useEffect(() => {
    window.scrollTo(0, 0)
    setProject(null)
    setSignedScriptUrl(null)
    setSignedScriptExpiresAt(null)
    setNotFound(false)
    setFetchError(null)
    setApplicationsError(false)
  }, [id])

  const fetchApplications = useCallback(async (projectId) => {
    if (!projectId) return null
    try {
      setApplicationsLoading(true)
      setApplicationsError(false)

      const { data: appData, error: appErr } = await supabase
        .from('applications')
        .select(`
          id,
          project_id,
          project_role_id,
          applicant_id,
          message,
          status,
          created_at,
          applicant:profiles(
            id,
            name,
            profile_photo_url,
            location,
            resume_url
          ),
          role:project_roles(
            role
          )
        `)
        .eq('project_id', projectId)

      if (appErr) throw appErr

      const projectApplicants = (appData || []).map((a) => ({
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

      setProject((prev) => (prev ? { ...prev, applicants: projectApplicants } : prev))
      setApplicationsError(false)
      return projectApplicants
    } catch (appErr) {
      console.error('Error fetching applications for project:', appErr)
      setApplicationsError(true)
      setProject((prev) => (prev ? { ...prev, applicants: null } : prev))
      return null
    } finally {
      setApplicationsLoading(false)
    }
  }, [])

  const ensureScriptSignedUrl = useCallback(async (forceRefresh = false) => {
    if (!project?.script_url) {
      setSignedScriptUrl(null)
      setSignedScriptExpiresAt(null)
      return null
    }

    // Reuse existing signed URL if still fresh (60-second buffer)
    if (
      !forceRefresh &&
      signedScriptUrl &&
      signedScriptExpiresAt &&
      Date.now() < signedScriptExpiresAt - 60 * 1000
    ) {
      return signedScriptUrl
    }

    try {
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('scripts')
        .createSignedUrl(project.script_url, 15 * 60) // 15-minute lifetime (900s)

      if (!signedError && signedData?.signedUrl) {
        setSignedScriptUrl(signedData.signedUrl)
        setSignedScriptExpiresAt(Date.now() + 15 * 60 * 1000)
        return signedData.signedUrl
      } else {
        setSignedScriptUrl(null)
        setSignedScriptExpiresAt(null)
        if (signedError) {
          console.warn('[Storage] Script access denied or unavailable:', signedError.message)
        }
        return null
      }
    } catch (storageErr) {
      console.warn('[Storage] Exception requesting signed script URL:', storageErr)
      setSignedScriptUrl(null)
      setSignedScriptExpiresAt(null)
      return null
    }
  }, [project?.script_url, signedScriptUrl, signedScriptExpiresAt])

  const fetchProject = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setFetchError(null)
      setNotFound(false)
      setSignedScriptUrl(null)
      setSignedScriptExpiresAt(null)

      const { data, error: queryError } = await supabase
        .from('projects')
        .select(`
          id,
          creator_id,
          title,
          logline,
          description,
          genre,
          status,
          location,
          format,
          shoot_start_date,
          shoot_end_date,
          language,
          budget_min,
          budget_max,
          target,
          budget,
          timeline,
          poster_url,
          script_url,
          script_visibility,
          tags,
          created_at,
          updated_at,
          creator:profiles(
            id,
            name,
            role,
            profile_photo_url,
            bio,
            location
          ),
          roles:project_roles(
            id,
            project_id,
            role,
            positions_needed,
            positions_filled,
            experience_level
          )
        `)
        .eq('id', id)
        .single()

      if (queryError) {
        if (queryError.code === 'PGRST116' || queryError.code === '22P02') {
          setNotFound(true)
          setProject(null)
          return
        }
        throw queryError
      }

      if (!data) {
        setNotFound(true)
        setProject(null)
        return
      }

      const mapped = {
        id: data.id,
        title: data.title || 'Untitled Project',
        logline: data.logline || '',
        description: data.description || '',
        genre: data.genre || 'Drama',
        location: data.location || 'Remote',
        format: data.format || null,
        shoot_start_date: data.shoot_start_date || null,
        shoot_end_date: data.shoot_end_date || null,
        language: data.language || null,
        budget_min: data.budget_min != null ? Number(data.budget_min) : null,
        budget_max: data.budget_max != null ? Number(data.budget_max) : null,
        target: data.target || null,
        tags: Array.isArray(data.tags) ? data.tags : [],
        budget: data.budget,
        timeline: data.timeline,
        rawStatus: data.status,
        status: formatProjectStatus(data.status),
        thumbnail: data.poster_url || '/images/hero-bg.png',
        poster_url: data.poster_url,
        script_url: data.script_url || null,
        script_visibility: data.script_visibility || 'ACCEPTED_TEAM',
        created_at: data.created_at,
        updated_at: data.updated_at,
        creator_id: data.creator_id,
        creator: data.creator
          ? {
              id: data.creator.id,
              name: data.creator.name || 'Creator',
              role: data.creator.role === 'CREATOR' ? 'Director' : data.creator.role || 'Creator',
              avatar: data.creator.profile_photo_url || null,
              bio: data.creator.bio || '',
              location: data.creator.location || data.location,
            }
          : null,
        roles: Array.isArray(data.roles) ? data.roles.map((r) => r.role) : [],
        rawRoles: data.roles || [],
        applicants: null,
      }
      setProject(mapped)

      // Fetch applications separately
      await fetchApplications(id)

      // Generate signed URL for private script if uploaded and authorized
      if (data.script_url) {
        try {
          const { data: signedData, error: signedError } = await supabase
            .storage
            .from('scripts')
            .createSignedUrl(data.script_url, 15 * 60) // 15-minute lifetime (900s)

          if (!signedError && signedData?.signedUrl) {
            setSignedScriptUrl(signedData.signedUrl)
            setSignedScriptExpiresAt(Date.now() + 15 * 60 * 1000)
          } else {
            setSignedScriptUrl(null)
            setSignedScriptExpiresAt(null)
            if (signedError) {
              console.warn('[Storage] Script access denied or unavailable:', signedError.message)
            }
          }
        } catch {
          setSignedScriptUrl(null)
          setSignedScriptExpiresAt(null)
        }
      } else {
        setSignedScriptUrl(null)
        setSignedScriptExpiresAt(null)
      }
    } catch (err) {
      console.error('Error fetching project detail:', err)
      setFetchError('Unable to load project.')
      setProject(null)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [id, fetchApplications])

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

  // Handle creator ?edit=true deep-link
  useEffect(() => {
    if (isCreatorOwner && searchParams.get('edit') === 'true') {
      setEditModalOpen(true)
    }
  }, [isCreatorOwner, searchParams])

  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false)
    if (searchParams.get('edit') === 'true') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('edit')
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleStatusUpdated = useCallback((newRawStatus) => {
    const displayStatus = formatProjectStatus(newRawStatus)

    setProject((prev) => prev ? {
      ...prev,
      rawStatus: newRawStatus,
      status: displayStatus,
    } : prev)

    setToast({ type: 'success', text: `Project status updated to ${displayStatus}.` })
  }, [])

  const handleApplyRole = (role) => {
    if (!user) {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}${location.hash}`
        }
      })
      return
    }
    if (isCreatorOwner) return

    const rawStatus = String(project?.rawStatus || project?.status || '').toUpperCase()
    if (rawStatus !== 'OPEN') {
      setToast({ type: 'error', text: 'Applications are closed for this project.' })
      return
    }

    if (applicationsError) {
      setToast({ type: 'error', text: 'Application status is unavailable. Please retry loading applications.' })
      return
    }

    const roleObj = Array.isArray(project?.rawRoles)
      ? project.rawRoles.find((r) => r.role === role)
      : null
    const { isFilled, isAvailable } = getRoleOccupancy(roleObj, project?.applicants || [])
    if (isAvailable && isFilled) {
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

    const rawStatus = String(project?.rawStatus || project?.status || '').toUpperCase()
    if (rawStatus !== 'OPEN') {
      setToast({ type: 'error', text: 'Applications are closed for this project.' })
      setApplyModalOpen(false)
      return
    }

    if (applicationsError) {
      setToast({ type: 'error', text: 'Application status is unavailable. Please retry loading applications.' })
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    const activeUserId = session?.user?.id || user?.id

    if (!activeUserId) {
      navigate('/login', {
        state: {
          from: `${location.pathname}${location.search}${location.hash}`
        }
      })
      return
    }

    if (isCreatorOwner || activeUserId === project.creator_id || activeUserId === project.creator?.id) {
      setToast({ type: 'error', text: 'Creators cannot apply to their own projects.' })
      setApplyModalOpen(false)
      return
    }

    const roleObj = Array.isArray(project?.rawRoles)
      ? project.rawRoles.find((r) => r.role === applyRole)
      : null
    const projectRoleId = roleObj?.id || null

    if (!projectRoleId) {
      setToast({ type: 'error', text: 'Role information could not be found. Please try again.' })
      return
    }

    const { isFilled: localFilled, isAvailable: localAvailable } = getRoleOccupancy(roleObj, project?.applicants || [])
    if (localAvailable && localFilled) {
      setToast({ type: 'error', text: 'This role has already been filled.' })
      setApplyModalOpen(false)
      return
    }

    try {
      setIsSubmittingApplication(true)

      // Verify live role capacity from authorized project_roles record
      const { data: liveRole, error: roleError } = await supabase
        .from('project_roles')
        .select('id, positions_needed, positions_filled')
        .eq('id', projectRoleId)
        .single()

      if (roleError || !liveRole) {
        console.error('Error verifying role capacity:', roleError)
        setToast({ type: 'error', text: 'Unable to verify role availability. Please try again.' })
        return
      }

      const rawNeeded = liveRole.positions_needed
      const rawFilled = liveRole.positions_filled
      const hasValidNeeded =
        rawNeeded !== null &&
        rawNeeded !== undefined &&
        !isNaN(Number(rawNeeded)) &&
        Number(rawNeeded) >= 1
      const hasValidFilled =
        rawFilled !== null &&
        rawFilled !== undefined &&
        !isNaN(Number(rawFilled)) &&
        Number(rawFilled) >= 0

      if (!hasValidNeeded || !hasValidFilled) {
        setToast({ type: 'error', text: 'Role availability information is currently unavailable. Please try again.' })
        return
      }

      const reqCount = Number(rawNeeded)
      const filledCount = Number(rawFilled)
      if (filledCount >= reqCount) {
        setToast({ type: 'error', text: 'This role has already been filled.' })
        setApplyModalOpen(false)
        await fetchProject(false)
        return
      }
      const { data: newApp, error: insertError } = await supabase
        .from('applications')
        .insert({
          project_id: project.id,
          project_role_id: projectRoleId,
          applicant_id: activeUserId,
          message: applyMessage.trim(),
          status: 'PENDING',
        })
        .select(`
          id,
          project_id,
          project_role_id,
          applicant_id,
          message,
          status,
          created_at,
          applicant:profiles(id, name, profile_photo_url),
          role:project_roles(role)
        `)
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

      // Refetch applications to sync database state & script access if visibility was APPLICANTS
      await fetchApplications(project.id)
      await ensureScriptSignedUrl(true)
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

    const { requiredCount, acceptedCount, isAvailable } = getRoleOccupancy(roleObj, project?.applicants || [], { isCreator: true })
    if (isAvailable && acceptedCount != null && acceptedCount >= requiredCount) {
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
        await fetchApplications(project.id)
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
      await fetchApplications(project.id)
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
      await fetchApplications(project.id)
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
          <p className="text-white/50 text-sm font-medium">Loading project details...</p>
        </div>
      </section>
    )
  }

  if (fetchError) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-28 pb-20 px-4">
        <div className="text-center max-w-md mx-auto p-8 bg-[#111116] border border-white/[0.08] rounded-2xl shadow-xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5 text-red-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide text-white mb-2">Unable to Load Project</h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            We encountered an issue loading this production. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => fetchProject(true)}
            className="px-6 py-2.5 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  if (notFound || !project) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-28 pb-20 px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375" />
            </svg>
          </div>
          <h2 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide text-white mb-2">Project Not Found</h2>
          <p className="text-white/50 mb-6 text-sm">This project may have been removed or is not available yet.</p>
          <Link
            to="/explore"
            className="px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
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
            applicationsLoading={applicationsLoading}
            applicationsError={applicationsError}
            onRetryApplications={() => fetchApplications(project.id)}
            onEnsureScriptUrl={ensureScriptSignedUrl}
            onStatusUpdated={handleStatusUpdated}
          />
        ) : (
          <CollaboratorProjectView
            project={project}
            user={user}
            signedScriptUrl={signedScriptUrl}
            onApplyRole={handleApplyRole}
            applicationsError={applicationsError}
            onRetryApplications={() => fetchApplications(project.id)}
            onEnsureScriptUrl={ensureScriptSignedUrl}
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
        onClose={handleCloseEditModal}
        project={project}
        onSaveSuccess={() => {
          handleCloseEditModal()
          setToast({ type: 'success', text: 'Project & roles updated successfully!' })
          setSignedScriptUrl(null)
          setSignedScriptExpiresAt(null)
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
