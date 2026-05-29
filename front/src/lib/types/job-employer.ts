export type JobStatus = 'draft' | 'published' | 'paused' | 'expired'
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
export type WorkMode = 'onsite' | 'remote' | 'hybrid'

export interface JobCategory {
    id: string
    name: string
    slug: string
}

export interface Job {
    id: string
    employerId: string
    title: string
    description: string
    responsibilities: string
    requirements: string
    niceToHave?: string
    categoryId: string
    jobCategory: string
    jobType: JobType
    workMode: WorkMode
    location?: string
    salaryMin?: number
    salaryMax?: number
    currency: string
    showSalary: boolean
    openings: number
    status: JobStatus
    applicationDeadline?: string
    applicantCount: number
    viewCount: number
    createdAt: string
    updatedAt: string
}

export interface JobFilters {
    status?: JobStatus
    jobType?: JobType
    search?: string
    sort?: 'newest' | 'oldest' | 'most-applicants' | 'fewest-applicants'
    page?: number
    limit?: number
}
