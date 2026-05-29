"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { jobsApi } from '@/apis/user/index';
import { Job, Application, SavedJob } from '@/lib/types/job';
import { getApiErrorMessage } from '@/lib/api-error';

interface JobFilters {
  location?: string;
  minExperience?: number;
  experience?: number;
}

const cache: Record<string, any> = {};

// ── Normalizers ───────────────────────────────────────────────────────────────
function normalizeJob(raw: any): Job {
  return {
    id:              raw.id ?? raw.job_id,
    job_title:       raw.title ?? raw.job_title ?? '',
    company_name:    raw.company_name ?? raw.client_name ?? raw.company ?? '',
    location:        raw.location ?? raw.job_location ?? '',
    work_mode:       raw.is_remote ? 'remote' : (raw.work_mode ?? ''),
    employment_type: raw.job_type ?? raw.employment_type ?? '',
    skills: raw.required_skills ?? raw.skills ?? [],
    description:     raw.job_overview ?? raw.description ?? '',
    responsibilities: raw.job_responsibilities ?? raw.responsibilities ?? [],
    qualifications:  raw.job_qualification ?? raw.qualifications ?? [],
    job_min_salary:  parseFloat(raw.salary_min ?? raw.job_min_salary ?? 0),
    job_max_salary:  parseFloat(raw.salary_max ?? raw.job_max_salary ?? 0),
    job_min_exp:     raw.job_min_exp ?? raw.experience_min ?? raw.min_experience_months ?? 0,
    job_max_exp:     raw.job_max_exp ?? raw.experience_max ?? raw.job_min_exp ?? raw.experience_min ?? 0,
    application_status: raw.application_status ?? raw.applicationStatus ?? null,
    logo_url: raw.company_logo ?? raw.logo_url ?? raw.logoUrl,
    experience:      raw.experience_level ?? raw.experience ?? 0,
    posted_at:       raw.published_at ?? raw.posted_at ?? raw.created_at ?? '',
  };
}

function normalizeSavedJob(raw: any): SavedJob {
  const detail = raw.job_detail || {};
  return {
    id:              raw.id ?? raw.job_id,
    job_id:          raw.job ?? raw.job_id,
    job_title:       detail.title ?? raw.job_title ?? '',
    company_name:    detail.company_name ?? raw.company_name ?? raw.client_name ?? '',
    location:        detail.location ?? raw.location ?? raw.job_location ?? '',
    work_mode:       detail.is_remote ? 'remote' : (raw.work_mode ?? ''),
    employment_type: detail.job_type ?? raw.employment_type ?? raw.job_type ?? '',
    skills:          detail.required_skills ?? raw.skills ?? [],
    description:     detail.description ?? raw.description ?? '',
    responsibilities: detail.responsibilities ?? raw.responsibilities ?? [],
    qualifications:  detail.qualifications ?? raw.qualifications ?? [],
    job_min_salary:  detail.salary_min ?? raw.job_min_salary ?? 0,
    job_max_salary:  detail.salary_max ?? raw.job_max_salary ?? 0,
    salary_currency: 'INR',
    job_min_exp:     detail.experience_min ?? raw.job_min_exp ?? 0,
    job_max_exp:     detail.experience_max ?? raw.job_max_exp ?? 0,
    application_status: detail.application_status ?? raw.application_status ?? null,
    logo_url:        detail.company_logo ?? raw.logo_url ?? raw.company_logo,
    saved_at:        raw.saved_at ?? raw.created_at ?? '',
  };
}

function normalizeApplication(raw: any): Application {
  const detail = raw.job_detail || {};
  return {
    id: raw.id,
    job_id: raw.job ?? raw.job_id,
    job_title: detail.title ?? raw.job_title ?? raw.jobTitle ?? '',
    company: detail.company_name ?? raw.company_name ?? raw.client_name ?? raw.company ?? '',
    company_name: detail.company_name ?? raw.company_name ?? raw.client_name ?? raw.company ?? '',
    location: detail.location ?? raw.location ?? '',
    posted_by_name: detail.posted_by_name ?? raw.posted_by_name ?? '',
    job_min_salary: detail.salary_min ?? raw.salary_min ?? raw.job_min_salary ?? 0,
    job_max_salary: detail.salary_max ?? raw.salary_max ?? raw.job_max_salary ?? 0,
    job_min_exp: detail.experience_min ?? raw.experience_min ?? raw.job_min_exp ?? 0,
    job_max_exp: detail.experience_max ?? raw.experience_max ?? raw.job_max_exp ?? 0,
    currency: detail.currency ?? raw.currency ?? 'INR',
    logo_url: detail.company_logo ?? raw.company_logo ?? raw.logo_url,
    applied_at: raw.applied_at ?? raw.appliedDate ?? '',
    updated_at: raw.updated_at ?? '',
    appliedDate: raw.applied_at ?? raw.appliedDate ?? '',
    status: raw.status ?? 'Applied',
  };
}

