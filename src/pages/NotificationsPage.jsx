import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabaseClient'
import {
  getNotificationTitle,
  getNotificationDestination,
  formatNotificationTime,
  mergeNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../utils/notifications'

export default function NotificationsPage() {
  usePageTitle('Notifications | FrameWork')
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const PAGE_SIZE = 50
  const [notifications, setNotifications] = useState([])
  const [notificationLimit, setNotificationLimit] = useState(PAGE_SIZE)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  const limitRef = useRef(notificationLimit)
  useEffect(() => {
    limitRef.current = notificationLimit
  }, [notificationLimit])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}${location.hash}`
        }
      })
    }
  }, [user, navigate, location])

  const fetchNotifications = useCallback(async (limitToFetch = PAGE_SIZE) => {
    if (!user?.id) return
    try {
      setError(null)
      const { data, count, error: fetchErr } = await supabase
        .from('notifications')
        .select('id, user_id, project_id, application_id, type, title, message, is_read, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limitToFetch)

      if (fetchErr) throw fetchErr
      setNotifications((prev) => mergeNotifications(prev, data || [], limitToFetch))
      if (typeof count === 'number') {
        setTotalCount(count)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Initial fetch and Realtime subscription
  useEffect(() => {
    if (!user?.id) return

    fetchNotifications(PAGE_SIZE)

    const channel = supabase
      .channel(`page-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => mergeNotifications(prev, [payload.new], limitRef.current))
            setTotalCount((prev) => prev + 1)
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            )
            setTotalCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, fetchNotifications])

  // Load More notifications (+50)
  const handleLoadMore = async () => {
    if (loadingMore || !user?.id) return
    const newLimit = notificationLimit + PAGE_SIZE
    setLoadingMore(true)
    try {
      const { data, count, error: fetchErr } = await supabase
        .from('notifications')
        .select('id, user_id, project_id, application_id, type, title, message, is_read, created_at', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(newLimit)

      if (fetchErr) throw fetchErr
      setNotifications((prev) => mergeNotifications(prev, data || [], newLimit))
      setNotificationLimit(newLimit)
      if (typeof count === 'number') {
        setTotalCount(count)
      }
    } catch (err) {
      console.error('Error loading more notifications:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  // Derived filter counts
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  const applicationCount = useMemo(
    () =>
      notifications.filter((n) =>
        ['APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED'].includes(
          n.type
        )
      ).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'unread') {
      return notifications.filter((n) => !n.is_read)
    }
    if (activeFilter === 'applications') {
      return notifications.filter((n) =>
        ['APPLICATION_RECEIVED', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED'].includes(
          n.type
        )
      )
    }
    return notifications
  }, [notifications, activeFilter])

  const markAllRead = async () => {
    if (unreadCount === 0 || !user?.id || markingAllRead) return
    setMarkingAllRead(true)
    setActionError(null)
    const res = await markAllNotificationsRead(supabase, user.id)
    if (res.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } else {
      setActionError('Unable to mark notifications as read. Please try again.')
    }
    setMarkingAllRead(false)
  }

  const handleRowClick = (n) => {
    if (!n.is_read && user?.id) {
      // Optimistic local update
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      )
      // Non-blocking user-scoped DB update with error handling
      markNotificationRead(supabase, user.id, n.id)
    }
  }

  if (!user) return null

  return (
    <section className="min-h-screen pt-28 pb-20 px-4 sm:px-6 bg-[#0A0A0F]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple/30 bg-purple/10 text-purple-light mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-purple" />
              Activity Center
            </span>
            <h1 className="font-['Bebas_Neue',_sans-serif] text-4xl sm:text-5xl font-normal tracking-wide leading-none text-white mb-2">
              Notifications
            </h1>
            <p className="text-white/50 text-sm sm:text-base">
              Stay updated on your productions, roles, and applications.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAllRead}
              className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-purple/40 hover:bg-purple/10 transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              {markingAllRead ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>

        {/* Action Error Notification */}
        {actionError && (
          <div role="alert" className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {actionError}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'applications', label: 'Applications', count: applicationCount },
          ].map((f) => {
            const isSelected = activeFilter === f.key
            return (
              <button
                key={f.key}
                id={`filter-notif-${f.key}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveFilter(f.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
                  isSelected
                    ? 'bg-purple/20 border-purple/40 text-purple-light shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/[0.16]'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-purple/40 text-white' : 'bg-white/[0.06] text-white/50'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center justify-center py-20 text-center">
            <svg aria-hidden="true" className="w-8 h-8 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            <p className="text-white/50 text-sm">Loading your notifications...</p>
          </div>
        ) : error ? (
          <div role="alert" className="bg-[#111116] border border-red-500/20 rounded-2xl p-10 text-center">
            <p className="text-red-400 text-sm font-semibold mb-3">{error}</p>
            <button
              onClick={() => fetchNotifications(notificationLimit)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="bg-[#111116] border border-white/[0.08] rounded-2xl p-12 text-center my-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
              <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white/80 mb-1">
              {activeFilter === 'unread'
                ? 'No unread notifications'
                : activeFilter === 'applications'
                ? 'No application notifications yet'
                : "You're all caught up"}
            </h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              {activeFilter === 'unread'
                ? 'You have reviewed all your incoming updates.'
                : activeFilter === 'applications'
                ? 'When you receive or send applications, updates will appear here.'
                : 'Project and application updates will appear here as they happen.'}
            </p>
          </div>
        ) : (
          /* Vertical Notification List */
          <div className="space-y-4">
            <ul role="list" className="space-y-2.5">
              {filteredNotifications.map((n) => {
                const title = getNotificationTitle(n)
                const dest = getNotificationDestination(n)
                const timeStr = formatNotificationTime(n.created_at)
                const isAccepted = n.type === 'APPLICATION_ACCEPTED'
                const isRejected = n.type === 'APPLICATION_REJECTED'
                const isReceived = n.type === 'APPLICATION_RECEIVED'

                const cardBody = (
                  <>
                    {/* Status / Type Icon */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 ${
                          isAccepted
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : isRejected
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : isReceived
                            ? 'bg-purple/15 border-purple/35 text-purple-light'
                            : 'bg-white/[0.04] border-white/10 text-white/60'
                        }`}
                      >
                        {isAccepted ? (
                          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : isRejected ? (
                          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : isReceived ? (
                          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        ) : (
                          <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 break-words">
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-sm font-semibold tracking-tight ${
                              !n.is_read ? 'text-white' : 'text-white/80'
                            }`}
                          >
                            {!n.is_read && <span className="sr-only">Unread: </span>}
                            {title}
                          </p>
                          {!n.is_read && (
                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-purple block shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-white/50 font-medium shrink-0">
                          {timeStr}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          !n.is_read ? 'text-white/85 font-medium' : 'text-white/55'
                        }`}
                      >
                        {n.message}
                      </p>
                    </div>

                    {/* Arrow Indicator */}
                    <div aria-hidden="true" className="shrink-0 self-center text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </>
                )

                return (
                  <li key={n.id}>
                    {dest ? (
                      <Link
                        to={dest}
                        onClick={() => handleRowClick(n)}
                        className={`group rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
                          !n.is_read
                            ? 'bg-[#14111d] border-purple/30 shadow-[0_4px_20px_rgba(98,57,191,0.08)] hover:border-purple/50'
                            : 'bg-[#111116] border-white/[0.07] hover:border-white/[0.14]'
                        }`}
                      >
                        {cardBody}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRowClick(n)}
                        className={`w-full text-left group rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex items-start gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F] ${
                          !n.is_read
                            ? 'bg-[#14111d] border-purple/30 shadow-[0_4px_20px_rgba(98,57,191,0.08)] hover:border-purple/50'
                            : 'bg-[#111116] border-white/[0.07] hover:border-white/[0.14]'
                        }`}
                      >
                        {cardBody}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* Load More Button */}
            {notifications.length < totalCount && (
              <div className="pt-6 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl border border-white/15 text-xs font-semibold text-white/80 hover:text-white hover:border-purple/40 hover:bg-purple/10 transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6239BF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]"
                >
                  {loadingMore ? 'Loading more...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
