import type { Job } from './job'
import type { Application } from './job'

export interface DashboardStats {
    // Totals
    total_jobs: number
    total_applicants: number
    total_active_jobs: number
    new_this_week: number
    total_views: number

    // Recent data
    recent_jobs: Job[]
    recent_applicants: Application[]

    // Status breakdown
    status_breakdown?: {
        draft: number
        published: number
        paused: number
        expired: number
    }

    // Application status breakdown
    application_breakdown?: {
        applied: number
        reviewed: number
        shortlisted: number
        rejected: number
        accepted: number
    }
}
