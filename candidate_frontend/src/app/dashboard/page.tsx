"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApplications, useSavedJobs, useActiveJobs } from '@/hooks/jobs/use-jobs';
import { 
  Briefcase, Bookmark, TrendingUp, Clock, MapPin, Search, ArrowRight, 
  ChevronRight, Sparkles, UploadCloud, FileText, CheckCircle, ArrowUpRight, Eye, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { candidateApi } from '@/apis/user';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types/job';
import { getApiErrorMessage } from '@/lib/api-error';

function getInitials(name: string) {
  if (!name || name === 'Account') return 'U';
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function formatSalary(min: number, max: number) {
  if (!min && !max) return null;
  const fmt = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(0)} LPA`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return `${n} LPA`;
  };
  if (min && max) {
      if (min < 100 && max < 100) return `₹${min}-${max} LPA`;
      return `₹${fmt(min).replace(' LPA', '')}-${fmt(max)}`;
  }
  if (max) return `Up to ₹${fmt(max)}`;
  return `₹${fmt(min)}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastRefreshRef = useRef(0);

  const { data: applications = [], loading: appsLoading, refetch: refetchApplications } = useApplications();
  const { data: savedJobs = [], toggleSave, refetch: refetchSavedJobs } = useSavedJobs();
  const { data: allJobs = [], loading: jobsLoading, refetch: refetchJobs } = useActiveJobs();
  const { user } = useAuth();

  const [uploadingCV, setUploadingCV] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [insightsData, setInsightsData] = useState<any>(null);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await candidateApi.getInsights();
      if (res.success) {
        setInsightsData(res.data);
      }
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Unable to load insights.');
      toast({ title: 'Insights unavailable', description: msg, variant: 'destructive' });
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      if (now - lastRefreshRef.current < 3000) return;
      lastRefreshRef.current = now;
      void refetchApplications(true);
      void refetchSavedJobs();
      void refetchJobs(true);
      void fetchInsights();
    };
    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refetchApplications, refetchJobs, refetchSavedJobs]);

  const appliedCount = (applications || []).filter(a => (a.status || '').toUpperCase() === 'APPLIED').length;
  const shortlistedCount = (applications || []).filter(a => (a.status || '').toUpperCase() === 'SHORTLISTED').length;
  const rejectedCount = (applications || []).filter(a => ['REJECTED', 'NOT_SHORTLISTED'].includes((a.status || '').toUpperCase())).length;

  const insightsApplied = insightsData?.stats?.applied;
  const insightsShortlisted = insightsData?.stats?.shortlisted;
  const insightsRejected = insightsData?.stats?.not_shortlisted ?? insightsData?.stats?.rejected;

  const appliedDisplay = typeof insightsApplied === 'number' ? insightsApplied : appliedCount;
  const shortlistedDisplay = typeof insightsShortlisted === 'number' ? insightsShortlisted : shortlistedCount;
  const rejectedDisplay = typeof insightsRejected === 'number' ? insightsRejected : rejectedCount;

  const appliedWeek = insightsData?.this_week?.applied ?? 0;
  const shortlistedWeek = insightsData?.this_week?.shortlisted ?? 0;
  const rejectedWeek = insightsData?.this_week?.not_shortlisted ?? 0;

  const isSuccessStatus = (s?: string) => ['SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED'].includes((s || '').toUpperCase());
  const isRejectedStatus = (s?: string) => ['REJECTED', 'NOT_SHORTLISTED'].includes((s || '').toUpperCase());
  
  // Sort applications by date
  const recentApps = [...applications].sort((a, b) => 
    new Date(b.applied_at || b.appliedDate).getTime() - new Date(a.applied_at || a.appliedDate).getTime()
  ).slice(0, 4);

  const handleUploadCV = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    setUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await candidateApi.uploadResume(formData);
      toast({ title: "Success", description: "Resume uploaded successfully!" });
    } catch {
      toast({ title: "Error", description: "Failed to upload resume. Please try again.", variant: "destructive" });
    } finally {
      setUploadingCV(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isJobSaved = (jobId: number) => savedJobs.some(s => s.id === jobId || s.job_id === jobId);

  const handleSaveJob = async (e: React.MouseEvent, job: Job) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleSave(job);
    } catch {
      toast({ title: "Error", description: "Failed to save job.", variant: "destructive" });
    }
  };

    const displayName = user?.username !== 'Account' ? user?.username : (user?.email?.split('@')[0] || 'User');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />

      {/* Modern Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Here is what's happening with your job search today.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, skills, companies..."
              onClick={() => router.push('/dashboard/jobs')}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border border-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Applied */}
          <div onClick={() => router.push('/dashboard/applications')} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Applied</h3>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold text-slate-900">{appliedDisplay}</span>
              <span className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +{appliedWeek} this week
              </span>
            </div>
          </div>

          {/* Card 2: Shortlisted */}
          <div onClick={() => router.push('/dashboard/applications?status=SHORTLISTED')} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Bookmark className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Shortlisted</h3>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold text-slate-900">{shortlistedDisplay}</span>
              <span className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +{shortlistedWeek} this week
              </span>
            </div>
          </div>

          {/* Card 3: Not Shortlisted */}
          <div onClick={() => router.push('/dashboard/applications?status=NOT_SHORTLISTED')} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center border border-rose-100">
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Not Shortlisted</h3>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold text-slate-900">{rejectedDisplay}</span>
              <span className="text-xs font-semibold text-rose-600 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +{rejectedWeek} this week
              </span>
            </div>
          </div>

          {/* Card 4: Profile Views */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                <Eye className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <h3 className="text-slate-500 font-medium text-sm">Profile Views</h3>
            <div className="flex items-end justify-between mt-1">
              <span className="text-3xl font-bold text-slate-900">{insightsData?.stats?.profile_views || 0}</span>
              <span className="text-xs font-semibold text-purple-600 mb-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +0 this week
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed: Recommended Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-900">Recommended for you</h2>
              <button onClick={() => router.push('/dashboard/jobs')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Explore all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
              {jobsLoading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="h-24 animate-pulse bg-slate-50" />
                ))
              ) : allJobs.slice(0, 6).map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => router.push(`/dashboard/jobs?id=${job.id}`)} 
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Company Logo with colored bg */}
                  {job.logo_url ? (
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                      <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-contain p-1.5" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 shadow-sm">
                      {job.company_name?.charAt(0) || 'C'}
                    </div>
                  )}

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-slate-900 group-hover:text-blue-700 transition-colors truncate">{job.job_title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{job.company_name}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location?.split(',')[0]}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.job_min_exp}-{job.job_max_exp} Yrs</span>
                      {job.job_min_salary != null && (
                        <span className="font-medium text-slate-600">{formatSalary(job.job_min_salary, job.job_max_salary || 0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Save & Apply */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={(e) => handleSaveJob(e, job)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <Bookmark className={`w-5 h-5 ${isJobSaved(job.id) ? 'fill-blue-600 text-blue-600' : 'text-slate-300'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Resume + Timeline */}
          <div className="lg:col-span-1 space-y-6">
            {/* Update Resume Card */}
            <div onClick={handleUploadCV} className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-6 rounded-2xl hover:border-blue-300 transition-all cursor-pointer shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-blue-100 shadow-sm">
                    {uploadingCV ? <Clock className="w-5 h-5 text-blue-600 animate-spin" /> : <UploadCloud className="w-5 h-5 text-blue-600" />}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Update Resume</h3>
                <p className="text-slate-600 text-sm">Upload your latest resume to boost visibility.</p>
              </div>
              <div className="flex items-center justify-between mt-4 text-blue-600 font-semibold text-sm bg-white/50 py-2 px-3 rounded-lg">
                <span>Upload CV</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Your Timeline</h2>
              {recentApps.length > 0 ? (
                <div className="space-y-6">
                  {recentApps.map((app, idx) => (
                    <div 
                      key={app.id} 
                      onClick={() => router.push('/dashboard/applications')}
                      className="group flex gap-4 cursor-pointer relative"
                    >
                      {/* Timeline line */}
                      {idx !== recentApps.length - 1 && (
                        <div className="absolute left-[19px] top-[30px] bottom-[-20px] w-[2px] bg-slate-100"></div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors
                        ${isSuccessStatus(app.status) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                          isRejectedStatus(app.status) ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'}`}
                      >
                        {isSuccessStatus(app.status) ? <CheckCircle className="w-5 h-5" /> : 
                         isRejectedStatus(app.status) ? <ArrowRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex-1 pb-2">
                        <h4 className="text-slate-900 font-semibold text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{app.job_title}</h4>
                        <p className="text-slate-500 text-xs mt-0.5">{app.company}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                            ${isSuccessStatus(app.status) ? 'bg-emerald-50 text-emerald-700' : 
                              isRejectedStatus(app.status) ? 'bg-rose-50 text-rose-700' :
                              'bg-slate-100 text-slate-600'}`}
                          >
                            {app.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => router.push('/dashboard/applications')}
                    className="w-full mt-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    View Full Details
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-sm">No applications</h3>
                  <p className="text-slate-500 text-xs mt-1">Apply to see your timeline.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
