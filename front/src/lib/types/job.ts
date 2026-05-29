export type JobStatus = 'draft' | 'published' | 'paused' | 'expired'
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
export type ExperienceLevel = 'entry_level' | 'mid_level' | 'senior_level' | 'lead_level'

export interface Job {
  id: number
  title: string
  description: string
  company: number | string
  job_type: JobType
  experience_level: ExperienceLevel
  experience_min?: number
  experience_max?: number
  location: string
  is_remote?: boolean
  salary_min?: number
  salary_max?: number
  currency?: string
  required_skills?: string[]
  qualifications?: string
  status: JobStatus
  published_at?: string
  expires_at?: string
  views_count: number
  applications_count: number
  posted_by: number
  created_at: string
  updated_at: string
}

export interface JobCreatePayload {
  title: string
  description: string
  company: number | string
  job_type: JobType
  location: string
  is_remote?: boolean
  salary_min?: number
  salary_max?: number
  currency?: string
  experience_level: ExperienceLevel
  experience_min?: number
  experience_max?: number
  required_skills?: string[]
  qualifications?: string
  status?: JobStatus
  published_at?: string
  expires_at?: string
}

export interface JobUpdatePayload extends Partial<JobCreatePayload> { }

export type ApplicationStatus = 'applied' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'

export interface Application {
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

export interface ApplicationCreatePayload {
  job: number | string
  candidate: number | string
  status?: ApplicationStatus
  cover_letter?: string
  resume_file?: File
}

export interface ApplicationUpdatePayload {
  status?: ApplicationStatus
  employer_notes?: string
  interview_date?: string
  interview_notes?: string
  rating?: number
}