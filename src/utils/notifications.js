/**
 * Shared Notification utilities for FrameWork
 */

export function getNotificationTitle(n) {
  if (n.title) return n.title
  switch (n.type) {
    case 'APPLICATION_RECEIVED':
      return 'New application'
    case 'APPLICATION_ACCEPTED':
      return 'Application accepted'
    case 'APPLICATION_REJECTED':
      return 'Application closed'
    default:
      return 'Notification'
  }
}

export function getNotificationDestination(n) {
  if (!n) return null
  switch (n.type) {
    case 'APPLICATION_RECEIVED':
      return n.project_id ? `/project/${n.project_id}?tab=applications` : '/my-projects'
    case 'APPLICATION_ACCEPTED':
    case 'APPLICATION_REJECTED':
      return n.project_id ? `/project/${n.project_id}` : '/my-projects'
    case 'GENERAL':
    default:
      return n.project_id ? `/project/${n.project_id}` : null
  }
}

export function formatNotificationTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  if (isNaN(diffMs) || diffMs < 0) return 'Just now'

  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'Just now'
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays === 1) {
    return 'Yesterday'
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
