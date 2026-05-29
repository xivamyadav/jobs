export type JobStatus = 'Active Now' | 'Job Closed' | 'Under Review' | 'Rejected' | 'Shortlisted';
export type ApplicationStatus = 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
export type WorkMode = 'Onsite' | 'Hybrid' | 'Remote';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Freelance';

export interface Job {
  id: number;
  job_title: string;
  // company: string;
  company_name: string;
  company_id?: number | null;
  location: string;
  experience: number;
  employment_type?: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  qualifications: string[];
  // postedAt: string;
  posted_at: string;
  // workMode: WorkMode;
  work_mode?: string;
  // logoUrl?: string;
  logo_url?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_min_exp?: number;
  job_max_exp?: number;
  application_status?: string | null;
}

export interface Application {
  id: number;
  // jobId: number;
  // job?: number;
  job_id?: number;
  // jobTitle: string;
  job_title?: string;
  company: string;
  company_name?: string;
  location?: string;
  posted_by_name?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_min_exp?: number;
  job_max_exp?: number;
  currency?: string;
  logo_url?: string;
  appliedDate: string;
  applied_at?: string;
  updated_at?: string;
  status: ApplicationStatus;
}

export interface SavedJob {
  id: number;
  // jobId: number;
  job_id: number;
  job_title: string;
  // title?: string;
  // company: string;
  company_name?: string;
  // savedAt: string;
  saved_at?: string;
  location?: string;
  employment_type?: string;
  salary_currency?: string;
   work_mode?: string;

  job_min_salary?: number;
  job_max_salary?: number;
  job_min_exp?: number;
  job_max_exp?: number;
  application_status?: string | null;
  logo_url?: string;
  skills?: string[];
  description?: string;
  responsibilities?: string[];
  qualifications?: string[];
}
