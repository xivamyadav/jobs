export interface Location {
  id: number;
  city: string;
  state: { id: number; name: string };
  country: { id: number; name: string };
  label?: string;
}

export interface Candidate {
  id: number;
  full_name: string;
  email?: string;
  phone_number?: string;
  primary_email?: string;
  primary_phone?: string;
  headline?: string;
  about?: string;
  gender?: string;
  date_of_birth?: string;
  is_fresher?: boolean;
  current_designation?: string;
  total_experience_months: number;
  total_experience_years: number;
  location_id?: number | null;
  location_text?: string | null;
  current_salary_lpa?: number | null;
  expected_salary_lpa?: number | null;
  current_salary_amount?: number;
  expected_salary_amount?: number;
  salary_currency?: string;
  salary_period?: 'YEAR' | 'MONTH';
  notice_period_days?: number;
  profile_picture?: string;
  location?: Location | null;
  state?: string | null;
  city?: string | null;
  country?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id: number;
  company_id?: number | null;
  company_name_text?: string | null;
  designation: string;
  employment_type?: string;
  start_date: string; // ISO string
  end_date?: string | null; // ISO string
  is_current: boolean;
  location?: number | null;
  location_detail?: Location | null;
  description?: string;
}

export interface Education {
  id: number;
  level: string;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  grade?: string;
}

export interface Skill {
  id: number;
  name: string;
  skill_name?: string; 
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years_experience?: number;
  is_primary?: boolean;
}

export interface Resume {
  id: number;
  file_name: string;
  file_url?: string;
  resume_url?: string;
  is_active?: boolean;
  uploaded_at?: string;
  file_size_bytes?: number;
  file_mime?: string;
  candidate?: number;
}

export interface Application {
  id: number;
  job_title: string;
  company_name: string;
  status: string;
  applied_at: string;
}

export interface Certification {
  id: number;
  name: string;
  issuing_organization: string;
  completion_id?: string;
  url?: string;
  valid_from_month?: number | null;
  valid_from_year?: number | null;
  valid_to_month?: number | null;
  valid_to_year?: number | null;
  does_not_expire?: boolean;

  created_at?: string;
  updated_at?: string;
}

export type ProfileSectionId = 'basic' | 'experience' | 'education' | 'skills' | 'certifications' | 'resume';

export interface ProfileSection {
    id: ProfileSectionId;
    title: string;
}