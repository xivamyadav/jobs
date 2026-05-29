// src/lib/api/jobs-employer.ts
// Jobs API endpoints - Django backend integration

import api from '@/lib/api-client'

export const jobsApi = {
    /**
     * GET /jobs/ - List all jobs with filters and pagination
     * Filters: status, job_type, experience_level, is_remote, search, ordering
     */
    async getAll(params?: {
        page?: number
        limit?: number
        status?: string
        job_type?: string
        experience_level?: string
        is_remote?: boolean
        search?: string
        ordering?: string
    }) {
        const response = await api.get('/jobs/', { params })
        return response.data
    },

    /**
     * GET /jobs/{id}/ - Get job detail by ID
     */
    async getById(id: string | number) {
        const response = await api.get(`/jobs/${id}/`)
        return response.data
    },

    /**
     * POST /jobs/ - Create new job
     */
    async create(data: {
        title: string
        description: string
        company: number | string
        job_type: string
        location: string
        is_remote?: boolean
        salary_min?: number
        salary_max?: number
        currency?: string
        experience_level: string
        required_skills?: string[]
        qualifications?: string
        status?: string
        published_at?: string
        expires_at?: string
    }) {
        const response = await api.post('/jobs/', data)
        return response.data
    },

    /**
     * PUT /jobs/{id}/ - Full update job
     */
    async update(id: string | number, data: Record<string, any>) {
        const response = await api.put(`/jobs/${id}/`, data)
        return response.data
    },

    /**
     * PATCH /jobs/{id}/ - Partial update job
     */
    async partialUpdate(id: string | number, data: Record<string, any>) {
        const response = await api.patch(`/jobs/${id}/`, data)
        return response.data
    },

    /**
     * DELETE /jobs/{id}/ - Delete job
     */
    async delete(id: string | number) {
        const response = await api.delete(`/jobs/${id}/`)
        return response.data
    },

    /**
     * POST /jobs/{id}/publish/ - Publish job
     */
    async publish(id: string | number) {
        const response = await api.post(`/jobs/${id}/publish/`)
        return response.data
    },

    /**
     * POST /jobs/{id}/pause/ - Pause job
     */
    async pause(id: string | number) {
        const response = await api.post(`/jobs/${id}/pause/`)
        return response.data
    },

    /**
     * POST /jobs/{id}/increment_views/ - Increment job views count
     */
    async incrementViews(id: string | number) {
        const response = await api.post(`/jobs/${id}/increment_views/`)
        return response.data
    },

    // Convenience method
    async deleteJob(id: string | number) {
        return this.delete(id)
    },
}
