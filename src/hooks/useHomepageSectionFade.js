import { useEffect } from 'react'

/**
 * Custom hook for smooth scroll-based section fade transitions.
 * Calculates opacity based on viewport position using requestAnimationFrame.
 *
 * @param {Array<React.RefObject<HTMLElement>>} sectionRefs - Array of refs for each section wrapper
 */
export function useHomepageSectionFade(sectionRefs) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const resetOpacities = () => {
      sectionRefs.forEach((ref) => {
        if (ref.current) {
          ref.current.style.opacity = ''
        }
      })
    }

    // If reduced motion is preferred, keep all sections fully visible
    if (mediaQuery.matches) {
      resetOpacities()
      return
    }

    const MIN_OPACITY = 0.2
    let ticking = false
    let animationFrameId = null

    const updateOpacities = () => {
      const vh = window.innerHeight
      const fadeDistance = Math.min(vh * 0.35, 300)

      sectionRefs.forEach((ref) => {
        const el = ref.current
        if (!el) return

        const rect = el.getBoundingClientRect()

        // Section is completely outside the viewport
        if (rect.bottom <= 0 || rect.top >= vh) {
          el.style.opacity = '0'
          return
        }

        // Section leaving through top of viewport
        const topProgress = Math.max(0, Math.min(1, rect.bottom / fadeDistance))
        // Section entering through bottom of viewport
        const bottomProgress = Math.max(0, Math.min(1, (vh - rect.top) / fadeDistance))

        // Combined visibility factor
        const rawFactor = Math.min(topProgress, bottomProgress)
        // Smoothstep cubic easing S-curve
        const smoothFactor = rawFactor * rawFactor * (3 - 2 * rawFactor)

        // Restrained opacity range [0.20, 1.0] while in viewport
        const opacity = MIN_OPACITY + (1 - MIN_OPACITY) * smoothFactor
        el.style.opacity = opacity.toFixed(3)
      })
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        animationFrameId = requestAnimationFrame(() => {
          updateOpacities()
          ticking = false
        })
      }
    }

    // Initial calculation on mount
    updateOpacities()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    const handleMotionChange = (e) => {
      if (e.matches) {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        resetOpacities()
      } else {
        updateOpacities()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll, { passive: true })
      }
    }

    mediaQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      mediaQuery.removeEventListener('change', handleMotionChange)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      resetOpacities()
    }
  }, [sectionRefs])
}
