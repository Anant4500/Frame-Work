/**
 * Helper utilities for project roles, occupancy calculations, and visual mappings.
 */

export function getRoleOccupancy(roleObj, applicants = []) {
  const roleId = roleObj?.id
  const roleName = roleObj?.role
  const requiredCount = Math.max(1, Number(roleObj?.positions_needed) || 1)

  const acceptedCount = (applicants || []).filter((a) => {
    const isAccepted = (a.status || '').toLowerCase() === 'accepted'
    if (!isAccepted) return false
    if (roleId && a.project_role_id) {
      return String(a.project_role_id) === String(roleId)
    }
    return a.role === roleName
  }).length

  const isFilled = acceptedCount >= requiredCount
  const remainingSlots = Math.max(0, requiredCount - acceptedCount)

  return {
    requiredCount,
    acceptedCount,
    isFilled,
    remainingSlots,
  }
}

export const STATUS_COLORS = {
  'Open': 'border-purple text-purple-light bg-purple/10',
  'In Production': 'border-amber-500/60 text-amber-400 bg-amber-500/10',
  'Completed': 'border-emerald-500/60 text-emerald-400 bg-emerald-500/10',
  'Closed': 'border-white/20 text-white/60 bg-white/5',
}
