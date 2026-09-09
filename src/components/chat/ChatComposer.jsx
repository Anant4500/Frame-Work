import { useState, useRef, useEffect } from 'react'

export default function ChatComposer({
  onSendMessage,
  placeholder = 'Message team...',
  isSending = false,
  errorMessage = null,
}) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [text])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || isSending || trimmed.length > 2000) return
    
    try {
      const ok = await onSendMessage(trimmed)
      // Only clear if onSendMessage returned true (or void/truthy)
      if (ok !== false) {
        setText('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.focus()
        }
      }
    } catch {
      // Keep unsent text on failure
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isOverLimit = text.length > 2000
  const canSend = text.trim().length > 0 && !isSending && !isOverLimit

  return (
    <div className="shrink-0 bg-[#0A0A0E] border-t border-white/[0.08] p-3 sm:p-4">
      {/* ── Input Box Outer ── */}
      <div className="bg-[#131318] border border-white/[0.1] focus-within:border-[#6239BF] focus-within:ring-1 focus-within:ring-[#6239BF] rounded-2xl p-2 sm:p-2.5 transition-all shadow-inner relative">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={2000}
          value={text}
          disabled={isSending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder-white/40 resize-none outline-none px-2 py-1 max-h-28 overflow-y-auto leading-relaxed disabled:opacity-50"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/[0.04] mt-1">
          {/* Left Action Buttons: Attachment, @ Mention, Emoji (Disabled for MVP) */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-white/30">
            {/* Attachment Button */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Attachments coming soon"
              title="Attachments coming soon"
              className="p-1.5 rounded-lg text-white/25 cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.37l-10.94 10.94a1.5 1.5 0 01-2.122-2.122l7.693-7.693" />
              </svg>
            </button>

            {/* @ Mention Button */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Mentions coming soon"
              title="Mentions coming soon"
              className="p-1.5 rounded-lg text-white/25 cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />
              </svg>
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Emoji reactions coming soon"
              title="Emoji reactions coming soon"
              className="p-1.5 rounded-lg text-white/25 cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" />
              </svg>
            </button>
          </div>

          {/* Right: Character count + Send Button */}
          <div className="flex items-center gap-2">
            {text.length > 1800 && (
              <span className={`text-[11px] font-mono ${isOverLimit ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                {text.length}/2000
              </span>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label={isSending ? 'Sending message...' : 'Send message'}
              className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] ${
                canSend
                  ? 'bg-[#6239BF] text-white hover:bg-[#7C3AED] hover:shadow-[0_0_16px_rgba(98,57,191,0.5)] active:scale-95'
                  : 'bg-white/[0.05] text-white/30 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span className="hidden xs:inline">Send</span>
                  <svg className="w-3.5 h-3.5 rotate-45 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Status / Error Feedback (No fake typing indicator) ── */}
      {errorMessage && (
        <div className="mt-1.5 px-1 flex items-center gap-1.5 text-[11px] text-red-400 animate-fade-in">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
