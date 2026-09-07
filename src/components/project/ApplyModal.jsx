import { useEffect, useRef } from 'react'

export default function ApplyModal({
  isOpen,
  onClose,
  role,
  projectTitle,
  message,
  onMessageChange,
  onSubmit,
  isSubmitting = false,
}) {
  const modalRef = useRef(null)
  const textareaRef = useRef(null)
  const previouslyFocusedElementRef = useRef(null)

  // Track and restore focus
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement
      // Move focus inside dialog to primary input
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === 'function') {
        previouslyFocusedElementRef.current.focus()
      }
    }
  }, [isOpen])

  // Focus trap & Escape key dismissal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!isSubmitting) {
          onClose()
        }
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        aria-describedby="apply-modal-desc"
        className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_16px_64px_rgba(0,0,0,0.6)] animate-fade-in-up"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Close application dialog"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 id="apply-modal-title" className="text-xl font-bold text-white mb-1">
          Apply as {role}
        </h3>
        <p id="apply-modal-desc" className="text-white/50 text-sm mb-6">
          for {projectTitle}
        </p>

        <label htmlFor="apply-message-input" className="block text-sm font-medium text-white/70 mb-2">
          Your Message *
        </label>
        <textarea
          id="apply-message-input"
          ref={textareaRef}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Tell the creator why you're a great fit for this role..."
          rows={4}
          maxLength={500}
          className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all duration-300 focus:border-purple/60 focus:shadow-[0_0_15px_rgba(98,57,191,0.1)] resize-none mb-1 focus-visible:ring-2 focus-visible:ring-purple/50"
        />
        <p className="text-white/50 text-xs text-right mb-6">{message.length}/500</p>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-purple text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-purple-dark hover:shadow-[0_0_30px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]"
        >
          {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
