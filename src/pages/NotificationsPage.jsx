import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { supabase } from '../lib/supabaseClient'
import {
  getNotificationTitle,
  getNotificationDestination,
  formatNotificationTime,
} from '../utils/notifications'

export default function NotificationsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    try {
      setError(null)
      const { data, error: fetchErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchErr) throw fetchErr
      setNotifications(data || [])
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

    fetchNotifications()

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
            setNotifications((prev) => {
              if (prev.some((n) => n.id === payload.new.id)) return prev
              return [payload.new, ...prev.slice(0, 49)]
            })
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((n) => n.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, fetchNotifications])

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
    if (unreadCount === 0 || !user?.id) return
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error('Error marking all notifications read:', err)
    }
  }

  const handleRowClick = async (n) => {
    try {
      if (!n.is_read) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', n.id)

        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        )
      }
    } catch (err) {
      console.error('Error marking notification read:', err)
    } finally {
      const dest = getNotificationDestination(n)
      if (dest) {
        navigate(dest)
      }
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
            <h1 className="font-['Fraunces',_serif] text-3xl sm:text-4xl font-semibold text-white tracking-[-0.02em] leading-tight mb-2">
              Notifications
            </h1>
            <p className="text-white/45 text-sm sm:text-base">
              Stay updated on your productions, roles, and applications.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl border border-white/15 text-white/80 hover:text-white hover:border-purple/40 hover:bg-purple/10 transition-all duration-200"
            >
              Mark all as read
            </button>
          )}
        </div>

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
                onClick={() => setActiveFilter(f.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-purple/20 border-purple/40 text-purple-light shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/[0.16]'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-purple/40 text-white' : 'bg-white/[0.06] text-white/40'
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-8 h-8 text-purple animate-spin mb-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
            </svg>
            <p className="text-white/40 text-sm">Loading your notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-[#111116] border border-red-500/20 rounded-2xl p-10 text-center">
            <p className="text-red-400 text-sm font-semibold mb-3">{error}</p>
            <button
              onClick={fetchNotifications}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-xl transition-colors"
            >
              Try again
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="bg-[#111116] border border-white/[0.08] rounded-2xl p-12 text-center my-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
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
            <p className="text-xs text-white/40 max-w-sm mx-auto">
              {activeFilter === 'unread'
                ? 'You have reviewed all your incoming updates.'
                : activeFilter === 'applications'
                ? 'When you receive or send applications, updates will appear here.'
                : 'Project and application updates will appear here as they happen.'}
            </p>
          </div>
        ) : (
          /* Vertical Notification List */
          <div className="space-y-2.5">
            {filteredNotifications.map((n) => {
              const title = getNotificationTitle(n)
              const timeStr = formatNotificationTime(n.created_at)
              const isAccepted = n.type === 'APPLICATION_ACCEPTED'
              const isRejected = n.type === 'APPLICATION_REJECTED'
              const isReceived = n.type === 'APPLICATION_RECEIVED'

              return (
                <div
                  key={n.id}
                  onClick={() => handleRowClick(n)}
                  className={`group rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    !n.is_read
                      ? 'bg-[#14111d] border-purple/30 shadow-[0_4px_20px_rgba(98,57,191,0.08)] hover:border-purple/50'
                      : 'bg-[#111116] border-white/[0.07] hover:border-white/[0.14]'
                  }`}
                >
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : isRejected ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : isReceived ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-semibold tracking-tight ${
                            !n.is_read ? 'text-white' : 'text-white/80'
                          }`}
                        >
                          {title}
                        </h4>
                        {!n.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-purple block shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-white/35 font-medium shrink-0">
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
                  <div className="shrink-0 self-center text-white/25 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
