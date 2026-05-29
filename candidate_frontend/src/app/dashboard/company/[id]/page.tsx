"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsApi } from '@/apis/user/index';
import { MapPin, Globe, Users, Briefcase, ChevronLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';
import JobCard from '@/components/jobs/JobCard';
import type { Job } from '@/lib/types/job';

export default function CompanyPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const companyId = Number(params?.id);

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!companyId) return;
      try {
        const compRes = await jobsApi.getCompanyDetail(companyId);
        setCompany(compRes?.data ?? compRes);

        const jobsRes = await jobsApi.getJobs();
        const allJobs = jobsRes?.data?.items ?? jobsRes?.results ?? (Array.isArray(jobsRes) ? jobsRes : []);
        // Note: Backend might not filter by company, so we do it client-side if needed, 
        // but typically getJobs has filters or we just filter here.
        const compJobs = allJobs.filter((j: any) => 
          (j.company === companyId) || (j.company_id === companyId) || (j.company_name === (compRes?.data?.name || compRes?.name))
        );
        // Normalize
        setJobs(compJobs.map((raw: any) => ({
          id: raw.id ?? raw.job_id,
          job_title: raw.title ?? raw.job_title ?? '',
          company_name: raw.company_name ?? raw.client_name ?? raw.company ?? '',
          company_id: raw.company_id ?? raw.company ?? null,
          location: raw.location ?? raw.job_location ?? '',
          work_mode: raw.is_remote ? 'remote' : (raw.work_mode ?? ''),
          employment_type: raw.job_type ?? raw.employment_type ?? '',
          skills: raw.required_skills ?? raw.skills ?? [],
          description: raw.job_overview ?? raw.description ?? '',
          job_min_salary: parseFloat(raw.salary_min ?? raw.job_min_salary ?? 0),
          job_max_salary: parseFloat(raw.salary_max ?? raw.job_max_salary ?? 0),
          job_min_exp: raw.job_min_exp ?? raw.min_experience_months ?? 0,
          job_max_exp: raw.job_max_exp ?? raw.job_min_exp ?? 0,
          logo_url: raw.company_logo ?? raw.logo_url ?? raw.logoUrl,
          posted_at: raw.published_at ?? raw.posted_at ?? raw.created_at ?? '',
        })));
      } catch (e) {
        const msg = getApiErrorMessage(e, 'Unable to load company details.');
        toast({ title: 'Company unavailable', description: msg, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800">Company Not Found</h2>
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">
          <ChevronLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Jobs
        </button>

        {/* Company Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cover Photo Area (Fallback to gradient) */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 w-full" />
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              
              <div className="flex items-end gap-5 -mt-12">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-24 h-24 rounded-xl border-4 border-white bg-white object-contain shadow-sm" />
                ) : (
                  <div className="w-24 h-24 rounded-xl border-4 border-white bg-indigo-50 flex items-center justify-center shadow-sm">
                    <Building2 className="w-10 h-10 text-indigo-300" />
                  </div>
                )}
                
                <div className="mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                  <p className="text-gray-500 font-medium flex items-center gap-2 mt-1">
                    {company.industry && <span>{company.industry}</span>}
                    {company.industry && company.company_size && <span className="w-1 h-1 rounded-full bg-gray-300" />}
                    {company.company_size && <span>{company.company_size} Employees</span>}
                  </p>
                </div>
              </div>

              {company.website && (
                <div className="mb-1">
                  <a href={company.website} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      <Globe className="w-4 h-4 mr-2" /> Visit Website
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About {company.name}</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {company.description || "No description provided for this company."}
              </div>
            </div>

            {/* Active Jobs for Company */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                  {jobs.length} Jobs
                </span>
              </div>
              
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      isActive={false} 
                      onClick={() => router.push(`/dashboard/jobs?id=${job.id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">No active jobs found for this company.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Company Details</h3>
              <div className="space-y-4">
                {company.headquarters && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Headquarters</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{company.headquarters}</p>
                    </div>
                  </div>
                )}
                {company.company_size && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Size</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{company.company_size} Employees</p>
                    </div>
                  </div>
                )}
                {company.industry && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Industry</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{company.industry}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
