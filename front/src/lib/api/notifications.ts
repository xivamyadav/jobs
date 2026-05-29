// Notifications API endpoints - Django backend integration
// Backend contract: http://192.168.1.40:8000/api/v1/notifications/

import api from '@/lib/api-client'

// Types for Notifications
export type NotificationType = 'NEW_APPLICATION' | 'STATUS_UPDATE' | 'EXPIRING_SOON' | 'SYSTEM'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  subText: string
  timestamp: string
  is_read: boolean
  link: string
}

export const notificationsApi = {
  /**
   * GET /notifications/ - List notifications with pagination
   * Returns: notifications + unread_count
   */
  async getAll(params?: { page?: number; limit?: number }) {
    const response = await api.get('/notifications/', { params })
    return response.data
  },

  /**
   * PATCH /notifications/{id}/read/ - Mark single notification as read
   */
  async markAsRead(id: string | number) {
    const response = await api.patch(`/notifications/${id}/read/`)
    return response.data
  },

  /**
   * PATCH /notifications/read-all/ - Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all/')
    return response.data
  },
}