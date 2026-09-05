import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

export default function ApplicantCard({
  applicant,
  onAccept,
  onReject,
  isRoleFull,
  isProcessing,
}) {
  const status = (applicant.status || 'pending').toLowerCase()

  const handleViewResume = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rawPath = applicant.resumeUrl || applicant.resume_url
    if (!rawPath) return
    try {
      let cleanPath = rawPath
      if (cleanPath.includes('/resumes/')) cleanPath = cleanPath.split('/resumes/')[1]
      if (cleanPath.includes('?')) cleanPath = cleanPath.split('?')[0]

      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(cleanPath, 120)

      if (!error && data?.signedUrl) {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
      } else {
        console.error('Error loading applicant resume:', error)
      }
    } catch (err) {
      console.error('Error opening resume:', err)
    }
  }

  const statusBadge = {
    pending: null,
    accepted: (
      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 rounded-full">
        Accepted
      </span>
    ),
    rejected: (
      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25 rounded-full">
        Rejected
      </span>
    ),
  }

  const profileUrl = applicant.applicant_id ? `/profile/${applicant.applicant_id}` : null

  return (
    <div className="flex flex-col justify-between p-5 bg-[#111116] border border-white/[0.08] hover:border-white/[0.14] rounded-xl transition-all duration-200">
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {profileUrl ? (
              <Link to={profileUrl} className="shrink-0 group">
                <div className="w-11 h-11 rounded-full bg-purple/15 border border-purple/30 group-hover:border-purple flex items-center justify-center overflow-hidden transition-colors">
                  {applicant.avatar ? (
                    <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-purple">{(applicant.name || 'A').charAt(0)}</span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center overflow-hidden shrink-0">
                {applicant.avatar ? (
                  <img src={applicant.avatar} alt={applicant.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-purple">{(applicant.name || 'A').charAt(0)}</span>
                )}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {profileUrl ? (
                  <Link to={profileUrl} className="text-sm font-semibold text-white hover:text-purple-light transition-colors truncate">
                    {applicant.name}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-white truncate">{applicant.name}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs mt-0.5">
                <span className="text-purple-light font-medium">{applicant.role}</span>
                {applicant.location && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="text-white/40">{applicant.location}</span>
                  </>
                )}
                {(applicant.resumeUrl || applicant.resume_url) && (
                  <>
                    <span className="text-white/20">•</span>
                    <button
                      type="button"
                      onClick={handleViewResume}
                      className="text-purple-light hover:text-white transition-colors underline font-medium"
                    >
                      Resume
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {statusBadge[status]}
        </div>

        {/* Pitch / Message */}
        {applicant.message && (
          <div className="p-3 bg-black/25 rounded-lg border border-white/[0.04] mb-4">
            <p className="text-xs text-white/70 leading-relaxed italic line-clamp-3">
              "{applicant.message}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer for Pending Applications */}
      {status === 'pending' && (
        <div className="pt-2 border-t border-white/[0.05] space-y-2.5">
          {isRoleFull && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>Role capacity filled ({applicant.role})</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReject}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={isRoleFull || isProcessing}
              className="flex-1 py-2 px-3 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 rounded-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Accepting...' : 'Accept'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
