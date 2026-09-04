import React from 'react'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const InteractiveHoverButton = React.forwardRef(
  (
    {
      text = 'View Project',
      className = '',
      as = 'div',
      children,
      ...props
    },
    ref
  ) => {
    const label = children || text
    const Comp = as || 'div'

    return (
      <Comp
        ref={ref}
        className={cn(
          'group/btn relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04] py-2.5 px-4 text-xs font-semibold text-white transition-colors duration-300 hover:border-[#6239BF]/50 hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]',
          className
        )}
        {...props}
      >
        {/* Purple fill layer — grows from 0 to full inset on hover */}
        <div
          className="absolute inset-0 z-0 rounded-full bg-[#6239BF] opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100 group-hover:opacity-100"
        />

        {/* Default state: dot + text — slides out on hover */}
        <div className="relative z-10 flex items-center justify-center gap-2 transition-all duration-300 group-hover/btn:translate-x-10 group-hover/btn:opacity-0 group-hover:translate-x-10 group-hover:opacity-0">
          <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#6239BF]" />
          <span>{label}</span>
        </div>

        {/* Hover state: text + arrow — slides in from left on hover */}
        <div className="absolute inset-0 z-10 flex h-full w-full -translate-x-10 items-center justify-center gap-1.5 text-white opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 group-hover:translate-x-0 group-hover:opacity-100">
          <span>{label}</span>
          <svg
            className="h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </div>
      </Comp>
    )
  }
)

InteractiveHoverButton.displayName = 'InteractiveHoverButton'

export { InteractiveHoverButton }
export default InteractiveHoverButton
