import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/* ── Static illustrative data ── */
const ROLES = [
  { name: 'Actor', initials: 'AK' },
  { name: 'Cinematographer', initials: 'RM' },
  { name: 'Editor', initials: 'SP' },
]

const STEPS = [
  { key: 'idea', label: 'Idea', heading: 'Create the Project', sub: 'Turn your film idea into an open production.' },
  { key: 'crew', label: 'Crew', heading: 'Find Your Crew', sub: 'Open roles connect your project with the right collaborators.' },
  { key: 'collab', label: 'Collaborate', heading: 'Build the Team', sub: 'Review applications and bring the right people into the production.' },
  { key: 'credit', label: 'Credit', heading: 'Turn Work Into Credit', sub: 'When the film is complete, the collaboration becomes part of your FrameWork profile.' },
]

/* ── Reduced motion query ── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

/* ── Transition helpers ── */
const quick = (reduced) => reduced ? { duration: 0 } : { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }
const stagger = (i, reduced) => reduced ? { duration: 0 } : { duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.08 * i }

export default function HeroJourney() {
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const reduced = useReducedMotion()
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const go = useCallback((next) => {
    if (transitioning) return
    const clamped = Math.max(0, Math.min(3, next))
    if (clamped === step) return
    setTransitioning(true)
    setStep(clamped)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setTransitioning(false), reduced ? 50 : 500)
  }, [step, transitioning, reduced])

  const nextStep = () => step === 3 ? go(0) : go(step + 1)
  const prevStep = () => go(step - 1)

  /* Keyboard support — only when journey area focused */
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextStep() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep() }
  }

  const showRoles = step >= 1
  const showAvatars = step >= 2
  const isCompleted = step === 3

  return (
    <div
      className="relative w-full flex flex-col items-center justify-center select-none outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0A0A0F] rounded-2xl p-1"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="How FrameWork Works interactive journey"
    >
      {/* ── Label & Step Counter ── */}
      <div className="w-full flex items-center justify-between mb-4 sm:mb-5 px-1">
        <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-white/40">
          From Idea to Credit
        </span>
        <span className="text-[11px] sm:text-xs font-semibold text-white/55 tabular-nums">
          {String(step + 1).padStart(2, '0')} / 04
        </span>
      </div>

      {/* ── Progress Steps ── */}
      <div className="flex items-center gap-1 mb-4 sm:mb-5 w-full">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => go(i)}
            aria-label={`Go to step ${i + 1}: ${s.label}`}
            className="flex-1 group flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] rounded-lg p-0.5"
          >
            <div className={`w-full h-[3px] rounded-full transition-all duration-400 ${
              i <= step ? 'bg-[#6239BF]' : 'bg-white/10'
            } ${i === step ? 'shadow-[0_0_8px_rgba(98,57,191,0.4)]' : ''}`} />
            <span className={`text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold transition-colors duration-300 ${
              i === step ? 'text-purple-light' : i < step ? 'text-white/35' : 'text-white/20'
            }`}>
              {s.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Reserved Copy Area (Prevents Layout Shift) ── */}
      <div className="w-full relative h-[76px] sm:h-[82px] mb-3 sm:mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={STEPS[step].key}
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -6 }}
            transition={quick(reduced)}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-1"
          >
            <p className="font-['Bebas_Neue',_sans-serif] text-2xl sm:text-3xl font-normal text-white mb-1 leading-none tracking-wide">
              {STEPS[step].heading}
            </p>
            <p className="text-xs sm:text-[13px] text-white/50 leading-relaxed max-w-[360px] mx-auto">
              {STEPS[step].sub}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Visual Stage (Fixed Reserved Height & Stage-Relative Positioning) ── */}
      <div className="relative w-full h-[280px] sm:h-[290px]">
        {/* Connector lines (steps 1 & 2: CREW and COLLABORATE only) */}
        <AnimatePresence>
          {showRoles && !isCompleted && (
            <motion.svg
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={quick(reduced)}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              aria-hidden="true"
            >
              {/* Actor connector (diagonal to upper-right, terminates at card edge) */}
              <motion.line
                x1="68%" y1="30%" x2="76%" y2="20%"
                stroke="rgba(139,92,246,0.45)"
                strokeWidth="1.25"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={stagger(0, reduced)}
              />
              {/* Left connector (to Cinematographer, terminates at card edge) */}
              <motion.line
                x1="30%" y1="53%" x2="22%" y2="53%"
                stroke="rgba(139,92,246,0.45)"
                strokeWidth="1.25"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={stagger(1, reduced)}
              />
              {/* Right connector (to Editor, terminates at card edge) */}
              <motion.line
                x1="70%" y1="53%" x2="78%" y2="53%"
                stroke="rgba(139,92,246,0.45)"
                strokeWidth="1.25"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={stagger(2, reduced)}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* ── Central Project Card ── */}
        <div
          className={`absolute top-[53%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-xl border p-3.5 sm:p-4 w-[175px] sm:w-[185px] transition-colors duration-400 ${
            isCompleted
              ? 'bg-[#111118] border-emerald-500/30 shadow-[0_0_24px_rgba(16,185,129,0.08)]'
              : 'bg-[#111118] border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
          }`}
        >
          {/* Status chip */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider rounded-full border ${
                isCompleted
                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'border-[#6239BF]/35 text-purple-light bg-[#6239BF]/15'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-[#6239BF] animate-pulse'}`} />
              {isCompleted ? 'COMPLETED' : 'OPEN'}
            </span>
            <span className="text-[9px] text-white/30 font-medium">Drama</span>
          </div>

          {/* Title */}
          <p className="font-['Bebas_Neue',_sans-serif] text-lg sm:text-xl font-normal text-white leading-tight mb-1 tracking-wide">
            AFTERLIGHT
          </p>
          <p className="text-[10px] text-white/40 mb-2.5">Pune</p>

          {/* Roles needed / Crew count */}
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="credit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={quick(reduced)}
                className="border-t border-white/[0.06] pt-2"
              >
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-emerald-400/80 mb-0.5">Your Credit</p>
                <p className="text-[12px] font-semibold text-white">Cinematographer</p>
              </motion.div>
            ) : (
              <motion.div
                key="roles"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={quick(reduced)}
                className="border-t border-white/[0.06] pt-2"
              >
                <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-white/35 mb-1">
                  {showAvatars ? `${ROLES.filter((_, i) => i < 2).length} of ${ROLES.length} joined` : `${ROLES.length} roles needed`}
                </p>
                <div className="flex flex-wrap gap-1">
                  {ROLES.map((r) => (
                    <span key={r.name} className="text-[10px] text-white/50 px-1.5 py-0.5 rounded-md border border-white/[0.08] bg-white/[0.02]">
                      {r.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Role Nodes ── */}
        <AnimatePresence>
          {showRoles && ROLES.map((role, i) => {
            const accepted = showAvatars && i < 2
            const positions = [
              'absolute top-2 sm:top-3 right-3 sm:right-6 z-20',          // Actor: upper-right, well-spaced and balanced
              'absolute top-[53%] left-0 sm:left-1 -translate-y-1/2 z-20', // Cinematographer: left-middle
              'absolute top-[53%] right-0 sm:right-1 -translate-y-1/2 z-20', // Editor: right-middle
            ]
            return (
              <motion.div
                key={role.name}
                initial={{ opacity: 0, scale: reduced ? 1 : 0.7 }}
                animate={{ opacity: isCompleted ? 0 : 1, scale: isCompleted ? (reduced ? 1 : 0.5) : 1 }}
                exit={{ opacity: 0, scale: reduced ? 1 : 0.5 }}
                transition={stagger(i, reduced)}
                className={positions[i]}
              >
                <div className={`rounded-lg border px-2.5 sm:px-3 py-1.5 sm:py-2 text-center transition-colors duration-400 min-w-[90px] sm:min-w-[100px] ${
                  accepted
                    ? 'bg-[#111118] border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.06)]'
                    : 'bg-[#111118] border-white/[0.12]'
                }`}>
                  {/* Avatar row */}
                  {showAvatars && (
                    <motion.div
                      initial={{ opacity: 0, y: reduced ? 0 : 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={stagger(i + 1, reduced)}
                      className="flex items-center justify-center gap-1.5 mb-1"
                    >
                      {accepted ? (
                        <>
                          <div className="w-5 h-5 rounded-full bg-[#6239BF]/20 border border-[#6239BF]/30 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-purple-light">{role.initials}</span>
                          </div>
                          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                          <span className="text-[8px] text-white/30">?</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                  <p className="text-[10px] sm:text-[11px] font-semibold text-white/80 leading-tight">{role.name}</p>
                  <p className={`text-[8px] sm:text-[9px] font-semibold tracking-wider uppercase mt-0.5 ${
                    accepted ? 'text-emerald-400' : 'text-purple-light/60'
                  }`}>
                    {accepted ? 'Joined' : 'Open'}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* ── Step 4 Addendum (Anchored inside stage so it never shifts controls) ── */}
        <AnimatePresence>
          {isCompleted && (
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={quick(reduced)}
              className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-[11px] text-emerald-400/70 font-medium text-center z-10"
            >
              ✓ Added to your FrameWork profile
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center justify-between w-full mt-4 sm:mt-5 px-1">
        {/* Previous */}
        <button
          onClick={prevStep}
          disabled={step === 0}
          aria-label="Previous step"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
            step === 0
              ? 'border-white/5 text-white/15 cursor-not-allowed'
              : 'border-white/15 text-white/60 hover:border-[#6239BF]/50 hover:text-white hover:bg-[#6239BF]/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Step dots — mobile-friendly compact indicator */}
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step ? 'w-5 h-1.5 bg-[#6239BF]' : 'w-1.5 h-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Next / Replay */}
        <button
          onClick={nextStep}
          aria-label={step === 3 ? 'Replay journey' : 'Next step'}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-white/15 text-white/60 hover:border-[#6239BF]/50 hover:text-white hover:bg-[#6239BF]/10 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
        >
          {step === 3 ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
