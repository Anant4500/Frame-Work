import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import { CHAT_PAGE_SIZE, CHAT_MESSAGE_SELECT, parseChatProjectId, mergeChatMessages, chatCursorFilter, formatChatMember, fetchChatAfter } from '../utils/chatMessages'
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
  const { user } = useAuth()
  // A route/account change resets the room, requests, and composer together.
  return <TeamChatRoom key={`${id}:${user?.id || 'anonymous'}`} />
}

function TeamChatRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const projectIdNum = parseChatProjectId(id)
  const isValidProjectId = projectIdNum !== null
  const [projectTitle, setProjectTitle] = useState('Team Production Room')
  const [authChecking, setAuthChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [accessError, setAccessError] = useState(null)
  const [chatError, setChatError] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [hasMoreOlder, setHasMoreOlder] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [isMembersOpen, setIsMembersOpen] = useState(() => window.innerWidth >= 1024)
  const roomRef = useRef(null)
  usePageTitle(`${projectTitle} Team Chat | FrameWork`)

  const handleBack = useCallback(() => {
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(isValidProjectId ? `/project/${projectIdNum}` : '/my-projects')
  }, [navigate, isValidProjectId, projectIdNum])

  useEffect(() => {
    if (authLoading) return
    if (!user?.id) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
      return
    }
    if (!isValidProjectId) {
      setAuthChecking(false)
      return
    }
    const room = { active: true, allowed: false, rows: [], project: null, sending: false, older: false }
    roomRef.current = room
    let channel
    let syncing = false
    let syncAgain = false
    let historyLoaded = false
    const query = () => supabase.from('project_chat_messages').select(CHAT_MESSAGE_SELECT).eq('project_id', projectIdNum)
    room.query = query
    room.merge = (rows) => {
      if (!room.active || !room.allowed) return
      room.rows = mergeChatMessages(room.rows, rows.map(row => formatDbMessage(row, room.project.creator_id)))
      setMessages(room.rows)
    }
    room.checkAccess = async () => {
      const { data, error } = await supabase.rpc('can_access_project_chat', { p_project_id: projectIdNum })
      if (!room.active) return false
      if (error) throw error
      room.allowed = data === true
      setAuthorized(room.allowed)
      if (!room.allowed) {
        setAccessError(null)
        room.rows = []
        historyLoaded = false
        setMessages([])
        setMembers([])
        if (channel) {
          void supabase.removeChannel(channel)
          channel = null
        }
      }
      return room.allowed
    }
    // Serialize history/reconnect queries and repeat for notifications received in flight.
    const sync = async () => {
      if (!room.active) return
      if (syncing) { syncAgain = true; return }
      syncing = true
      try {
        do {
          syncAgain = false
          if (!await room.checkAccess()) return
          if (!room.project) {
            const { data, error } = await supabase.from('projects').select('id, title, creator_id').eq('id', projectIdNum).single()
            if (!room.active) return
            if (error) throw error
            room.project = data
            setProjectTitle(data.title || 'Team Production Room')
          }
          setAccessError(null)
          setAuthChecking(false)
          const { data: roster, error: rosterError } = await supabase.rpc('get_project_chat_members', { p_project_id: projectIdNum })
          if (!room.active) return
          if (rosterError) throw rosterError
          setMembers((roster || []).map(formatChatMember))
          if (!historyLoaded) {
            const { data, error } = await query().order('created_at', { ascending: false }).order('id', { ascending: false }).limit(CHAT_PAGE_SIZE)
            if (!room.active) return
            if (error) throw error
            room.merge(data || [])
            room.recoveryStart = data?.[data.length - 1] || null
            setHasMoreOlder((data || []).length > 0)
            historyLoaded = true
          } else {
            // Replay the loaded window so an out-of-order notification cannot skip a gap.
            const rows = await fetchChatAfter(cursor => {
              let request = query().order('created_at', { ascending: true }).order('id', { ascending: true }).limit(CHAT_PAGE_SIZE)
              if (cursor) request = request.or(chatCursorFilter(cursor, 'newer'))
              return request
            }, room.recoveryStart, () => room.active && room.allowed)
            room.merge(rows)
          }
          if (!room.active) return
          setChatError(null)
          setLoadingHistory(false)
          if (!channel) {
            channel = supabase.channel(`project:${projectIdNum}:chat`, { config: { private: true } })
              .on('broadcast', { event: 'new_message' }, async ({ payload }) => {
                if (String(payload?.project_id) !== projectIdNum || !payload?.id) return
                try {
                  // Fetch the notified ID even if its transaction timestamp predates history.
                  // Both project scope and message access are enforced by Postgres RLS.
                  const { data, error } = await query().eq('id', payload.id).maybeSingle()
                  if (!room.active) return
                  if (error) throw error
                  if (data) room.merge([data])
                } catch {
                  if (room.active) setChatError('Message sync interrupted. Retrying automatically.')
                } finally {
                  if (room.active) void sync()
                }
              })
              .subscribe(status => {
                if (!room.active) return
                if (status === 'SUBSCRIBED') void sync()
                else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                  setChatError('Live connection interrupted. Retrying message sync automatically.')
                }
              })
          }
        } while (syncAgain && room.active)
      } catch {
        if (room.active) {
          if (!room.project) setAccessError('Unable to verify crew room access. Check your connection and retry.')
          else setChatError('Unable to load or sync chat. Check your connection and retry.')
        }
      } finally {
        syncing = false
        if (room.active) {
          setAuthChecking(false)
          setLoadingHistory(false)
        }
      }
    }
    room.sync = sync
    void sync()
    // Revalidate quiet rooms too, and recover transient notification fetch failures.
    const timer = window.setInterval(sync, 30000)
    window.addEventListener('online', sync)
    window.addEventListener('focus', sync)
    return () => {
      room.active = false
      window.clearInterval(timer)
      window.removeEventListener('online', sync)
      window.removeEventListener('focus', sync)
      if (channel) void supabase.removeChannel(channel)
    }
  }, [user?.id, authLoading, isValidProjectId, projectIdNum, navigate, location.pathname])

  const handleLoadOlder = async () => {
    const room = roomRef.current
    if (!room?.active || !room.allowed || room.older || !room.rows.length) return
    room.older = true
    setLoadingOlder(true)
    try {
      const { data, error } = await room.query().or(chatCursorFilter(room.rows[0], 'older'))
        .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(CHAT_PAGE_SIZE)
      if (!room.active) return
      if (error) throw error
      room.merge(data || [])
      setHasMoreOlder((data || []).length > 0)
      setChatError(null)
    } catch {
      if (room.active) setChatError('Unable to load older messages. Please try again.')
    } finally {
      room.older = false
      if (room.active) setLoadingOlder(false)
    }
  }

  const handleSendMessage = async (bodyText) => {
    const room = roomRef.current
    if (!room?.active || !room.allowed || !room.project || room.sending) return false
    room.sending = true
    setIsSending(true)
    setSendError(null)
    try {
      const { data, error } = await supabase.from('project_chat_messages')
        .insert({ project_id: projectIdNum, sender_id: user.id, body: bodyText })
        .select(CHAT_MESSAGE_SELECT).single()
      if (!room.active) return false
      if (error || !data) {
        await room.checkAccess()
        throw error || new Error('No persisted message returned')
      }
      room.merge([data])
      return true
    } catch {
      if (room.active) setSendError('Unable to confirm sending. Your text has been kept; check the conversation before retrying.')
      return false
    } finally {
      room.sending = false
      if (room.active) setIsSending(false)
    }
  }

  if (accessError) {
    return <div role="alert" className="h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <p>{accessError}</p>
      <button onClick={() => roomRef.current?.sync()} className="text-purple-light">Retry</button>
      <button onClick={handleBack}>Back</button>
    </div>
  }

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
          {chatError && <div role="alert" className="p-3 text-sm text-red-400">
            {chatError} <button className="underline" onClick={() => roomRef.current?.sync()}>Retry sync</button>
          </div>}
          <ChatMessageList
            messages={messages}
            loading={loadingHistory}
            error={chatError}
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
