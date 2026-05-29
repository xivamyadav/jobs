// Jobs API endpoints - Django backend integration
// Backend contract: http://192.168.1.40:8000/api/v1/jobs/

import api from '@/lib/api-client'

export const jobsApi = {
    /**
     * GET /jobs/ - List all jobs with pagination
     */
    async getAll(page = 1, pageSize = 10) {
        const response = await api.get('/jobs/', {
            params: {
                page,
                page_size: pageSize,
            }
        })
        return response.data
    },

    /**
     * GET /jobs/<id>/ - Get job detail by ID (use raw ID: 123)
     */
    async getById(id: string | number) {
        const rawId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id
        const response = await api.get(`/jobs/${rawId}/`)
        return response.data
    },

    /**
     * POST /jobs/ - Create new job
     */
    async create(data: any) {
        const response = await api.post('/jobs/', data)
        return response.data
    },

    /**
     * PUT /jobs/<id>/ - Update job (full update)
     */
    async update(id: string | number, data: any) {
        const rawId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id
        const response = await api.put(`/jobs/${rawId}/`, data)
        return response.data
    },

    /**
     * DELETE /jobs/<id>/ - Delete job
     */
    async delete(id: string | number) {
        const rawId = typeof id === 'string' && id.includes('-') ? id.split('-')[1] : id
        const response = await api.delete(`/jobs/${rawId}/`)
        return response.data
    },
}
