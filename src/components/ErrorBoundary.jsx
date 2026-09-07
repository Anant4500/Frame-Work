import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    if (typeof document !== 'undefined') {
      document.title = 'Something Went Wrong | FrameWork'
    }
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error intercepted by ErrorBoundary:', error, errorInfo)
    if (typeof document !== 'undefined') {
      document.title = 'Something Went Wrong | FrameWork'
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.assign('/')
  }

  render() {
    if (this.state.hasError) {
      if (typeof document !== 'undefined') {
        document.title = 'Something Went Wrong | FrameWork'
      }
      return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
          {/* Background ambient lighting */}
          <div className="fixed inset-0 pointer-events-none -z-10" aria-hidden="true">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#6239BF]/15 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0A0F_75%)]" />
          </div>

          <main
            role="alert"
            className="w-full max-w-md bg-[#111118] rounded-2xl p-8 sm:p-10 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h1 className="font-['Bebas_Neue',_sans-serif] text-3xl font-normal tracking-wide mb-3 text-white">
              Something went wrong
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              FrameWork ran into an unexpected problem.
            </p>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-6 bg-[#6239BF] text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:bg-[#502db3] hover:shadow-[0_0_25px_rgba(98,57,191,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
              >
                Reload Page
              </button>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault()
                  this.handleGoHome()
                }}
                className="w-full py-3 px-6 bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.06] text-sm font-medium rounded-xl border border-white/10 transition-colors inline-block text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111118]"
              >
                Return Home
              </a>
            </div>
          </main>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
