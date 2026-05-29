export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone_number?: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  industry?: string;
  location?: string;
  size?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company_id: string;
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  status: string;
  created_at: string;
  updated_at: string;
  views_count?: number;
  applications_count?: number;
}

export interface Applicant {
  id: string;
  job_id: string;
  candidate_id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  applied_at: string;
  resume_url?: string;
  cover_letter?: string;
}
