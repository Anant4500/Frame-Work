import { useRef, useMemo } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { useHomepageSectionFade } from '../hooks/useHomepageSectionFade'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import FeaturedProjects from '../components/FeaturedProjects'
import FeaturedCreators from '../components/FeaturedCreators'
import CallToAction from '../components/CallToAction'

function HomePage() {
  usePageTitle('FrameWork | Build Films Together')

  const heroRef = useRef(null)
  const projectsRef = useRef(null)
  const howItWorksRef = useRef(null)
  const creatorsRef = useRef(null)
  const ctaRef = useRef(null)

  const sectionRefs = useMemo(
    () => [heroRef, projectsRef, howItWorksRef, creatorsRef, ctaRef],
    []
  )

  useHomepageSectionFade(sectionRefs)

  return (
    <div className="homepage-bg relative" style={{ backgroundColor: '#000000' }}>
      {/* Homepage Content */}
      <div className="relative z-[5]">
        <div ref={heroRef} className="homepage-section-fade">
          <Hero />
        </div>
        <div ref={projectsRef} className="homepage-section-fade">
          <FeaturedProjects />
        </div>
        <div ref={howItWorksRef} className="homepage-section-fade">
          <HowItWorks />
        </div>
        <div ref={creatorsRef} className="homepage-section-fade">
          <FeaturedCreators />
        </div>
        <div ref={ctaRef} className="homepage-section-fade">
          <CallToAction />
        </div>
      </div>
    </div>
  )
}

export default HomePage
