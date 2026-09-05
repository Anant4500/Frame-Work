import { Link } from 'react-router-dom'

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
  return (
    <section id="how-it-works" className="relative py-12 md:py-16 px-6 overflow-hidden">
      {/* ── Section Background Stack ── */}

      {/* Layer 1: Base */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: '#0A0A0F' }} />

      {/* Layer 2: Residual Purple Haze */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Upper-middle ambient haze — leftover from Hero */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '900px',
            height: '550px',
            top: '0%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(59, 31, 115, 0.16) 0%, rgba(98, 57, 191, 0.07) 50%, transparent 80%)',
            filter: 'blur(75px)',
          }}
        />

        {/* Layer 3: Center-card emphasis — restrained radial glow behind middle area */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: '560px',
            height: '420px',
            top: '64%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(ellipse, rgba(98, 57, 191, 0.14) 0%, rgba(59, 31, 115, 0.08) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Layer 4: Grain (Subtle 1.8%) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.018,
          mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='hiw-g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23hiw-g)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Layer 5a: Filmstrip — Left Edge */}
      <div
        className="howitworks-filmstrip absolute top-0 bottom-0 left-0 pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{ width: '40px', zIndex: 3 }}
      >
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{ width: '1px', background: 'rgba(255, 255, 255, 0.04)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 5px,
              rgba(98, 57, 191, 0.12) 5px,
              rgba(98, 57, 191, 0.12) 15px,
              transparent 15px,
              transparent 26px
            )`,
            backgroundSize: '6px 26px',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        />
      </div>

      {/* Layer 5b: Filmstrip — Right Edge */}
      <div
        className="howitworks-filmstrip absolute top-0 bottom-0 right-0 pointer-events-none hidden md:block"
        aria-hidden="true"
        style={{ width: '40px', zIndex: 3 }}
      >
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{ width: '1px', background: 'rgba(255, 255, 255, 0.04)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              to bottom,
              transparent 0px,
              transparent 5px,
              rgba(98, 57, 191, 0.12) 5px,
              rgba(98, 57, 191, 0.12) 15px,
              transparent 15px,
              transparent 26px
            )`,
            backgroundSize: '6px 26px',
            backgroundPosition: 'center top',
            backgroundRepeat: 'repeat-y',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
          }}
        />
      </div>

      {/* Layer 6: Bottom transition to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
        style={{
          height: '80px',
          background: 'linear-gradient(to bottom, transparent, #0A0A0F)',
          zIndex: 4,
        }}
      />

      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-purple/30 to-transparent z-10" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-9 reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
          <span className="inline-block text-purple text-xs sm:text-sm font-semibold tracking-widest uppercase mb-2 sm:mb-2.5">
            How FrameWork Works
          </span>
          <h2 className="font-['Fraunces',_serif] text-3xl sm:text-4xl font-normal leading-[1.15] tracking-tight text-white mb-3 sm:mb-3.5">
            From Idea to Film.
          </h2>
          <p className="font-['Inter'] text-sm sm:text-[15px] text-white/50 max-w-xl mx-auto leading-relaxed">
            FrameWork helps stories find the right people — from posting a project to building a crew and making the film.
          </p>
        </div>

        {/* Main 40/60 Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 lg:gap-12 items-center">
          {/* LEFT: Vertical 3-Step Flowchart */}
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0">
            <div className="space-y-6 sm:space-y-7 pl-1 sm:pl-2">
              {flowchartSteps.map((step, idx) => (
                <div key={step.number} className="relative flex items-start gap-3.5 sm:gap-4">
                  {/* Step Number */}
                  <span className="font-['Inter'] text-xs font-semibold text-white/40 tracking-wider pt-0.5 w-5 text-right flex-shrink-0">
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
                      <h3 className="font-['Fraunces',_serif] text-base sm:text-[22px] font-medium leading-snug text-white mb-1">
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
                    <p className="font-['Inter'] text-sm sm:text-[14.5px] text-white/50 leading-[1.5] max-w-xs sm:max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Unified Creator / Collaborator Decision Panel */}
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 [&.is-visible]:opacity-100 [&.is-visible]:translate-y-0" style={{ transitionDelay: '150ms' }}>
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
                    <h3 className="font-['Fraunces',_serif] text-xl sm:text-[28px] font-normal leading-[1.18] tracking-tight text-white mb-2">
                      Build the Crew Your Film Needs.
                    </h3>
                    <p className="font-['Inter'] text-white/60 text-sm sm:text-[15px] leading-[1.5] mb-3.5 max-w-lg">
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
                      to="/register"
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
                    <h3 className="font-['Fraunces',_serif] text-xl sm:text-[28px] font-normal leading-[1.18] tracking-tight text-white mb-2">
                      Find a Film Worth Joining.
                    </h3>
                    <p className="font-['Inter'] text-white/60 text-sm sm:text-[15px] leading-[1.5] mb-3.5 max-w-lg">
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
                      to="/register"
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
