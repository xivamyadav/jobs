'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, FileEdit, AlertTriangle, Info, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { notificationsApi } from '@/lib/api/notifications'
import { getApiErrorMessage } from '@/lib/api-error'
import { toast } from 'sonner'

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await notificationsApi.getAll()
        const list = response?.data?.notifications ?? response?.notifications ?? []
        const normalized = Array.isArray(list) ? list.map((n: any) => ({
          id: n.id,
          title: n.title ?? 'Notification',
          message: n.message ?? '',
          type: n.notification_type ?? n.type ?? 'INFO',
          isRead: Boolean(n.is_read ?? n.isRead),
          link: n.link ?? '/employer/notifications',
          created_at: n.created_at ?? n.timestamp ?? new Date().toISOString()
        })) : []
        setNotifications(normalized)
      } catch (error) {
        const msg = getApiErrorMessage(error, 'Unable to load notifications.')
        toast.error(msg)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  // Mark all as read function
  const markAllRead = async () => {
    const previous = notifications
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    try {
      await notificationsApi.markAllAsRead()
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to mark notifications as read.')
      toast.error(msg)
      setNotifications(previous)
    }
  }

  // Handle click to mark read and navigate
  const handleNotificationClick = async (id: string | number, link?: string) => {
    try {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
      await notificationsApi.markAsRead(id)
      if (link) {
        router.push(link)
      }
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to open notification.')
      toast.error(msg)
    }
  }

  const getIcon = (type: string) => {
    const iconClass = "size-[18px]"
    switch (type) {
      case 'NEW_APPLICATION':
        return <UserPlus className={cn("text-blue-600", iconClass)} />
      case 'STATUS_UPDATE':
        return <FileEdit className={cn("text-green-600", iconClass)} />
      case 'EXPIRING_SOON':
        return <AlertTriangle className={cn("text-amber-600", iconClass)} />
      case 'INFO':
      default:
        return <Info className={cn("text-indigo-600", iconClass)} />
    }
  }

  if (!loading && notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Info className="mx-auto mb-4 text-gray-400" size={48} />
        <h2 className="text-xl font-semibold text-gray-600">No notifications yet</h2>
        <p className="text-gray-500">You'll see notifications here when there's activity</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated with your applicants and jobs</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          className="flex items-center gap-2 border-indigo-300 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
        >
          <CheckCheck size={16} /> Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            onClick={() => handleNotificationClick(n.id, n.link || '/employer/notifications')}
            className={cn(
              "p-4 border-l-4 transition-all cursor-pointer hover:shadow-md active:shadow-lg select-none",
              n.isRead ? "border-l-gray-300 bg-white hover:bg-gray-50" : "border-l-indigo-600 bg-indigo-50/40 shadow-sm hover:bg-indigo-50/60"
            )}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex gap-4">
              <div className={cn(
                "p-2.5 rounded-xl h-fit",
                n.isRead ? "bg-gray-100" : "bg-white shadow-sm border border-indigo-100"
              )}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={cn("text-sm font-bold", n.isRead ? "text-gray-700" : "text-indigo-900")}>
                      {n.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-400 whitespace-nowrap ml-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {!n.isRead && (
                <div className="flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
