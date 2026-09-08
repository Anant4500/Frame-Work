import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import CreatorProjectCard from '../components/project/CreatorProjectCard'
import CollaboratorApplicationCard from '../components/project/CollaboratorApplicationCard'
import JoinedProductionCard from '../components/project/JoinedProductionCard'

const STATUS_STYLES = {
  'Open': 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(98,57,191,0.15)]',
  'Open for Collaboration': 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(98,57,191,0.15)]',
  'In Production': 'border-amber-500/40 text-amber-400 bg-amber-500/15',
  'Completed': 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15',
  'Closed': 'border-white/20 text-white/60 bg-white/5',
}

const APP_STATUS = {
  Pending: 'border-purple/40 text-purple-light bg-purple/15 shadow-[0_0_8px_rgba(98,57,191,0.15)]',
  Accepted: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/15',
  Rejected: 'border-white/10 text-white/30 bg-white/5',
}

function MyProjectsPage() {
  usePageTitle('My Projects | FrameWork')
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [createdProjects, setCreatedProjects] = useState([])
  const [incomingApplications, setIncomingApplications] = useState([])
  const [myApplicationsList, setMyApplicationsList] = useState([])
  const [loadingCreated, setLoadingCreated] = useState(true)
  const [loadingApps, setLoadingApps] = useState(true)
  const [creatorError, setCreatorError] = useState(null)
  const [collaboratorError, setCollaboratorError] = useState(null)
  const [toast, setToast] = useState(null)
  const isCreator = user?.role === 'creator'
  const [activeTab, setActiveTab] = useState(() =>
    user?.role === 'creator' ? 'created' : 'joined'
  )
  const [projectStatusFilter, setProjectStatusFilter] = useState('all')
  const [collaboratorAppFilter, setCollaboratorAppFilter] = useState('all')

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`
        }
      })
      return
    }
  }, [user, navigate, location])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Fetch creator's live projects and incoming applications from Supabase
  const fetchCreatorData = useCallback(async (showLoading = true) => {
    if (!user?.id) return
    try {
      setCreatorError(null)
      if (showLoading) {
        setLoadingCreated(true)
        setLoadingApps(true)
      }
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .select('id, title, logline, genre, location, budget, timeline, poster_url, status, created_at, roles:project_roles(id, role, positions_needed)')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (projError) throw projError

      const mappedProjects = (projData || []).map((p) => ({
        id: p.id,
        title: p.title || 'Untitled Project',
        logline: p.logline || '',
        genre: p.genre || 'Drama',
        location: p.location || 'Remote',
        budget: p.budget,
        timeline: p.timeline,
        thumbnail: p.poster_url || '/images/hero-bg.png',
        poster_url: p.poster_url,
        status: p.status === 'OPEN'
          ? 'Open'
          : p.status === 'IN_PRODUCTION'
            ? 'In Production'
            : p.status === 'COMPLETED'
              ? 'Completed'
              : p.status === 'CLOSED'
                ? 'Closed'
                : p.status,
        date: p.created_at ? p.created_at.split('T')[0] : '',
        created_at: p.created_at,
        creator: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        roles: Array.isArray(p.roles) ? p.roles.map((r) => r.role) : [],
        rawRoles: p.roles || [],
      }))
      setCreatedProjects(mappedProjects)

      // Fetch incoming applications across all creator's projects
      const { data: incomingData, error: incomingError } = await supabase
        .from('applications')
        .select('id, project_id, project_role_id, applicant_id, status, message, created_at, project:projects!inner(id, title, creator_id), role:project_roles(id, role), applicant:profiles(id, name, profile_photo_url, location, resume_url)')
        .eq('project.creator_id', user.id)
        .order('created_at', { ascending: false })

      if (incomingError) throw incomingError

      const mappedIncoming = (incomingData || []).map((a) => {
        const rawStatus = a.status || 'PENDING'
        const status = rawStatus.toUpperCase() === 'ACCEPTED' ? 'Accepted' : rawStatus.toUpperCase() === 'REJECTED' ? 'Rejected' : 'Pending'
        return {
          id: a.id,
          projectId: a.project?.id || a.project_id,
          projectTitle: a.project?.title || 'Project',
          project_role_id: a.project_role_id,
          applicantId: a.applicant_id,
          applicantName: a.applicant?.name || 'Applicant',
          applicantAvatar: a.applicant?.profile_photo_url || null,
          applicantLocation: a.applicant?.location || 'Remote',
          applicantResume: a.applicant?.resume_url || null,
          roleApplied: a.role?.role || 'Collaborator',
          message: a.message || '',
          status,
          dateApplied: a.created_at ? a.created_at.split('T')[0] : 'Recently',
        }
      })
      setIncomingApplications(mappedIncoming)
    } catch (err) {
      console.error('Error fetching creator dashboard data:', err)
      setCreatorError("We couldn't load your creator dashboard. Please try again.")
    } finally {
      if (showLoading) {
        setLoadingCreated(false)
        setLoadingApps(false)
      }
    }
  }, [user?.id, user?.name, user?.avatar])

  // Fetch collaborator's submitted applications + real project/creator data
  const fetchCollaboratorData = useCallback(async () => {
    if (!user?.id) return
    try {
      setCollaboratorError(null)
      setLoadingApps(true)
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          message,
          created_at,
          project_role_id,
          role:project_roles(role),
          project:projects(
            id,
            title,
            poster_url,
            location,
            genre,
            status,
            creator_id,
            creator:profiles(id, name, profile_photo_url)
          )
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })

      if (appError) throw appError

      const mappedApps = (appData || []).map((a) => {
        const rawStatus = (a.status || 'PENDING').toUpperCase()
        const status =
          rawStatus === 'ACCEPTED'
            ? 'Accepted'
            : rawStatus === 'REJECTED'
            ? 'Rejected'
            : rawStatus === 'WITHDRAWN'
            ? 'Withdrawn'
            : 'Pending'

        const rawProjStatus = (a.project?.status || 'OPEN').toUpperCase()
        const projectStatus =
          rawProjStatus === 'COMPLETED'
            ? 'Completed'
            : rawProjStatus === 'IN_PRODUCTION'
            ? 'In Production'
            : rawProjStatus === 'CLOSED'
            ? 'Closed'
            : 'Open'

        const creator = a.project?.creator || null
        const creatorName = creator?.name || 'FrameWork creator'
        const creatorId = creator?.id || a.project?.creator_id || null

        let dateApplied = 'Recently'
        if (a.created_at) {
          try {
            const d = new Date(a.created_at)
            if (!isNaN(d.getTime())) {
              dateApplied = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
          } catch {
            dateApplied = a.created_at.split('T')[0]
          }
        }

        return {
          id: a.id,
          projectId: a.project?.id || a.project_id,
          title: a.project?.title || 'Untitled Project',
          poster: a.project?.poster_url || '/images/hero-bg.png',
          genre: a.project?.genre || 'Film',
          location: a.project?.location || 'Remote',
          status,
          rawStatus: a.status,
          projectStatus,
          rawProjectStatus: a.project?.status,
          roleApplied: a.role?.role || 'Collaborator',
          dateApplied,
          message: a.message || '',
          creatorId,
          creatorName,
          creatorAvatar: creator?.profile_photo_url || null,
        }
      })
      setMyApplicationsList(mappedApps)
    } catch (err) {
      console.error('Error fetching collaborator applications:', err)
      setCollaboratorError("We couldn't load your applications and joined productions. Please try again.")
    } finally {
      setLoadingApps(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isCreator) {
      fetchCreatorData(true)
    } else {
      fetchCollaboratorData()
    }
  }, [isCreator, fetchCreatorData, fetchCollaboratorData])

  // Collaborator Joined Productions (Accepted applications with real project status & creator)
  const joinedProductionsList = useMemo(() => {
    if (isCreator) {
      return []
    }
    return myApplicationsList
      .filter((a) => a.status === 'Accepted')
      .map((a) => ({
        id: a.id,
        applicationId: a.id,
        projectId: a.projectId,
        title: a.title,
        poster: a.poster,
        projectStatus: a.projectStatus,
        rawProjectStatus: a.rawProjectStatus,
        isCompleted: (a.rawProjectStatus || '').toUpperCase() === 'COMPLETED',
        role: a.roleApplied,
        creatorName: a.creatorName,
        creatorId: a.creatorId,
        creatorAvatar: a.creatorAvatar,
        location: a.location,
        genre: a.genre,
      }))
  }, [isCreator, myApplicationsList])

  // Group incoming applications by project ID for Creator Command Center
  const applicationsByProject = useMemo(() => {
    const map = {}
    for (const app of incomingApplications) {
      const pid = String(app.projectId)
      if (!map[pid]) {
        map[pid] = {
          all: [],
          pending: 0,
          accepted: 0,
          rejected: 0,
        }
      }
      map[pid].all.push(app)
      const s = String(app.status || '').toUpperCase()
      if (s === 'PENDING') map[pid].pending += 1
      else if (s === 'ACCEPTED') map[pid].accepted += 1
      else if (s === 'REJECTED') map[pid].rejected += 1
    }
    return map
  }, [incomingApplications])

  // Enrich creator projects with live aggregated metrics
  const enrichedCreatorProjects = useMemo(() => {
    return createdProjects.map((proj) => {
      const pApps = applicationsByProject[String(proj.id)] || {
        all: [],
        pending: 0,
        accepted: 0,
        rejected: 0,
      }

      const totalRequired = Array.isArray(proj.rawRoles)
        ? proj.rawRoles.reduce((sum, r) => sum + (Number(r.positions_needed) || 1), 0)
        : 0

      const totalFilled = pApps.accepted
      const pendingApplications = pApps.pending
      const teamMembers = pApps.accepted
      const totalApplications = pApps.all.length

      return {
        ...proj,
        totalRequired,
        totalFilled,
        pendingApplications,
        teamMembers,
        totalApplications,
        applicants: pApps.all,
      }
    })
  }, [createdProjects, applicationsByProject])

  // Creator Summary Metrics
  const creatorSummary = useMemo(() => {
    const totalProjects = enrichedCreatorProjects.length
    const openProductions = enrichedCreatorProjects.filter((p) => {
      const s = String(p.status || '').toUpperCase()
      return s === 'OPEN' || s === 'OPEN FOR COLLABORATION'
    }).length
    const pendingApplications = incomingApplications.filter(
      (a) => String(a.status || '').toUpperCase() === 'PENDING'
    ).length
    const teamMembers = incomingApplications.filter(
      (a) => String(a.status || '').toUpperCase() === 'ACCEPTED'
    ).length

    return {
      totalProjects,
      openProductions,
      pendingApplications,
      teamMembers,
    }
  }, [enrichedCreatorProjects, incomingApplications])

  // Collaborator Summary Metrics (Exact real calculations)
  const collaboratorSummary = useMemo(() => {
    const totalApplications = myApplicationsList.length
    const pendingApplications = myApplicationsList.filter(
      (a) => a.status === 'Pending'
    ).length

    const activeProjectIds = new Set()
    const completedProjectIds = new Set()

    for (const a of myApplicationsList) {
      if (a.status === 'Accepted') {
        const pStatus = (a.rawProjectStatus || '').toUpperCase()
        if (pStatus === 'COMPLETED') {
          completedProjectIds.add(a.projectId)
        } else {
          activeProjectIds.add(a.projectId)
        }
      }
    }

    return {
      activeProductions: activeProjectIds.size,
      pendingApplications,
      completedCredits: completedProjectIds.size,
      totalApplications,
    }
  }, [myApplicationsList])

  // Collaborator Application Filters
  const collaboratorFilterCounts = useMemo(() => {
    return {
      all: myApplicationsList.length,
      pending: myApplicationsList.filter((a) => a.status === 'Pending').length,
      accepted: myApplicationsList.filter((a) => a.status === 'Accepted').length,
      rejected: myApplicationsList.filter((a) => a.status === 'Rejected').length,
    }
  }, [myApplicationsList])

  const filteredCollaboratorApplications = useMemo(() => {
    if (collaboratorAppFilter === 'all') return myApplicationsList
    if (collaboratorAppFilter === 'pending') return myApplicationsList.filter((a) => a.status === 'Pending')
    if (collaboratorAppFilter === 'accepted') return myApplicationsList.filter((a) => a.status === 'Accepted')
    if (collaboratorAppFilter === 'rejected') return myApplicationsList.filter((a) => a.status === 'Rejected')
    return myApplicationsList
  }, [myApplicationsList, collaboratorAppFilter])

  // Creator Status filter counts & filtered projects
  const statusFilterCounts = useMemo(() => {
    const counts = {
      all: enrichedCreatorProjects.length,
      open: 0,
      in_production: 0,
      completed: 0,
      closed: 0,
    }
    for (const p of enrichedCreatorProjects) {
      const s = String(p.status || '').toUpperCase()
      if (s === 'OPEN' || s === 'OPEN FOR COLLABORATION') {
        counts.open += 1
      } else if (s === 'IN_PRODUCTION' || s === 'IN PRODUCTION') {
        counts.in_production += 1
      } else if (s === 'COMPLETED') {
        counts.completed += 1
      } else if (s === 'CLOSED') {
        counts.closed += 1
      }
    }
    return counts
  }, [enrichedCreatorProjects])

  const filteredCreatorProjects = useMemo(() => {
    if (projectStatusFilter === 'all') return enrichedCreatorProjects
    if (projectStatusFilter === 'open') {
      return enrichedCreatorProjects.filter((p) => {
        const s = String(p.status || '').toUpperCase()
        return s === 'OPEN' || s === 'OPEN FOR COLLABORATION'
      })
    }
    if (projectStatusFilter === 'in_production') {
      return enrichedCreatorProjects.filter((p) => {
        const s = String(p.status || '').toUpperCase()
        return s === 'IN_PRODUCTION' || s === 'IN PRODUCTION'
      })
    }
    if (projectStatusFilter === 'completed') {
      return enrichedCreatorProjects.filter((p) => {
        const s = String(p.status || '').toUpperCase()
        return s === 'COMPLETED'
      })
    }
    if (projectStatusFilter === 'closed') {
      return enrichedCreatorProjects.filter((p) => {
        const s = String(p.status || '').toUpperCase()
        return s === 'CLOSED'
      })
    }
    return enrichedCreatorProjects
  }, [enrichedCreatorProjects, projectStatusFilter])

  const handleAcceptApplication = async (appId) => {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('accept_project_application', {
        p_application_id: appId,
      })

      if (rpcErr) {
        throw rpcErr
      }

      if (rpcRes && !rpcRes.success) {
        setToast({ type: 'error', text: rpcRes.error || 'This role is already filled.' })
        return
      }

      setIncomingApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: 'Accepted' } : a)
      )
      setToast({ type: 'success', text: 'Application accepted successfully!' })
      fetchCreatorData(false)
    } catch (err) {
      console.error('Error accepting application:', err)
      setToast({ type: 'error', text: err.message || 'Failed to accept application' })
    }
  }

  const handleRejectApplication = async (appId) => {
    try {
      const { data: rpcRes, error: rpcErr } = await supabase.rpc('reject_project_application', {
        p_application_id: appId,
      })

      if (rpcErr) throw rpcErr

      if (rpcRes && !rpcRes.success) {
        setToast({ type: 'error', text: rpcRes.error || 'Failed to reject application' })
        return
      }

      setIncomingApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: 'Rejected' } : a)
      )
      setToast({ type: 'error', text: 'Application rejected' })
      fetchCreatorData(false)
    } catch (err) {
      console.error('Error rejecting application:', err)
      setToast({ type: 'error', text: err.message || 'Failed to reject application' })
    }
  }

  if (!user) return null

  // Tabs configured by role
  const tabs = isCreator
    ? [
        { key: 'created', label: 'Projects', count: enrichedCreatorProjects.length },
        { key: 'applications', label: 'Applications', count: incomingApplications.length, pendingCount: creatorSummary.pendingApplications },
        { key: 'joined', label: 'Joined', count: 0 },
      ]
    : [
        { key: 'joined', label: 'Joined Productions', count: joinedProductionsList.length },
        { key: 'applications', label: 'Applications', count: myApplicationsList.length },
      ]

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4 animate-fade-in-up">
          <div>
            {isCreator ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-purple/30 bg-purple/10 text-purple-light mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                  CREATOR WORKSPACE
                </span>
                <h1 className="font-['Bebas_Neue',_sans-serif] text-5xl sm:text-6xl font-normal tracking-wide leading-none mb-3 text-white">
                  My <span className="gradient-text">Projects</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg max-w-xl">
                  Manage your productions, applications, roles, and teams.
                </p>
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-purple/30 bg-purple/10 text-purple-light mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple" />
                  COLLABORATOR WORKSPACE
                </span>
                <h1 className="font-['Bebas_Neue',_sans-serif] text-5xl sm:text-6xl font-normal tracking-wide leading-none mb-3 text-white">
                  My Applications & <span className="gradient-text">Productions</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg max-w-xl">
                  Track your applications, joined films, and production credits.
                </p>
              </>
            )}
          </div>

          {isCreator ? (
            <Link
              to="/create-project"
              id="create-project-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#6239BF] text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Create Project</span>
            </Link>
          ) : (
            <Link
              to="/explore"
              id="explore-projects-btn"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#6239BF] text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span>Explore Projects &rarr;</span>
            </Link>
          )}
        </div>

        {/* Stats / Metrics Row */}
        {isCreator ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up animation-delay-100" style={{ animationFillMode: 'both' }}>
            <CreatorMetricCard
              label="Total Projects"
              value={creatorSummary.totalProjects}
              icon={<IconFilm />}
              subtitle="Productions created"
            />
            <CreatorMetricCard
              label="Open Productions"
              value={creatorSummary.openProductions}
              icon={<IconBolt />}
              subtitle="Actively recruiting"
            />
            <CreatorMetricCard
              label="Pending Applications"
              value={creatorSummary.pendingApplications}
              icon={<IconInbox />}
              subtitle={creatorSummary.pendingApplications > 0 ? "Needs your review" : "All reviewed"}
              highlight={creatorSummary.pendingApplications > 0}
            />
            <CreatorMetricCard
              label="Team Members"
              value={creatorSummary.teamMembers}
              icon={<IconUsers />}
              subtitle="Accepted collaborators"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 animate-fade-in-up animation-delay-100" style={{ animationFillMode: 'both' }}>
            <CreatorMetricCard
              label="Active Productions"
              value={collaboratorSummary.activeProductions}
              icon={<IconBolt />}
              subtitle="Joined ongoing films"
            />
            <CreatorMetricCard
              label="Pending Applications"
              value={collaboratorSummary.pendingApplications}
              icon={<IconInbox />}
              subtitle={collaboratorSummary.pendingApplications > 0 ? "Awaiting decision" : "All reviewed"}
              highlight={collaboratorSummary.pendingApplications > 0}
            />
            <CreatorMetricCard
              label="Completed Credits"
              value={collaboratorSummary.completedCredits}
              icon={<IconTrophy />}
              subtitle="Verified film credits"
            />
            <CreatorMetricCard
              label="Total Applications"
              value={collaboratorSummary.totalApplications}
              icon={<IconSend />}
              subtitle="Submitted applications"
            />
          </div>
        )}

        {/* Tabs Header */}
        <div
          role="tablist"
          aria-label={isCreator ? "Creator dashboard sections" : "Collaborator dashboard sections"}
          className="relative flex gap-1 mb-8 border-b border-white/5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              tabIndex={activeTab === tab.key ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(e) => {
                const tabKeys = tabs.map((t) => t.key)
                const currentIndex = tabKeys.indexOf(tab.key)
                if (currentIndex === -1) return
                let nextIndex = null
                if (e.key === 'ArrowRight') {
                  e.preventDefault()
                  nextIndex = (currentIndex + 1) % tabKeys.length
                } else if (e.key === 'ArrowLeft') {
                  e.preventDefault()
                  nextIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length
                } else if (e.key === 'Home') {
                  e.preventDefault()
                  nextIndex = 0
                } else if (e.key === 'End') {
                  e.preventDefault()
                  nextIndex = tabKeys.length - 1
                }
                if (nextIndex !== null) {
                  const nextKey = tabKeys[nextIndex]
                  setActiveTab(nextKey)
                  setTimeout(() => {
                    const el = document.getElementById(`tab-${nextKey}`)
                    if (el) el.focus()
                  }, 0)
                }
              }}
              className={`relative px-5 py-3.5 text-sm font-medium transition-all duration-300 rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
                activeTab === tab.key ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-purple/20 text-purple-light font-semibold'
                    : isCreator && tab.key === 'applications' && tab.pendingCount > 0
                      ? 'bg-purple/25 text-purple-light border border-purple/30 font-semibold'
                      : 'bg-white/5 text-white/50'
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
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="focus-visible:outline-none"
          style={{ animation: 'fadeInUp 0.5s ease-out' }}
          key={activeTab}
        >
          {isCreator && activeTab === 'created' && (
            <CreatorProjectsTab
              projects={filteredCreatorProjects}
              allProjectsCount={enrichedCreatorProjects.length}
              loading={loadingCreated}
              error={creatorError}
              onRetry={() => fetchCreatorData(true)}
              statusFilter={projectStatusFilter}
              onFilterChange={setProjectStatusFilter}
              statusCounts={statusFilterCounts}
            />
          )}

          {isCreator && activeTab === 'joined' && (
            <JoinedTab projects={[]} />
          )}

          {isCreator && activeTab === 'applications' && (
            <ApplicationsTab
              applications={incomingApplications}
              isCreator={true}
              loading={loadingApps}
              onAccept={handleAcceptApplication}
              onReject={handleRejectApplication}
            />
          )}

          {!isCreator && activeTab === 'applications' && (
            <CollaboratorApplicationsTab
              applications={filteredCollaboratorApplications}
              filter={collaboratorAppFilter}
              onFilterChange={setCollaboratorAppFilter}
              filterCounts={collaboratorFilterCounts}
              loading={loadingApps}
              error={collaboratorError}
              onRetry={fetchCollaboratorData}
            />
          )}

          {!isCreator && activeTab === 'joined' && (
            <CollaboratorJoinedTab
              productions={joinedProductionsList}
              loading={loadingApps}
              error={collaboratorError}
              onRetry={fetchCollaboratorData}
            />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border backdrop-blur-xl toast-enter flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            'bg-purple/10 border-purple/20 text-purple-light'
          }`}
        >
          {toast.type === 'success' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{toast.text}</span>
        </div>
      )}
    </section>
  )
}

/* ═══════════════════════════════════════════ */
/*        CREATOR PROJECTS TAB & FILTERS       */
/* ═══════════════════════════════════════════ */
function CreatorProjectsTab({
  projects = [],
  allProjectsCount = 0,
  loading = false,
  error = null,
  onRetry,
  statusFilter = 'all',
  onFilterChange,
  statusCounts = {},
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="status" aria-live="polite">
        <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-white/50 text-sm">Loading your productions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-red-500/20 rounded-2xl bg-[#111111]" role="alert">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl font-normal tracking-wide text-white mb-2">Unable to Load Your Projects</h3>
        <p className="text-white/50 text-sm mb-6 max-w-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (allProjectsCount === 0) {
    return (
      <EmptyState
        icon={<IconFilm />}
        title="No Productions Created Yet"
        subtitle="Start your first film project, list roles, and assemble your crew."
        btnLabel="+ Create Your First Project"
        btnLink="/create-project"
      />
    )
  }

  const filters = [
    { key: 'all', label: 'All', count: statusCounts.all || 0 },
    { key: 'open', label: 'Open', count: statusCounts.open || 0 },
    { key: 'in_production', label: 'In Production', count: statusCounts.in_production || 0 },
    { key: 'completed', label: 'Completed', count: statusCounts.completed || 0 },
    { key: 'closed', label: 'Closed', count: statusCounts.closed || 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            id={`filter-${f.key}`}
            aria-pressed={statusFilter === f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
              statusFilter === f.key
                ? 'bg-purple text-white border-purple shadow-[0_0_15px_rgba(98,57,191,0.3)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-purple/30 hover:text-white/80'
            }`}
          >
            <span>{f.label}</span>
            <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
              statusFilter === f.key ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <CreatorProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-white/5 border-dashed rounded-2xl bg-[#111111]">
          <p className="text-white/50 text-sm mb-1">
            No {statusFilter.replace('_', ' ')} productions found.
          </p>
          <p className="text-white/50 text-xs">
            Try selecting a different status filter above.
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*      COLLABORATOR APPLICATIONS TAB          */
/* ═══════════════════════════════════════════ */
function CollaboratorApplicationsTab({
  applications = [],
  filter = 'all',
  onFilterChange,
  filterCounts,
  loading = false,
  error = null,
  onRetry,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="status" aria-live="polite">
        <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-white/50 text-sm">Loading your applications...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-red-500/20 rounded-2xl bg-[#111111]" role="alert">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl font-normal tracking-wide text-white mb-2">Unable to Load Your Dashboard</h3>
        <p className="text-white/50 text-sm mb-6 max-w-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Try Again
        </button>
      </div>
    )
  }

  const filters = [
    { key: 'all', label: 'All', count: filterCounts.all },
    { key: 'pending', label: 'Pending', count: filterCounts.pending },
    { key: 'accepted', label: 'Accepted', count: filterCounts.accepted },
    { key: 'rejected', label: 'Rejected', count: filterCounts.rejected },
  ]

  return (
    <div className="space-y-6">
      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            id={`filter-${f.key}`}
            onClick={() => onFilterChange(f.key)}
            aria-pressed={filter === f.key}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
              filter === f.key
                ? 'bg-purple text-white border-purple shadow-[0_0_15px_rgba(98,57,191,0.3)]'
                : 'bg-white/[0.04] border-white/10 text-white/50 hover:border-purple/30 hover:text-white/80'
            }`}
          >
            <span>{f.label}</span>
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
              filter === f.key ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications Grid or Contextual Empty State */}
      {applications.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {applications.map((app) => (
            <CollaboratorApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-white/5 border-dashed rounded-2xl bg-[#111111]">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4 text-white/20" aria-hidden="true">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white/80 mb-1">
            {filter === 'all'
              ? 'No applications yet.'
              : filter === 'pending'
              ? 'No pending applications.'
              : filter === 'accepted'
              ? 'No accepted applications yet.'
              : 'No rejected applications.'}
          </h3>
          <p className="text-white/50 text-xs mb-6 max-w-sm mx-auto">
            {filter === 'all'
              ? 'Find a film project that matches your craft skills and apply to join the crew.'
              : filter === 'pending'
              ? 'You have no applications awaiting creator decision at this time.'
              : filter === 'accepted'
              ? 'When a filmmaker accepts your application, it will appear here.'
              : 'None of your submitted applications have been declined.'}
          </p>
          {filter === 'all' && (
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6239BF] text-white text-xs font-semibold rounded-full transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_20px_rgba(98,57,191,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              <span>Explore Projects</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════ */
/*        COLLABORATOR JOINED TAB              */
/* ═══════════════════════════════════════════ */
function CollaboratorJoinedTab({ productions = [], loading = false, error = null, onRetry }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="status" aria-live="polite">
        <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-white/50 text-sm">Loading joined productions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-red-500/20 rounded-2xl bg-[#111111]" role="alert">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl font-normal tracking-wide text-white mb-2">Unable to Load Your Dashboard</h3>
        <p className="text-white/50 text-sm mb-6 max-w-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (productions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 border-dashed rounded-2xl bg-[#111111]">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-5 text-white/20" aria-hidden="true">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white/80 mb-2">No joined productions yet.</h3>
        <p className="text-white/50 text-sm mb-6 max-w-md">
          Accepted projects will appear here when you join a film team.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#6239BF] text-white text-xs font-semibold rounded-full transition-all duration-300 hover:bg-[#502da8] hover:shadow-[0_0_25px_rgba(98,57,191,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          <span>Explore Projects</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {productions.map((p) => (
        <JoinedProductionCard key={p.applicationId} production={p} />
      ))}
    </div>
  )
}

/* ─── Metric Card (Shared for Creator & Collaborator) ─── */
function CreatorMetricCard({ label, value, icon, subtitle, highlight = false }) {
  return (
    <div className={`group bg-[#111111] border rounded-2xl p-5 transition-all duration-300 ${
      highlight
        ? 'border-purple/40 shadow-[0_0_24px_rgba(98,57,191,0.15)]'
        : 'border-white/[0.08] hover:border-white/[0.15]'
    }`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
          highlight
            ? 'bg-purple/25 text-purple-light'
            : 'bg-white/[0.04] text-white/50 group-hover:text-purple group-hover:bg-purple/10'
        }`} aria-hidden="true">
          {icon}
        </div>
      </div>
      <p className="font-['Bebas_Neue',_sans-serif] text-4xl font-normal text-white tracking-wide leading-none">{value}</p>
      {subtitle && (
        <p className={`text-[11px] mt-1 font-medium ${highlight ? 'text-purple-light/70' : 'text-white/50'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ─── Creator Joined Tab (if Creator visits joined) ─── */
function JoinedTab({ projects = [] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<IconUsers />}
        title="No Projects Joined Yet"
        subtitle="Discover films looking for collaborators like you."
        btnLabel="Explore Projects"
        btnLink="/explore"
      />
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map((p) => (
        <div key={p.id} className="group bg-[#111111] border border-white/5 rounded-2xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:border-white/10">
          <div className="relative h-40 overflow-hidden">
            <img src={p.poster} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/40 to-transparent" />
            <span className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${STATUS_STYLES[p.status] || STATUS_STYLES['Open']}`}>
              {p.status}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-['Bebas_Neue',_sans-serif] text-xl font-normal tracking-wide mb-1 group-hover:text-purple-light transition-colors">{p.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 text-xs font-semibold bg-purple/15 border border-purple/30 text-purple-light rounded-full">
                {p.role}
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

/* ─── Creator Applications Tab ─── */
function ApplicationsTab({ applications = [], isCreator = false, loading = false, onAccept, onReject }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-white/40 text-sm">Loading applications...</p>
      </div>
    )
  }

  const handleViewApplicantResume = async (resumePath) => {
    if (!resumePath) return
    try {
      let cleanPath = resumePath
      if (cleanPath.includes('/resumes/')) cleanPath = cleanPath.split('/resumes/')[1]
      if (cleanPath.includes('?')) cleanPath = cleanPath.split('?')[0]

      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(cleanPath, 120)

      if (!error && data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      } else {
        console.error('Error generating signed URL for applicant resume:', error)
      }
    } catch (err) {
      console.error('Error viewing applicant resume:', err)
    }
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<IconSend />}
        title={isCreator ? "No Applications Received Yet" : "No Applications Yet"}
        subtitle={isCreator ? "When collaborators apply for roles in your projects, they will appear here." : "Find a project that matches your skills and apply."}
        btnLabel={isCreator ? "View Your Projects" : "Find a Project"}
        btnLink={isCreator ? "/my-projects" : "/explore"}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((app) => (
        <div key={app.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-white/10 flex flex-col justify-between">
          <div>
            {/* Header: Applicant info + Status */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple/15 border border-purple/25 flex items-center justify-center overflow-hidden shrink-0">
                  {app.applicantAvatar ? (
                    <img src={app.applicantAvatar} alt={app.applicantName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-purple">{app.applicantName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{app.applicantName}</h3>
                  <p className="text-white/40 text-xs">{app.applicantLocation}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm rounded-full border ${APP_STATUS[app.status] || APP_STATUS['Pending']}`}>
                {app.status}
              </span>
            </div>

            {/* Application details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/40">Role applied:</span>
                <span className="font-semibold text-purple-light bg-purple/10 px-2 py-0.5 rounded border border-purple/20">
                  {app.roleApplied}
                </span>
              </div>
              <div className="text-xs text-white/40">
                Project: <Link to={`/project/${app.projectId}`} className="text-white hover:text-purple-light transition-colors font-medium">{app.projectTitle}</Link>
              </div>
              {app.message && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white/60 leading-relaxed italic">
                  "{app.message}"
                </div>
              )}
            </div>
          </div>

          {/* Actions / Links */}
          <div>
            <div className="flex items-center justify-between text-xs text-white/30 pt-3 border-t border-white/5 mb-4">
              <span>Applied {app.dateApplied}</span>
              {app.applicantResume && (
                <button
                  type="button"
                  onClick={() => handleViewApplicantResume(app.applicantResume)}
                  className="text-purple-light hover:text-purple transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  View Resume &rarr;
                </button>
              )}
            </div>

            {app.status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAccept && onAccept(app.id)}
                  className="flex-1 py-2 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Accept
                </button>
                <button
                  onClick={() => onReject && onReject(app.id)}
                  className="flex-1 py-2 text-xs font-semibold bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg transition-all duration-300 hover:bg-red-500/20 hover:border-red-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Shared Empty State ─── */
function EmptyState({ icon, title, subtitle, btnLabel, btnLink }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 border-dashed rounded-2xl bg-[#111111]">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 text-white/15" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white/80 mb-2">{title}</h3>
      <p className="text-white/50 text-sm mb-6 max-w-sm">{subtitle}</p>
      <Link
        to={btnLink}
        className="inline-flex items-center gap-2 px-6 py-3 bg-purple text-white text-sm font-semibold rounded-full transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
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
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
}
function IconInbox() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.375v4.875a2.625 2.625 0 002.625 2.625h14.25a2.625 2.625 0 002.625-2.625v-4.875m-19.5 0A2.25 2.25 0 014.5 12h15a2.25 2.25 0 012.25 2.25" />
    </svg>
  )
}

export default MyProjectsPage
