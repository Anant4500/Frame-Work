import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import ChatHeader from '../components/chat/ChatHeader'
import ChatMessageList from '../components/chat/ChatMessageList'
import ChatComposer from '../components/chat/ChatComposer'
import ChatMembersSidebar from '../components/chat/ChatMembersSidebar'

function formatDbMessage(row, creatorId) {
  const senderName = row.sender?.name || (row.sender_id === creatorId ? 'Project Owner' : 'Crew Member')
  const senderAvatar = row.sender?.profile_photo_url || null
  const senderRole = row.sender?.role || (row.sender_id === creatorId ? 'Creator' : 'Collaborator')

  return {
    id: row.id,
    project_id: row.project_id,
    sender_id: row.sender_id,
    senderId: row.sender_id,
    sender_name: senderName,
    sender_avatar: senderAvatar,
    senderRole,
    isCreator: row.sender_id === creatorId,
    created_at: row.created_at,
    body: row.body,
  }
}

export default function TeamChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()

  const projectIdNum = Number(id)
  const isValidProjectId = Boolean(id && !isNaN(projectIdNum) && projectIdNum > 0)

  // Project and state
  const [project, setProject] = useState(null)
  const [projectTitle, setProjectTitle] = useState(location.state?.projectTitle || 'Team Production Room')
  const [authChecking, setAuthChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [hasMoreOlder, setHasMoreOlder] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState(null)

  // Sidebar toggle
  const [isMembersOpen, setIsMembersOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })

  usePageTitle(`${projectTitle} Team Chat | FrameWork`)

  // Navigation back
  const handleBack = useCallback(() => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else if (isValidProjectId) {
      navigate(`/project/${projectIdNum}`)
    } else {
      navigate('/my-projects')
    }
  }, [navigate, isValidProjectId, projectIdNum])

  // 1. Verify Authentication & Membership Access
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Not logged in -> send to login with return path
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (!isValidProjectId) {
      setAuthChecking(false)
      setAuthorized(false)
      return
    }

    let isMounted = true

    async function checkAccess() {
      setAuthChecking(true)
      try {
        // Fetch project metadata & verify chat access RPC
        const [accessRes, projectRes] = await Promise.all([
          supabase.rpc('can_access_project_chat', { p_project_id: projectIdNum }),
          supabase.from('projects').select('id, title, creator_id').eq('id', projectIdNum).maybeSingle(),
        ])

        if (!isMounted) return

        if (accessRes.error || !accessRes.data) {
          setAuthorized(false)
          setAuthChecking(false)
          return
        }

        // User is authorized!
        setAuthorized(true)
        if (projectRes.data) {
          setProject(projectRes.data)
          setProjectTitle(projectRes.data.title)
        }
      } catch (err) {
        console.error('Error verifying chat access:', err)
        if (isMounted) setAuthorized(false)
      } finally {
        if (isMounted) setAuthChecking(false)
      }
    }

    checkAccess()

    return () => {
      isMounted = false
    }
  }, [user, authLoading, isValidProjectId, projectIdNum, navigate, location.pathname])

  // 2. Fetch Members and Recent 50 Messages once authorized
  useEffect(() => {
    if (!authorized || !isValidProjectId || !project) return

    let isMounted = true

    async function fetchChatData() {
      setLoadingHistory(true)
      try {
        // Fetch members and messages concurrently
        const [membersRes, messagesRes] = await Promise.all([
          supabase.rpc('get_project_chat_members', { p_project_id: projectIdNum }),
          supabase
            .from('project_chat_messages')
            .select(`
              id,
              project_id,
              sender_id,
              body,
              created_at,
              sender:profiles!sender_id(id, name, profile_photo_url, role)
            `)
            .eq('project_id', projectIdNum)
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .limit(50),
        ])

        if (!isMounted) return

        if (!membersRes.error && membersRes.data) {
          const formattedMembers = membersRes.data.map((m) => ({
            id: m.user_id,
            name: m.name || 'Crew Member',
            avatar: m.profile_photo_url || null,
            role: m.role || 'Collaborator',
            roles: m.project_roles || (m.is_creator ? ['Project Owner'] : ['Crew Member']),
            isCreator: Boolean(m.is_creator),
            is_creator: Boolean(m.is_creator),
          }))
          setMembers(formattedMembers)
        }

        if (!messagesRes.error && messagesRes.data) {
          if (messagesRes.data.length === 50) {
            setHasMoreOlder(true)
          }
          // Messages were fetched descending for limit 50, reverse to show chronological order
          const chronological = [...messagesRes.data].reverse().map((row) =>
            formatDbMessage(row, project.creator_id)
          )
          setMessages(chronological)
        }
      } catch (err) {
        console.error('Failed to load chat data:', err)
      } finally {
        if (isMounted) setLoadingHistory(false)
      }
    }

    fetchChatData()

    return () => {
      isMounted = false
    }
  }, [authorized, isValidProjectId, projectIdNum, project])

  // Ref to latest messages for reconnect reconciliation
  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // 3. Setup Realtime Private Broadcast Channel (Notification-Only)
  useEffect(() => {
    if (!authorized || !isValidProjectId || !project) return

    const topic = `project:${projectIdNum}:chat`
    const channel = supabase.channel(topic, {
      config: { private: true },
    })

    // Reconnection helper to pull missed messages using stable keyset pagination
    const reconcileMissedMessages = async () => {
      const currentList = messagesRef.current
      if (currentList.length === 0) return
      const latestMsg = currentList[currentList.length - 1]
      if (!latestMsg?.created_at || !latestMsg?.id) return

      try {
        const { data, error } = await supabase
          .from('project_chat_messages')
          .select(`
            id,
            project_id,
            sender_id,
            body,
            created_at,
            sender:profiles!sender_id(id, name, profile_photo_url, role)
          `)
          .eq('project_id', projectIdNum)
          .or(`created_at.gt.${latestMsg.created_at},and(created_at.eq.${latestMsg.created_at},id.gt.${latestMsg.id})`)
          .order('created_at', { ascending: true })
          .order('id', { ascending: true })

        if (!error && data && data.length > 0) {
          const newRows = data.map((r) => formatDbMessage(r, project.creator_id))
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const unique = newRows.filter((m) => !existingIds.has(m.id))
            return unique.length > 0 ? [...prev, ...unique] : prev
          })
        }
      } catch (err) {
        console.warn('Error during chat reconnect reconciliation:', err)
      }
    }

    // Handle broadcast notifications (ID only - fetch full message through RLS)
    channel
      .on('broadcast', { event: 'new_message' }, async ({ payload }) => {
        const messageId = payload?.id
        if (!messageId) return

        // If already present (e.g. sender's confirmed insert return), do not re-fetch
        if (messagesRef.current.some((m) => m.id === messageId)) return

        try {
          // Authoritative fetch via RLS: only authorized members can read the message body
          const { data: row } = await supabase
            .from('project_chat_messages')
            .select(`
              id,
              project_id,
              sender_id,
              body,
              created_at,
              sender:profiles!sender_id(id, name, profile_photo_url, role)
            `)
            .eq('id', messageId)
            .maybeSingle()

          if (row) {
            const formatted = formatDbMessage(row, project.creator_id)
            setMessages((prev) => {
              if (prev.some((m) => m.id === formatted.id)) return prev
              return [...prev, formatted]
            })
          } else {
            // Row is null or fetch error: revalidate membership to verify if access was revoked
            const { data: canAccess, error: accessErr } = await supabase.rpc('can_access_project_chat', {
              p_project_id: projectIdNum,
            })
            // Only revoke if access check succeeded and returned false (not a transient network error)
            if (!accessErr && canAccess === false) {
              setAuthorized(false)
              supabase.removeChannel(channel)
            }
          }
        } catch (err) {
          console.warn('Failed to fetch broadcasted message:', err)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Revalidate membership on reconnect before reconciling messages
          try {
            const { data: canAccess, error: accessErr } = await supabase.rpc('can_access_project_chat', {
              p_project_id: projectIdNum,
            })
            if (!accessErr && canAccess === false) {
              setAuthorized(false)
              supabase.removeChannel(channel)
              return
            }
          } catch {
            // Transient error: preserve retry behavior
          }

          reconcileMissedMessages()
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authorized, isValidProjectId, projectIdNum, project])

  // 4. Load Older Messages: Stable Keyset Pagination (created_at DESC, id DESC)
  const handleLoadOlder = useCallback(async () => {
    if (loadingOlder || messages.length === 0 || !project) return
    setLoadingOlder(true)
    const oldest = messages[0]
    if (!oldest?.created_at || !oldest?.id) {
      setLoadingOlder(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('project_chat_messages')
        .select(`
          id,
          project_id,
          sender_id,
          body,
          created_at,
          sender:profiles!sender_id(id, name, profile_photo_url, role)
        `)
        .eq('project_id', projectIdNum)
        .or(`created_at.lt.${oldest.created_at},and(created_at.eq.${oldest.created_at},id.lt.${oldest.id})`)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(50)

      if (!error && data) {
        if (data.length < 50) {
          setHasMoreOlder(false)
        }
        const formatted = [...data].reverse().map((r) => formatDbMessage(r, project.creator_id))
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id))
          const uniqueOlder = formatted.filter((m) => !existingIds.has(m.id))
          return [...uniqueOlder, ...prev]
        })
      }
    } catch (err) {
      console.error('Failed to load older messages:', err)
    } finally {
      setLoadingOlder(false)
    }
  }, [loadingOlder, messages, project, projectIdNum])

  // 5. Send Message Handler with Revocation Gating
  const handleSendMessage = useCallback(
    async (bodyText) => {
      if (!user?.id || !isValidProjectId || !project) return false
      setIsSending(true)
      setSendError(null)

      try {
        const { data, error } = await supabase
          .from('project_chat_messages')
          .insert({
            project_id: projectIdNum,
            sender_id: user.id,
            body: bodyText,
          })
          .select(`
            id,
            project_id,
            sender_id,
            body,
            created_at,
            sender:profiles!sender_id(id, name, profile_photo_url, role)
          `)
          .single()

        if (error) {
          // Check if insert was denied due to revoked membership
          const { data: canAccess, error: accessErr } = await supabase.rpc('can_access_project_chat', {
            p_project_id: projectIdNum,
          })
          if (!accessErr && canAccess === false) {
            setAuthorized(false)
            return false
          }
          throw error
        }

        if (data) {
          const formatted = formatDbMessage(data, project.creator_id)
          setMessages((prev) => {
            if (prev.some((m) => m.id === formatted.id)) return prev
            return [...prev, formatted]
          })
        }

        return true
      } catch (err) {
        console.error('Error sending message:', err)
        setSendError(err.message || 'Failed to send message. Please try again.')
        return false
      } finally {
        setIsSending(false)
      }
    },
    [user?.id, isValidProjectId, project, projectIdNum]
  )

  // ── Render: Auth Checking State ──
  if (authLoading || authChecking) {
    return (
      <div className="h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-center p-6">
        <svg className="w-10 h-10 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-sm text-white/60 font-medium">Verifying crew room access...</p>
      </div>
    )
  }

  // ── Render: Unauthorized / Invalid Access Denied State ──
  if (!authorized) {
    return (
      <div className="h-screen w-full bg-[#000000] text-white flex flex-col">
        {/* Header */}
        <header className="h-16 shrink-0 bg-[#0C0C10] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span>Back</span>
          </button>
          <span className="font-['Bebas_Neue',_sans-serif] text-xl tracking-wider text-purple-light">
            FrameWork Team Chat
          </span>
          <div className="w-16" />
        </header>

        {/* Access Denied Body */}
        <div className="flex-1 flex items-center justify-center p-6 bg-radial-at-c from-[#151226] via-[#08080C] to-[#000000]">
          <div className="max-w-md w-full p-6 sm:p-8 bg-[#111116] border border-white/[0.1] rounded-3xl text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6239BF]/20 border border-[#6239BF]/40 flex items-center justify-center text-purple-light shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <div>
              <h2 className="font-['Bebas_Neue',_sans-serif] text-2xl sm:text-3xl text-white tracking-wide">
                Crew Room Restricted
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-2 leading-relaxed">
                This production team chat is private and accessible only to the project creator and officially accepted crew collaborators.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              {isValidProjectId && (
                <Link
                  to={`/project/${projectIdNum}`}
                  className="px-5 py-2.5 bg-purple text-white text-xs font-semibold rounded-xl hover:bg-purple-dark transition-colors shadow-md text-center"
                >
                  View Project
                </Link>
              )}
              <Link
                to="/my-projects"
                className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors text-center"
              >
                My Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Render: Authorized Active Team Chat ──
  return (
    <div className="h-screen w-full bg-[#000000] text-white flex flex-col overflow-hidden">
      {/* ── Top Header with Real Member Count and Avatars ── */}
      <ChatHeader
        projectTitle={projectTitle}
        members={members}
        isMembersOpen={isMembersOpen}
        onToggleMembers={() => setIsMembersOpen((prev) => !prev)}
        onBack={handleBack}
      />

      {/* ── Main Chat Body: Messages Area (Left) + Members Sidebar (Right) ── */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Main Message Panel */}
        <main className="flex-1 flex flex-col min-w-0 h-full bg-[#000000]">
          <ChatMessageList
            messages={messages}
            loading={loadingHistory}
            hasMoreOlder={hasMoreOlder}
            loadingOlder={loadingOlder}
            onLoadOlder={handleLoadOlder}
          />

          <ChatComposer
            onSendMessage={handleSendMessage}
            isSending={isSending}
            errorMessage={sendError}
            placeholder={`Message #${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'general'}...`}
          />
        </main>

        {/* Real Members Sidebar */}
        <ChatMembersSidebar
          members={members}
          isOpen={isMembersOpen}
          onClose={() => setIsMembersOpen(false)}
        />
      </div>
    </div>
  )
}
