/**
 * Helper utilities for project roles, occupancy calculations, and visual mappings.
 */

export function getRoleOccupancy(roleObj, applicants = [], options = {}) {
  const roleId = roleObj?.id
  const roleName = roleObj?.role
  const requiredCount = Math.max(1, Number(roleObj?.positions_needed) || 1)

  // 1. Authoritative count from project_roles.positions_filled
  const hasValidDbCount =
    roleObj != null &&
    roleObj.positions_filled !== null &&
    roleObj.positions_filled !== undefined &&
    !isNaN(Number(roleObj.positions_filled)) &&
    Number(roleObj.positions_filled) >= 0

  // 2. Count accepted applications from applicants array if provided
  // (strictly status === 'accepted'; pending, rejected, or withdrawn are excluded)
  const hasApplicantsArray = Array.isArray(applicants)
  const acceptedFromApplicants = hasApplicantsArray
    ? applicants.filter((a) => {
        const isAccepted = String(a?.status || '').trim().toLowerCase() === 'accepted'
        if (!isAccepted) return false
        if (roleId && a?.project_role_id) {
          return String(a.project_role_id) === String(roleId)
        }
        return a?.role === roleName
      }).length
    : 0

  // 3. Determine authoritative accepted count
  let acceptedCount = null
  let isAvailable = true

  if (hasValidDbCount) {
    const dbCount = Number(roleObj.positions_filled)
    // If the caller is explicitly the project creator, support optimistic local acceptance
    if (options?.isCreator) {
      acceptedCount = Math.max(dbCount, acceptedFromApplicants)
    } else {
      // For external viewers and general usage, strictly use the authoritative DB count
      acceptedCount = dbCount
    }
  } else if (hasApplicantsArray && applicants.length > 0 && options?.isCreator) {
    // If DB count is missing but creator has loaded applicants, use applicants count
    acceptedCount = acceptedFromApplicants
  } else {
    // Missing, null, or invalid authoritative count is NOT treated as confirmed zero
    isAvailable = false
    acceptedCount = null
  }

  const isFilled = isAvailable && acceptedCount !== null ? acceptedCount >= requiredCount : false
  const remainingSlots = isAvailable && acceptedCount !== null ? Math.max(0, requiredCount - acceptedCount) : null

  return {
    requiredCount,
    acceptedCount,
    isFilled,
    remainingSlots,
    isAvailable,
  }
}

export const STATUS_COLORS = {
  'Open': 'border-purple text-purple-light bg-purple/10',
  'In Production': 'border-amber-500/60 text-amber-400 bg-amber-500/10',
  'Completed': 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10',
  'Closed': 'border-white/20 text-white/60 bg-white/5',
}

export const CANONICAL_PROJECT_STATUSES = [
  {
    value: 'OPEN',
    label: 'Open / Actively Recruiting',
    shortLabel: 'Open',
    description: 'Publicly accepting collaborator applications.',
    colorKey: 'Open',
  },
  {
    value: 'IN_PRODUCTION',
    label: 'In Production',
    shortLabel: 'In Production',
    description: 'Production is underway. Recruitment is closed.',
    colorKey: 'In Production',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    shortLabel: 'Completed',
    description: 'Production finished. Applications are closed.',
    colorKey: 'Completed',
  },
  {
    value: 'CLOSED',
    label: 'Closed',
    shortLabel: 'Closed',
    description: 'Project is closed. Applications are closed.',
    colorKey: 'Closed',
  },
]

export function formatProjectStatus(rawStatus) {
  if (!rawStatus) return 'Open'
  const s = String(rawStatus).toUpperCase()
  if (s === 'OPEN') return 'Open'
  if (s === 'IN_PRODUCTION' || s === 'IN PRODUCTION' || s === 'IN_PROGRESS') return 'In Production'
  if (s === 'COMPLETED') return 'Completed'
  if (s === 'CLOSED' || s === 'CANCELLED') return 'Closed'
  return rawStatus
}

