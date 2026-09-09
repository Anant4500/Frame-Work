import { useState } from 'react'

export default function PinnedMessageBanner({ pinnedItem }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!pinnedItem) return null

  return (
    <div className="shrink-0 bg-[#6239BF]/10 border-b border-[#6239BF]/25 transition-all duration-200">
      <div className="px-3 sm:px-5 py-2 flex items-center justify-between gap-3 text-xs">
        {/* Left: Pin Icon + Summary Text */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-[#6239BF]/25 flex items-center justify-center shrink-0 text-purple-light" aria-hidden="true">
            <svg className="w-3.5 h-3.5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>

          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-white/95 truncate">
              {pinnedItem.title || 'Pinned Announcement'}
            </span>
            <span className="text-white/40 hidden xs:inline">—</span>
            <span className="text-purple-light/90 truncate">
              {pinnedItem.author} pinned a message
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/50">{pinnedItem.timeAgo || 'Recently'}</span>
          </div>
        </div>

        {/* Right: Expand / Collapse Button */}
        {pinnedItem.details && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold text-purple-light hover:text-white bg-[#6239BF]/20 hover:bg-[#6239BF]/30 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-light"
          >
            <span>{isExpanded ? 'Hide' : 'Details'}</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && pinnedItem.details && (
        <div className="px-4 sm:px-6 pb-2.5 pt-1 text-xs text-white/80 bg-black/20 border-t border-[#6239BF]/15 flex items-start gap-2">
          <p className="leading-relaxed">{pinnedItem.details}</p>
        </div>
      )}
    </div>
  )
}
