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

/**
 * Merges existing notifications with incoming notifications:
 * - Dedupes by id (preserves local is_read status if already marked read)
 * - Sorts newest first by created_at (with id fallback for stable ties)
 * - Applies slice limit if limit > 0
 */
export function mergeNotifications(existing = [], incoming = [], limit = 0) {
  const map = new Map()

  // Add existing items first
  for (const item of existing) {
    if (item?.id) {
      map.set(item.id, item)
    }
  }

  // Add/merge with incoming items
  for (const item of incoming) {
    if (item?.id) {
      const prev = map.get(item.id)
      // Preserve optimistic is_read: true if local state already marked it read
      map.set(item.id, prev?.is_read ? { ...item, is_read: true } : item)
    }
  }

  const merged = Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    if (timeB !== timeA) {
      return timeB - timeA
    }
    return String(b.id || '').localeCompare(String(a.id || ''))
  })

  return limit > 0 ? merged.slice(0, limit) : merged
}

/**
 * Marks a single notification as read in Supabase with explicit user ownership scoping
 */
export async function markNotificationRead(supabase, userId, notificationId) {
  if (!supabase || !userId || !notificationId) return { success: false }
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notification read:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (err) {
    console.error('Unexpected error marking notification read:', err)
    return { success: false, error: err }
  }
}

/**
 * Marks all unread notifications for a user as read in Supabase with user scoping
 */
export async function markAllNotificationsRead(supabase, userId) {
  if (!supabase || !userId) return { success: false }
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications read:', error)
      return { success: false, error }
    }
    return { success: true }
  } catch (err) {
    console.error('Unexpected error marking all notifications read:', err)
    return { success: false, error: err }
  }
}
