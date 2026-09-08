import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { CANONICAL_PROJECT_STATUSES, STATUS_COLORS, formatProjectStatus } from './projectRoleUtils'

export default function UpdateProjectStatusModal({
  isOpen,
  onClose,
  project,
  onStatusUpdated,
}) {
  const currentRawStatus = (project?.rawStatus || 'OPEN').toUpperCase()
  const [selectedStatus, setSelectedStatus] = useState(currentRawStatus)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen && project) {
      setSelectedStatus((project.rawStatus || 'OPEN').toUpperCase())
      setErrorMsg('')
    }
  }, [isOpen, project])

  if (!isOpen || !project) return null

  const isStoppingRecruitment =
    currentRawStatus === 'OPEN' && selectedStatus !== 'OPEN'

  const isReopeningRecruitment =
    currentRawStatus !== 'OPEN' && selectedStatus === 'OPEN'

  const hasStatusChanged = selectedStatus !== currentRawStatus

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!hasStatusChanged) {
      onClose()
      return
    }

    try {
      setIsSaving(true)
      setErrorMsg('')

      // 1. Strict creator ownership verification
      const { data: { session } } = await supabase.auth.getSession()
      const activeUserId = session?.user?.id

      if (
        !session ||
        !activeUserId ||
        (activeUserId !== project.creator_id && activeUserId !== project.creator?.id)
      ) {
        throw new Error('Authentication required. Only the project creator can update the project status.')
      }

      // 2. Perform atomic update ONLY on status column to avoid sending stale values for other fields
      const { data, error } = await supabase
        .from('projects')
        .update({ status: selectedStatus })
        .eq('id', project.id)
        .eq('creator_id', activeUserId)
        .select('id, status, updated_at')
        .single()

      if (error) {
        throw error
      }

      // 3. Notify parent to update local state and toast
      const updatedRaw = data?.status || selectedStatus
      onStatusUpdated(updatedRaw)
      onClose()
    } catch (err) {
      console.error('Error updating project status:', err)
      setErrorMsg(err.message || 'Failed to update project status. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentFormatted = formatProjectStatus(currentRawStatus)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-['DM_Sans',_sans-serif]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-status-title"
    >
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple/15 border border-purple/30 flex items-center justify-center text-purple-light">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
            <div>
              <h2 id="update-status-title" className="text-base font-bold text-white leading-tight">
                Update Project Status
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Manage the lifecycle and recruitment state of this production.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-status-modal-btn"
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-white/40 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Status Indicator */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl mb-5 text-xs">
          <span className="text-white/50">Current status:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-semibold border rounded-full ${STATUS_COLORS[currentFormatted] || 'border-white/20 text-white/60'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentFormatted === 'Open'
                ? 'bg-purple'
                : currentFormatted === 'In Production'
                ? 'bg-amber-400'
                : currentFormatted === 'Closed'
                ? 'bg-white/40'
                : 'bg-emerald-400'
            }`} />
            {currentFormatted}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            id="status-update-error"
            className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs leading-relaxed flex items-start gap-2.5"
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdate}>
          {/* Status Options Radio List */}
          <div className="space-y-2.5 mb-5" role="radiogroup" aria-label="Project status options">
            {CANONICAL_PROJECT_STATUSES.map((option) => {
              const isSelected = selectedStatus === option.value
              const isCurrent = currentRawStatus === option.value

              return (
                <label
                  key={option.value}
                  id={`status-option-${option.value}`}
                  className={`block p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-purple/10 border-purple shadow-[0_0_15px_rgba(98,57,191,0.25)]'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="pt-0.5">
                        <input
                          type="radio"
                          name="project-status"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => {
                            setSelectedStatus(option.value)
                            setErrorMsg('')
                          }}
                          disabled={isSaving}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-purple bg-purple' : 'border-white/30 bg-transparent'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-white/80'}`}>
                            {option.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-medium text-white/40 bg-white/[0.06] px-1.5 py-0.2 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                          {option.description}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold border rounded-full shrink-0 ${STATUS_COLORS[option.colorKey] || 'border-white/20 text-white/60'}`}>
                      {option.shortLabel}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          {/* Contextual Confirmation Notice */}
          {isStoppingRecruitment && (
            <div
              id="recruitment-closure-notice"
              className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <strong className="font-semibold block text-amber-200 mb-0.5">
                  Recruitment will be closed
                </strong>
                New applications will no longer be accepted. Existing applications, accepted team members, and project roles remain intact.
              </div>
            </div>
          )}

          {isReopeningRecruitment && (
            <div
              id="recruitment-reopen-notice"
              className="mb-5 p-3.5 rounded-xl bg-purple/10 border border-purple/30 text-purple-light text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in"
            >
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <div>
                <strong className="font-semibold block text-white mb-0.5">
                  Recruitment will reopen
                </strong>
                The project will actively recruit collaborators again. Collaborators will be able to submit new applications for open roles.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              id="cancel-status-modal-btn"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white/60 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="update-status-submit-btn"
              disabled={!hasStatusChanged || isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-purple text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-purple-dark hover:shadow-[0_0_20px_rgba(98,57,191,0.35)] disabled:opacity-40 disabled:hover:bg-purple disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF]"
            >
              {isSaving && (
                <svg className="w-3.5 h-3.5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
              )}
              <span>{isSaving ? 'Updating Status...' : isStoppingRecruitment ? 'Confirm & Close Recruitment' : 'Save Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
