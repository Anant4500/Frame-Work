import React from 'react'

const cn = (...classes) => classes.filter(Boolean).join(' ')

const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#6239BF",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = props.href ? 'a' : 'button'

    return (
      <Comp
        style={{
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        }}
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 active:translate-y-px",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* Spark container */}
        <div
          className={cn(
            "-z-30 blur-[2px]",
            "absolute inset-0 overflow-visible [container-type:size]",
          )}
        >
          {/* Spark slide */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* Spark rotate */}
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>

        {/* Highlight / Inner shadow */}
        <div
          className={cn(
            "absolute inset-0 size-full pointer-events-none",
            "[border-radius:var(--radius)] px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#6239bf3f]",
            "group-active:shadow-[inset_0_-10px_10px_#6239bf3f]",
          )}
        />

        {/* Backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </Comp>
    )
  },
)

ShimmerButton.displayName = "ShimmerButton"

export { ShimmerButton }
export default ShimmerButton