// ── useActiveJobs ─────────────────────────────────────────────────────────────
export function useActiveJobs(filters?: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const filtersKey = JSON.stringify({ ...(filters ?? {}) });
  const cacheKey = `${filtersKey}_page_${page}`;
  const abortRef = useRef<AbortController | null>(null);
  const isFetching = useRef(false);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const fetchJobs = useCallback(async (force = false) => {
    if (!force && cache[cacheKey]) {
      setData(cache[cacheKey].data);
      setTotalItems(cache[cacheKey].totalItems);
      setTotalPages(cache[cacheKey].totalPages);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const res = await jobsApi.getJobs({ ...filters, page });
      const dataNode = res?.data ?? res;
      const raw = dataNode?.items ?? dataNode?.results ?? res?.results ?? (Array.isArray(res) ? res : []);
      const pagination = dataNode?.pagination ?? res?.pagination;
      const count = pagination?.count ?? res?.count ?? raw.length;
      const pageSize = pagination?.page_size ?? 10;
      const pages = pagination?.total_pages ?? Math.max(1, Math.ceil(count / pageSize));

      const normalized = raw.map(normalizeJob);
      cache[cacheKey] = { data: normalized, totalItems: count, totalPages: pages };
      
      setData(normalized);
      setTotalItems(count);
      setTotalPages(pages);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        // Keep previous data on transient errors
      }
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [cacheKey, page, filters]); // filters is handled by cacheKey stringification

  useEffect(() => {
    fetchJobs();
    return () => abortRef.current?.abort();
  }, [fetchJobs]);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const refetch = useCallback((force?: boolean) => fetchJobs(force), [fetchJobs]);

  return { data, loading, page, totalPages, totalItems, goToPage, refetch };
}

// ── useJobDetails ─────────────────────────────────────────────────────────────
export function useJobDetails(id: number | null) {
  const [data, setData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJob = useCallback(async () => {
    if (!id) { setData(null); return; }

    const cacheKey = `job_${id}`;
    if (cache[cacheKey]) {
      setData(cache[cacheKey]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setLoading(true);

    try {
      const raw = await jobsApi.getJobDetail(id);
      const jobData = raw?.data ?? raw;
      const normalized = jobData ? normalizeJob(jobData) : null;
      cache[cacheKey] = normalized;
      setData(normalized);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    return () => abortRef.current?.abort();
  }, [fetchJob]);

  return { data, loading, refetch: fetchJob };
}

// ── useSavedJobs ──────────────────────────────────────────────────────────────
export function useSavedJobs() {
  const [data, setData] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const isFetching = useRef(false);

  const fetchSaved = useCallback(async (force = false) => {
    if (!force && cache['saved_jobs']) {
      setData(cache['saved_jobs']);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const res = await jobsApi.getSavedJobs();
      const raw = res?.data ?? res?.results ?? (Array.isArray(res) ? res : []);
      const normalized = raw.map(normalizeSavedJob);
      cache['saved_jobs'] = normalized;
      setData(normalized);
    } catch {
      // Keep previous data on transient errors
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = useCallback(async (job: SavedJob | Job) => {
    try {
      const jobId = (job as any).job_id ?? job.id;
      const alreadySaved = data.some((s) => (s.job_id ?? s.id) === jobId);
      if (alreadySaved) {
        await jobsApi.unsaveJob(jobId);
      } else {
        await jobsApi.saveJob(jobId);
      }
      delete cache['saved_jobs'];
      await fetchSaved(true);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update saved jobs. Please try again.');
      throw new Error(message);
    }
  }, [data, fetchSaved]);

  const refetch = useCallback(() => fetchSaved(true), [fetchSaved]);

  return { data, loading, toggleSave, refetch };
}

// ── useApplications ───────────────────────────────────────────────────────────
export function useApplications() {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const isFetching = useRef(false);

  const cacheKey = `applications_list_page_${page}`;

  const fetchApps = useCallback(async (force = false) => {
    if (!force && cache[cacheKey]) {
      setData(cache[cacheKey].data);
      setTotalItems(cache[cacheKey].totalItems);
      setTotalPages(cache[cacheKey].totalPages);
      setLoading(false);
      return;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const res = await jobsApi.getApplications({ page });
      const dataNode = res?.data ?? res;
      const raw = dataNode?.items ?? dataNode?.results ?? res?.results ?? (Array.isArray(res) ? res : []);
      const pagination = dataNode?.pagination ?? res?.pagination;
      const count = pagination?.count ?? res?.count ?? raw.length;
      const pageSize = pagination?.page_size ?? 10;
      const pages = pagination?.total_pages ?? Math.max(1, Math.ceil(count / pageSize));

      const normalized = raw.map(normalizeApplication);
      cache[cacheKey] = { data: normalized, totalItems: count, totalPages: pages };
      setData(normalized);
      setTotalItems(count);
      setTotalPages(pages);
    } catch {
      // Keep previous data on transient errors
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [cacheKey, page]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const apply = useCallback(async (jobId: number, formData: any) => {
    try {
      await jobsApi.applyJob(jobId, formData);
      Object.keys(cache).forEach((key) => {
        if (key.startsWith('applications_list_page_')) delete cache[key];
      });
      await fetchApps(true);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to submit application. Please try again.');
      throw new Error(message);
    }
  }, [fetchApps]);

  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));
  const refetch = useCallback((force?: boolean) => fetchApps(force), [fetchApps]);

  return { data, loading, page, totalPages, totalItems, goToPage, apply, refetch };
}
