// Applicants API endpoints - Django backend integration
// Backend contract: http://192.168.1.40:8000/api/v1/applicants/

import api from '@/lib/api-client'

export const applicantsApi = {
    /**
     * GET /applicants/ - List all applications with pagination and filters
     * Filters: status, job, search, ordering
     */
    async getAll(params?: {
        page?: number
        limit?: number
        status?: string
        job?: string | number
        search?: string
        ordering?: string
    }) {
        const response = await api.get('/applicants/', { params })
        return response.data
    },

    /**
     * GET /applicants/{id}/ - Get application detail by ID
     */
    async getById(id: string | number) {
        const response = await api.get(`/applicants/${id}/`)
        return response.data
    },

    /**
     * POST /applicants/ - Create new application
     * NOTE: Candidate ID is auto-extracted from JWT token by backend
     * Do NOT send candidate field - backend handles it!
     */
    async create(data: {
        job: string | number
        cover_letter?: string
        resume_file?: File
    }) {
        const formData = new FormData()
        formData.append('job', String(data.job))
        if (data.cover_letter) formData.append('cover_letter', data.cover_letter)
        if (data.resume_file) formData.append('resume_file', data.resume_file)

        const response = await api.post('/applicants/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response.data
    },

    /**
     * PUT/PATCH /applicants/{id}/ - Update application
     */
    async update(
        id: string | number,
        data: {
            status?: string
            employer_notes?: string
            interview_date?: string
            interview_notes?: string
            rating?: number
        }
    ) {
        const response = await api.patch(`/applicants/${id}/`, data)
        return response.data
    },

    /**
     * DELETE /applicants/{id}/ - Delete application
     */
    async delete(id: string | number) {
        const response = await api.delete(`/applicants/${id}/`)
        return response.data
    },

    /**
     * PATCH /applicants/{id}/update_status/ - Update application status
     */
    async updateStatus(id: string | number, status: string) {
        const response = await api.patch(`/applicants/${id}/update_status/`, { status })
        return response.data
    },

    /**
     * PATCH /applicants/{id}/add_notes/ - Add employer notes
     */
    async addNotes(id: string | number, employer_notes: string) {
        const response = await api.patch(`/applicants/${id}/add_notes/`, { employer_notes })
        return response.data
    },

    // Convenience method
    async updateNotes(id: string | number, employer_notes: string) {
        return this.addNotes(id, employer_notes)
    },
}