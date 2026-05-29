import { dashboardApi } from '@/lib/api/dashboard'
import { companyApi } from '@/lib/api/company'
import { jobsApi } from '@/lib/api/jobs-employer'
import { applicantsApi } from '@/lib/api/applicants'
const mockApi: any = {}
import { USE_MOCK_API } from '@/lib/api/config'

/**
 * API Selector Hook
 * Returns either real or mock API based on configuration
 * Easy to switch between development and production APIs
 */

export const useApi = () => {
    // In development, use mock API
    // In production, use real API
    if (USE_MOCK_API) {
        return mockApi
    }

    // Return real API
    return {
        dashboard: dashboardApi,
        company: companyApi,
        jobs: jobsApi,
        applicants: applicantsApi,
    }
}

// Convenience functions for common patterns
export const useDashboardApi = () => {
    const api = useApi()
    return {
        getStats: () => api.dashboard.getStats(),
    }
}

export const useCompanyApi = () => {
    const api = useApi()
    return {
        getMyCompany: () => api.company.getMyCompany(),
        updateCompany: (data: any) => api.company.updateCompany(data),
    }
}

export const useJobsApi = () => {
    const api = useApi()
    return {
        getAll: (params?: any) => api.jobs.getAll(params),
        getById: (id: string) => api.jobs.getById(id),
        deleteJob: (id: string) => api.jobs.deleteJob(id),
        updateStatus: (id: string, status: string) => api.jobs.updateStatus(id, status),
    }
}

export const useApplicantsApi = () => {
    const api = useApi()
    return {
        getAll: (params?: any) => api.applicants.getAll(params),
        getById: (id: string | number) => api.applicants.getById(id),
        updateStatus: (id: string | number, status: string) => api.applicants.updateStatus(id, status),
    }
}
