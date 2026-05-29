"use client";

import React, { Suspense } from 'react';
import { useApplications } from '@/hooks/jobs/use-jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Calendar, MapPin, IndianRupee, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function ApplicationsContent() {
  const router = useRouter();
  const { data: applications, loading, page, totalPages, goToPage } = useApplications();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status'); // e.g. "SHORTLISTED", "NOT_SHORTLISTED"

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (min == null && max == null) return 'Salary not disclosed';
    const minNum = Number(min ?? 0);
    const maxNum = Number(max ?? minNum);
    if ((currency || 'INR') === 'INR') return `${minNum} - ${maxNum} LPA`;
    return `${minNum} - ${maxNum} ${currency || ''}`.trim();
  };

  const formatExperience = (min?: number, max?: number) => {
    if (min == null && max == null) return 'Exp not specified';
    const minNum = min ?? 0;
    const maxNum = max ?? minNum;
    if (minNum === 0 && maxNum === 0) return 'Fresher';
    if (minNum === maxNum) return `${minNum} Yr${minNum === 1 ? '' : 's'}`;
    return `${minNum} - ${maxNum} Yrs`;
  };

  const getPageItems = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | string)[] = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  };

  const filteredApps = statusFilter
    ? (applications || []).filter(app => app.status?.toUpperCase() === statusFilter.toUpperCase())
    : (applications || []);

  const formatStatusLabel = (status: string) =>
    (status || '')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase().replace(/_/g, ' ').trim();
    const base = 'inline-flex items-center justify-center min-w-[120px] h-6 px-2.5 text-xs font-semibold rounded-full border';
    switch (s) {
      case 'applied':
        return <Badge variant="secondary" className={`${base} bg-indigo-100 text-indigo-700 border-indigo-200`}>Applied</Badge>;
      case 'under review':
        return <Badge variant="secondary" className={`${base} bg-amber-100 text-amber-700 border-amber-200`}>Under Review</Badge>;
      case 'resume viewed':
        return <Badge variant="secondary" className={`${base} bg-sky-100 text-sky-700 border-sky-200`}>Resume Viewed</Badge>;
      case 'shortlisted':
        return <Badge variant="secondary" className={`${base} bg-emerald-100 text-emerald-700 border-emerald-200`}>Shortlisted</Badge>;
      case 'not shortlisted':
        return <Badge variant="secondary" className={`${base} bg-red-100 text-red-700 border-red-200`}>Not Shortlisted</Badge>;
      case 'interview':
        return <Badge variant="secondary" className={`${base} bg-purple-100 text-purple-700 border-purple-200`}>Interview</Badge>;
      case 'offer':
        return <Badge variant="secondary" className={`${base} bg-green-100 text-green-700 border-green-200`}>Offer</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className={`${base} bg-red-100 text-red-700 border-red-200`}>Rejected</Badge>;
      default:
        return <Badge variant="secondary" className={`${base} bg-slate-100 text-slate-700 border-slate-200`}>{formatStatusLabel(status)}</Badge>;
    }
  };

  return (
    <div className="min-h-full bg-slate-50/50 p-6 rounded-3xl">

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Applications</h1>
        <p className="text-muted-foreground">
          {statusFilter ? `Showing: ${statusFilter.replace('_', ' ')} applications` : 'Keep track of your job application pipeline and next steps.'}
        </p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-secondary/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredApps?.length > 0 ? (
        <div className="space-y-4">
          {filteredApps.map(app => (
            /* Card update: Sirf card ke around blue border aur halka tint rakha hai */
            <Card
              key={app.id}
              className="shadow-sm border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 transition-all overflow-hidden cursor-pointer"
              onClick={() => {
                if (app.job_id) router.push(`/dashboard/jobs?id=${app.job_id}`);
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(220px,1.6fr)_180px_180px_160px] md:items-center">
                  <div className="flex items-center gap-4">
                    {/* Icon container white to pop on tinted card */}
                    <div className="w-14 h-14 bg-white border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      <Briefcase className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold leading-tight">{app.job_title}</h3>
                      <p className="text-sm font-medium text-indigo-600">{app.company_name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 font-semibold">
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {app.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatExperience(app.job_min_exp, app.job_max_exp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          {formatSalary(app.job_min_salary, app.job_max_salary, app.currency)}
                        </span>
                        {app.posted_by_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {app.posted_by_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Applied Date</p>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Date N/A'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Current Status</p>
                    <div className="pt-0.5">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                  <div className="space-y-1 hidden md:block">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Last Update</p>
                    <p className="text-sm font-semibold text-slate-500 italic">
                      {app.updated_at ? new Date(app.updated_at).toLocaleDateString() : 'Just now'}
                    </p>
                  </div>

                  {/* <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="gap-2 bg-white hover:bg-blue-50 border-blue-100">
                       <Info className="w-4 h-4" />
                       Status Info
                     </Button>
                     
                     <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" asChild>
                       <Link href={`/dashboard/jobs?id=${app.job_id || app.job}`}>
                         View Details
                         <ChevronRight className="w-4 h-4" />
                       </Link>
                     </Button>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-white/80">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Applied jobs yet</h2>
          <p className="text-muted-foreground mb-8">
            Apply to the ones you like.
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {getPageItems(page, totalPages).map((item, idx) =>
            item === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
            ) : (
              <button
                key={item}
                onClick={() => goToPage(item as number)}
                className={`h-9 w-9 rounded-full text-sm font-semibold border transition-colors ${
                  page === item ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="min-h-full bg-slate-50/50 p-6 rounded-3xl" />}>
      <ApplicationsContent />
    </Suspense>
  );
}
