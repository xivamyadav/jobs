export type NotificationType = 'NEW_APPLICATION' | 'STATUS_UPDATE' | 'EXPIRING_SOON' | 'SYSTEM'

export interface Notification {
    id: number
    recipient: number
    notification_type: NotificationType
    title: string
    message: string
    related_job?: number
    related_applicant?: number
    is_read: boolean
    read_at?: string
    created_at: string
    updated_at: string
}

export interface NotificationListResponse {
    unread_count: number
    results: Notification[]
    count: number
    next?: string
    previous?: string
}
