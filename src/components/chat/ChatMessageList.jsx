import { useLayoutEffect, useRef } from 'react'

function formatMessageTime(isoString) {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function getMessageDateKey(isoString) {
  if (!isoString) return 'Today'
  try {
    const d = new Date(isoString)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return 'Today'
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  } catch {
    return 'Today'
  }
}

export default function ChatMessageList({
  messages = [],
  loading = false,
  error = null,
  hasMoreOlder = false,
  loadingOlder = false,
  onLoadOlder,
}) {
  const bottomRef = useRef(null)
  const listRef = useRef(null)
  const previousRef = useRef(null)

  // Preserve the viewport when older rows are prepended.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const previous = previousRef.current
    const first = messages[0]?.id
    const last = messages[messages.length - 1]?.id
    if (previous && first !== previous.first && last === previous.last) {
      list.scrollTop += list.scrollHeight - previous.height
    } else if (!loadingOlder && last !== previous?.last) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    previousRef.current = { first, last, height: list.scrollHeight }
  }, [messages, loadingOlder, loading])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-white/50 bg-[#000000]">
        <svg className="w-8 h-8 text-purple animate-spin mb-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
        <p className="text-xs text-white/40">Loading messages...</p>
      </div>
    )
  }

  if (messages.length === 0 && error) {
    return <div className="flex-1 bg-black" />
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/50 bg-[#000000]">
        <div className="w-12 h-12 rounded-2xl bg-purple/10 border border-purple/20 flex items-center justify-center text-purple-light mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.774-.75 4.968 4.968 0 01.996-2.908c-.767-1.127-1.132-2.385-1.132-3.812 0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        </div>
        <p className="text-white/80 font-medium text-sm mb-1">No messages yet</p>
        <p className="text-xs text-white/40 max-w-xs">Start the conversation with your production team.</p>
      </div>
    )
  }

  // Group messages by date
  return (
    <div ref={listRef} style={{ overflowAnchor: 'none' }} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 bg-[#000000]">
      {/* ── Optional Load Older Messages Button ── */}
      {hasMoreOlder && (
        <div className="flex justify-center pb-2">
          <button
            type="button"
            onClick={onLoadOlder}
            disabled={loadingOlder}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-purple-light bg-purple/10 hover:bg-purple/20 border border-purple/25 transition-all disabled:opacity-50"
          >
            {loadingOlder ? 'Loading older messages...' : 'Load older messages'}
          </button>
        </div>
      )}
      {messages.map((message, idx) => {
        const dateKey = getMessageDateKey(message.created_at)
        const prevMsg = idx > 0 ? messages[idx - 1] : null
        const showDateSeparator = !prevMsg || getMessageDateKey(prevMsg.created_at) !== dateKey

        const senderName = message.sender_name || message.sender?.name || 'Crew Member'
        const senderAvatar = message.sender_avatar || message.sender?.profile_photo_url || null
        const senderRole = message.sender?.role || (message.isCreator ? 'Creator' : null)
        const timeFormatted = formatMessageTime(message.created_at)

        return (
          <div key={message.id}>
            {/* ── Day Separator ── */}
            {showDateSeparator && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-white/[0.08]" />
                <span className="text-[11px] font-semibold tracking-wider text-white/40 uppercase px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
                  {dateKey}
                </span>
                <div className="flex-1 h-px bg-white/[0.08]" />
              </div>
            )}

            {/* ── Message Row ── */}
            <div className="group relative flex items-start gap-3 sm:gap-3.5 p-2 sm:p-2.5 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors">
              {/* Sender Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#6239BF]/20 border border-[#6239BF]/40 flex items-center justify-center shrink-0 overflow-hidden text-purple-light text-xs sm:text-sm font-bold shadow-sm">
                {senderAvatar ? (
                  <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {senderName
                      ? senderName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : 'U'}
                  </span>
                )}
              </div>

              {/* Message Content Area */}
              <div className="flex-1 min-w-0">
                {/* Header: Sender Name + Role Badge + Time */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-white/90 hover:text-purple-light transition-colors">
                    {senderName}
                  </span>

                  {senderRole && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                        message.isCreator || senderRole === 'CREATOR' || senderRole === 'Creator'
                          ? 'bg-[#6239BF]/25 text-purple-light border border-[#6239BF]/40'
                          : 'bg-white/[0.06] text-white/60 border border-white/[0.08]'
                      }`}
                    >
                      {senderRole}
                    </span>
                  )}

                  <span className="text-[11px] text-white/40 ml-0.5">
                    {timeFormatted}
                  </span>
                </div>

                {/* Message Body (safe plain text rendering) */}
                <p className="text-sm text-white/85 leading-relaxed break-words whitespace-pre-wrap selection:bg-purple/30 selection:text-white">
                  {message.body || message.content}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      <div ref={bottomRef} />
    </div>
  )
}
