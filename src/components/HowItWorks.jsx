import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const flowchartSteps = [
  {
    number: '01',
    title: 'Post Your Story',
    description: 'Share your project and define the roles you need.',
  },
  {
    number: '02',
    title: 'Build Your Crew',
    description: 'Discover filmmakers and find the right people for each role.',
    hasConnector: true,
  },
  {
    number: '03',
    title: 'Make the Film',
    description: 'Collaborate, create, and turn the idea into a finished film.',
  },
]

function HowItWorks() {
  const { user } = useAuth()
  return (
    <section id="how-it-works" className="relative py-12 md:py-16 px-6 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* ── Section Background Stack ── */}

      {/* Layer 1: Base */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#000000' }} />

      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-purple/30 to-transparent z-10" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-9 reveal">
          <span className="inline-block text-purple text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 sm:mb-2.5">
            How FrameWork Works
          </span>
          <h2 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl font-normal leading-tight tracking-wide text-white mb-3 sm:mb-3.5">
            From Idea to Film.
          </h2>
          <p className="text-sm sm:text-[15px] text-white/50 max-w-xl mx-auto leading-relaxed">
            FrameWork helps stories find the right people — from posting a project to building a crew and making the film.
          </p>
        </div>

        {/* Main 40/60 Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 lg:gap-12 items-center">
          {/* LEFT: Vertical 3-Step Flowchart */}
          <div className="reveal">
            <div className="space-y-6 sm:space-y-7 pl-1 sm:pl-2">
              {flowchartSteps.map((step, idx) => (
                <div key={step.number} className="relative flex items-start gap-3.5 sm:gap-4">
                  {/* Step Number */}
                  <span className="font-['Bebas_Neue',_sans-serif] text-sm font-normal text-white/50 tracking-widest pt-0.5 w-5 text-right flex-shrink-0">
                    {step.number}
                  </span>

                  {/* Node & Connecting Line Column */}
                  <div className="flex flex-col items-center flex-shrink-0 w-3 self-stretch">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 z-10 mt-1"
                      style={{
                        backgroundColor: '#6239BF',
                        boxShadow: '0 0 10px rgba(98, 57, 191, 0.7)',
                      }}
                    />
                    {idx < flowchartSteps.length - 1 && (
                      <div
                        className="w-px flex-1 my-1 min-h-[36px]"
                        style={{ background: 'rgba(98, 57, 191, 0.35)' }}
                      />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 relative -mt-0.5 pb-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-['Bebas_Neue',_sans-serif] text-xl sm:text-2xl font-normal leading-tight tracking-wide text-white mb-1">
                        {step.title}
                      </h3>
                      {/* Subtle horizontal connector from step 02 toward right panel */}
                      {step.hasConnector && (
                        <div
                          className="hidden lg:block w-8 h-px pointer-events-none ml-1 mb-1"
                          style={{
                            background: 'linear-gradient(to right, rgba(98, 57, 191, 0.25), transparent)',
                          }}
                        />
                      )}
                    </div>
                    <p className="text-sm sm:text-[14.5px] text-white/50 leading-[1.5] max-w-xs sm:max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Unified Creator / Collaborator Decision Panel */}
          <div className="reveal" style={{ transitionDelay: '150ms' }}>
            <div
              className="rounded-2xl sm:rounded-3xl border border-white/[0.08] overflow-hidden"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              {/* TOP HALF: Creator Pathway */}
              <div
                className="p-5 sm:px-7 sm:py-5 md:px-8 md:py-[22px]"
                style={{
                  background: 'radial-gradient(ellipse at top left, rgba(98, 57, 191, 0.08) 0%, transparent 70%), rgba(255, 255, 255, 0.02)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-8">
                  {/* Left Content Column (~72%) */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-purple text-xs font-semibold tracking-[0.12em] uppercase mb-2">
                      Have a Story?
                    </span>
                    <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl sm:text-3xl font-normal leading-tight tracking-wide text-white mb-2">
                      Build the Crew Your Film Needs.
                    </h3>
                    <p className="text-white/60 text-sm sm:text-[15px] leading-[1.5] mb-3.5 max-w-lg">
                      Post your project, define open roles, and find collaborators who can bring your story to life.
                    </p>

                    {/* 3 Points */}
                    <ul className="space-y-1.5 sm:space-y-2">
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Post your script</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Define the roles you need</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Manage applications and build your team</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right CTA Column (~28%) */}
                  <div className="flex-shrink-0 self-start sm:self-end sm:pb-1">
                    <Link
                      to={user ? '/create-project' : '/register'}
                      id="howitworks-cta-creator"
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 min-h-[44px] bg-[#6239BF] hover:bg-purple-dark text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                    >
                      Join as Creator
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* INTERNAL DIVIDER */}
              <div className="h-px w-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* BOTTOM HALF: Collaborator Pathway */}
              <div
                className="p-5 sm:px-7 sm:py-5 md:px-8 md:py-[22px]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.015)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-8">
                  {/* Left Content Column (~72%) */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-white/40 text-xs font-semibold tracking-[0.12em] uppercase mb-2">
                      Have a Skill?
                    </span>
                    <h3 className="font-['Bebas_Neue',_sans-serif] text-2xl sm:text-3xl font-normal leading-tight tracking-wide text-white mb-2">
                      Find a Film Worth Joining.
                    </h3>
                    <p className="text-white/60 text-sm sm:text-[15px] leading-[1.5] mb-3.5 max-w-lg">
                      Explore projects, apply for roles, and build your filmmaking credits through real collaborations.
                    </p>

                    {/* 3 Points */}
                    <ul className="space-y-1.5 sm:space-y-2">
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Discover open projects</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Apply for specific roles</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-sm text-white/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6239BF] flex-shrink-0" />
                        <span>Build experience and credits</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right CTA Column (~28%) */}
                  <div className="flex-shrink-0 self-start sm:self-end sm:pb-1">
                    <Link
                      to={user ? '/explore' : '/register'}
                      id="howitworks-cta-collaborator"
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 min-h-[44px] bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-purple/40 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(98,57,191,0.2)] hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                    >
                      Join as Collaborator
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
