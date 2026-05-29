export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'

export interface Applicant {
    id: number
    job: number
    candidate: number
    status: ApplicationStatus
    applied_at: string
    cover_letter?: string
    resume_file?: string
    employer_notes?: string
    interview_date?: string
    interview_notes?: string
    offer_letter?: string
    rating?: number
    created_at: string
    updated_at: string
}

export interface ApplicantCreatePayload {
    job: number | string
    candidate: number | string
    status?: ApplicationStatus
    cover_letter?: string
    resume_file?: File
}

export interface ApplicantUpdatePayload {
    status?: ApplicationStatus
    employer_notes?: string
    interview_date?: string
    interview_notes?: string
    rating?: number
}

export interface ApplicantDetail extends Applicant {
    job_detail?: {
        title: string
        company: string
    }
    candidate_detail?: {
        full_name: string
        email: string
        phone_number?: string
    }
}
