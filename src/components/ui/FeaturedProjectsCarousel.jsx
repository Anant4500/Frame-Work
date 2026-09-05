import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'

function useResponsiveDimensions() {
  const [dims, setDims] = useState(() => getDims(typeof window !== 'undefined' ? window.innerWidth : 1200))

  useEffect(() => {
    const handleResize = () => {
      setDims(getDims(window.innerWidth))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dims
}

function getDims(width) {
  if (width < 640) {
    // Mobile
    return {
      cardWidth: 210,
      cardHeight: 310,
      stepX: 90,
      dropY: 18,
      rotateDeg: 5,
      scaleStep: 0.08,
      dragDistance: 170,
    }
  }
  if (width < 1024) {
    // Tablet
    return {
      cardWidth: 250,
      cardHeight: 360,
      stepX: 135,
      dropY: 26,
      rotateDeg: 7,
      scaleStep: 0.09,
      dragDistance: 210,
    }
  }
  // Desktop
  return {
    cardWidth: 280,
    cardHeight: 410,
    stepX: 170,
    dropY: 34,
    rotateDeg: 9,
    scaleStep: 0.10,
    dragDistance: 240,
  }
}

// Compact roles helper: max 2 named roles + "+N more"
function formatRoles(roles) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) return null
  const named = roles.slice(0, 2)
  const remaining = roles.length - named.length
  let text = named.join(' • ')
  if (remaining > 0) {
    text += ` • +${remaining} ${remaining === 1 ? 'role' : 'roles'}`
  }
  return text
}

function CarouselCard({ project, index, totalProjects, scrollProgress, dims, onCardClick, isActive }) {
  const offset = useTransform(scrollProgress, (p) => {
    if (totalProjects <= 1) return 0
    const normP = ((p % totalProjects) + totalProjects) % totalProjects
    let diff = index - normP
    if (diff > totalProjects / 2) diff -= totalProjects
    if (diff < -totalProjects / 2) diff += totalProjects
    return diff
  })

  const x = useTransform(offset, (val) => {
    if (Math.abs(val) <= 2) {
      return val * dims.stepX
    }
    const sign = Math.sign(val)
    return sign * (2 * dims.stepX + (Math.abs(val) - 2) * (dims.stepX * 0.45))
  })

  const y = useTransform(offset, (val) => {
    return Math.min(dims.dropY * 2.5, Math.abs(val) * dims.dropY)
  })

  const rotate = useTransform(offset, (val) => {
    return Math.max(-dims.rotateDeg * 2, Math.min(dims.rotateDeg * 2, val * dims.rotateDeg))
  })

  const scale = useTransform(offset, (val) => {
    return Math.max(0.65, 1 - Math.abs(val) * dims.scaleStep)
  })

  const opacity = useTransform(offset, (val) => {
    const abs = Math.abs(val)
    if (abs >= 1.7) {
      return Math.max(0, (2 - abs) * (0.354 / 0.3))
    }
    return Math.max(0, 1 - abs * 0.38)
  })

  const zIndex = useTransform(offset, (val) => {
    return Math.round(100 - Math.abs(val) * 10)
  })

  // Lower metadata content opacity: strongest on active card, faded on background cards
  const contentOpacity = useTransform(offset, [-0.65, 0, 0.65], [0.15, 1, 0.15])

  const rolesString = formatRoles(project.roles)

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
        width: dims.cardWidth,
        height: dims.cardHeight,
      }}
      className={`group absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] overflow-hidden border transition-shadow duration-300 select-none ${
        isActive
          ? 'border-white/15 shadow-[0_20px_50px_rgba(98,57,191,0.22)]'
          : 'border-white/[0.08] shadow-[0_15px_35px_rgba(0,0,0,0.6)] cursor-pointer'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onCardClick(index, project.id)
      }}
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-label={`Featured Project: ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onCardClick(index, project.id)
        }
      }}
    >
      {/* Poster image background */}
      <img
        src={project.thumbnail || '/images/hero-bg.png'}
        alt={project.title || 'Project poster'}
        draggable={false}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out pointer-events-none select-none ${
          isActive ? 'group-hover:scale-[1.025]' : ''
        }`}
        onError={(e) => {
          e.target.src = '/images/hero-bg.png'
        }}
      />

      {/* Cinematic Dark Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(10,10,15,0.15) 0%, transparent 30%, rgba(10,10,15,0.65) 60%, rgba(10,10,15,0.96) 100%)',
        }}
      />

      {/* Top Badges Bar */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        {/* Genre Badge */}
        <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-white uppercase tracking-wider rounded-full bg-[#6239BF]/90 backdrop-blur-md border border-[#6239BF]/60 shadow-md">
          {project.genre || 'Film'}
        </span>

        {/* Status / Now Casting Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-semibold text-white/80 tracking-wider uppercase shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] animate-pulse" />
          <span>NOW CASTING</span>
        </div>
      </div>

      {/* Lower Content (editorial details fade when card is in background) */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end pointer-events-none z-10"
      >
        {/* Title with subtle vertical accent */}
        <div className="flex items-start gap-2 mb-1">
          <div className="w-0.5 min-h-[18px] rounded-full bg-[#6239BF] mt-1 flex-shrink-0" />
          <h3 className="font-['Fraunces',_serif] text-base sm:text-lg md:text-[21px] font-semibold text-white leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-purple-light">
            {project.title}
          </h3>
        </div>

        {/* Creator Attribution & Location */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-white/50 pl-2.5 mb-2">
          {project.creatorName && (
            <>
              <span className="font-['Inter'] text-white/60 truncate max-w-[110px]">by {project.creatorName}</span>
              <span className="text-white/20">•</span>
            </>
          )}
          {project.location && (
            <span className="flex items-center gap-1 font-['Inter'] truncate">
              <svg className="w-3 h-3 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{project.location}</span>
            </span>
          )}
        </div>

        {/* Roles Needed (compact line) */}
        {rolesString && (
          <div className="pl-2.5 mb-2.5">
            <span className="block font-['Inter'] text-[9px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">
              ROLES NEEDED
            </span>
            <p className="font-['Inter'] text-[11px] text-white/70 truncate">
              {rolesString}
            </p>
          </div>
        )}

        {/* View Project CTA Button */}
        <div className="pl-2.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#6239BF]/80 hover:bg-[#6239BF] border border-[#6239BF]/60 text-xs font-semibold text-white tracking-wide transition-all duration-300 shadow-[0_0_15px_rgba(98,57,191,0.35)] group-hover:scale-[1.02]">
            <span>View Project</span>
            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function FeaturedProjectsCarousel({ projects = [] }) {
  const navigate = useNavigate()
  const dims = useResponsiveDimensions()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollProgress = useMotionValue(0)
  const isAnimating = useRef(false)

  // Listen to scrollProgress to sync active index state for accessibility/dots
  useEffect(() => {
    const unsubscribe = scrollProgress.on('change', (latest) => {
      if (projects.length === 0) return
      const rounded = Math.round(latest)
      const norm = ((rounded % projects.length) + projects.length) % projects.length
      setActiveIndex(norm)
    })
    return () => unsubscribe()
  }, [scrollProgress, projects.length])

  const goToNext = () => {
    if (projects.length <= 1 || isAnimating.current) return
    isAnimating.current = true
    const current = Math.round(scrollProgress.get())
    const target = current + 1
    animate(scrollProgress, target, {
      duration: 0.42,
      ease: [0.25, 0.1, 0.25, 1],
      onComplete: () => {
        isAnimating.current = false
      },
    })
    setActiveIndex(((target % projects.length) + projects.length) % projects.length)
  }

  const goToPrev = () => {
    if (projects.length <= 1 || isAnimating.current) return
    isAnimating.current = true
    const current = Math.round(scrollProgress.get())
    const target = current - 1
    animate(scrollProgress, target, {
      duration: 0.42,
      ease: [0.25, 0.1, 0.25, 1],
      onComplete: () => {
        isAnimating.current = false
      },
    })
    setActiveIndex(((target % projects.length) + projects.length) % projects.length)
  }

  const goToIndex = (targetIndex) => {
    if (projects.length <= 1 || isAnimating.current) return
    const current = Math.round(scrollProgress.get())
    const currentNorm = ((current % projects.length) + projects.length) % projects.length
    if (currentNorm === targetIndex) return

    let delta = targetIndex - currentNorm
    if (delta > projects.length / 2) delta -= projects.length
    if (delta < -projects.length / 2) delta += projects.length

    const target = current + delta
    isAnimating.current = true
    animate(scrollProgress, target, {
      duration: 0.42,
      ease: [0.25, 0.1, 0.25, 1],
      onComplete: () => {
        isAnimating.current = false
      },
    })
    setActiveIndex(targetIndex)
  }

  const handleCardClick = (index, projectId) => {
    if (index === activeIndex) {
      // Active card clicked -> navigate to Project Detail
      navigate(`/project/${projectId}`)
    } else {
      // Background card clicked -> bring to front
      goToIndex(index)
    }
  }

  const containerHeight = dims.cardHeight + dims.dropY * 2 + 20

  return (
    <div className="w-full flex flex-col items-center">
      {/* Carousel Stack with Flanking Arrow Navigation */}
      <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
        {/* Left Arrow Button */}
        {projects.length > 1 && (
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous featured project"
            className="absolute left-1 sm:left-3 md:left-6 lg:left-8 z-[110] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.04] hover:bg-[#6239BF]/10 border border-white/[0.10] hover:border-[#6239BF]/50 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] shadow-lg backdrop-blur-sm group active:scale-95"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Stacked Cards Container */}
        <div
          style={{ height: containerHeight }}
          className="relative w-full flex items-center justify-center cursor-default outline-none select-none"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured Projects Stacked Carousel"
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              goToPrev()
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              goToNext()
            }
          }}
        >
          {projects.map((project, index) => (
            <CarouselCard
              key={project.id || index}
              project={project}
              index={index}
              totalProjects={projects.length}
              scrollProgress={scrollProgress}
              dims={dims}
              onCardClick={handleCardClick}
              isActive={index === activeIndex}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        {projects.length > 1 && (
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next featured project"
            className="absolute right-1 sm:right-3 md:right-6 lg:right-8 z-[110] w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/[0.04] hover:bg-[#6239BF]/10 border border-white/[0.10] hover:border-[#6239BF]/50 text-white/70 hover:text-white flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] shadow-lg backdrop-blur-sm group active:scale-95"
          >
            <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress Dots Navigation */}
      {projects.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-6 z-20">
          {projects.map((project, idx) => {
            const isDotActive = idx === activeIndex
            return (
              <button
                key={project.id || idx}
                type="button"
                onClick={() => goToIndex(idx)}
                aria-label={`Go to slide ${idx + 1}: ${project.title}`}
                className="group p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] rounded-full transition-all"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    isDotActive
                      ? 'w-6 bg-[#6239BF] shadow-[0_0_12px_rgba(98,57,191,0.8)]'
                      : 'w-1.5 bg-white/20 group-hover:bg-white/40'
                  }`}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FeaturedProjectsCarousel
