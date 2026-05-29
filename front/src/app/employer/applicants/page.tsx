'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { ChevronDown, User, FileText, CheckCircle2, XCircle, Clock, ChevronRight, MessageSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface Job {
    id: number;
    title: string;
    applications_count?: number;
}

interface Applicant {
    id: number;
    candidate_name: string;
    candidate_email: string;
    status: string;
    created_at: string;
    resume?: string | null;
    employer_notes?: string;
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toUpperCase();
    if (s === 'SHORTLISTED') return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> SHORTLISTED
        </span>
    );
    if (s === 'NOT_SHORTLISTED') return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" /> NOT SHORTLISTED
        </span>
    );
    if (s === 'UNDER_REVIEW') return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            <Clock className="w-3.5 h-3.5" /> UNDER REVIEW
        </span>
    );
    if (s === 'RESUME_VIEWED') return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
            <FileText className="w-3.5 h-3.5" /> RESUME VIEWED
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            <User className="w-3.5 h-3.5" /> {status || 'APPLIED'}
        </span>
    );
}

function ApplicantsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobFromUrl = searchParams.get('job');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [appPage, setAppPage] = useState(1);
    const [appTotalPages, setAppTotalPages] = useState(1);
    const [appTotalItems, setAppTotalItems] = useState(0);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Fetch all company jobs
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await apiClient.get('/jobs/', { params: { page_size: 100 } });
                const jobList = res.data?.data?.items ?? res.data?.items ?? res.data?.results ?? res.data ?? [];
                const list = Array.isArray(jobList) ? jobList : [];
                setJobs(list);
                // Auto-select from URL param or first job
                if (jobFromUrl) {
                    setSelectedJobId(Number(jobFromUrl));
                } else if (list.length > 0) {
                    setSelectedJobId(list[0].id);
                }
            } catch {
                toast.error('Failed to load jobs');
            } finally {
                setLoadingJobs(false);
            }
        };
        fetchJobs();
    }, [jobFromUrl]);

    // Fetch applicants when job changes
    const fetchApplicants = useCallback(async () => {
        if (!selectedJobId) { setApplicants([]); return; }
        setLoadingApplicants(true);
        try {
            const res = await apiClient.get(`/job-applicants/${selectedJobId}/`, {
                params: { show_all: 'true', page: appPage }
            });
            const dataNode = res.data?.data ?? res.data;
            const apps = dataNode?.items ?? dataNode?.results ?? res.data?.results ?? res.data ?? [];
            const pagination = dataNode?.pagination ?? res.data?.pagination;
            const totalPages = pagination?.total_pages ?? 1;
            const totalItems = pagination?.count ?? (Array.isArray(apps) ? apps.length : 0);
            setApplicants(Array.isArray(apps) ? apps : []);
            setAppTotalPages(totalPages);
            setAppTotalItems(totalItems);
        } catch {
            toast.error('Failed to load applicants');
            setApplicants([]);
        } finally {
            setLoadingApplicants(false);
        }
    }, [selectedJobId, appPage]);

    useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

    useEffect(() => {
        setAppPage(1);
    }, [selectedJobId]);

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

    // Quick status update directly from list (without opening profile)
    const handleQuickStatus = async (e: React.MouseEvent, appId: number, newStatus: string) => {
        e.stopPropagation(); // Don't open profile
        setUpdatingId(appId);
        try {
            await apiClient.patch(`/application-status/${appId}/`, { status: newStatus });
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
            toast.success(`Marked as ${newStatus.replace('_', ' ')}`);
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const selectedJob = jobs.find(j => j.id === selectedJobId);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/employer/dashboard" className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-gray-100">
                    ‹
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Applicants</h1>
                    {selectedJob && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            For job: <span className="font-semibold text-[#5B4DFF]">{selectedJob.title}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Job Selector Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Job to View Applicants
                </label>
                {loadingJobs ? (
                    <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ) : jobs.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        No jobs posted yet.{' '}
                        <Link href="/employer/jobs/new" className="text-[#5B4DFF] font-semibold hover:underline">Post a job</Link>
                    </p>
                ) : (
                    <div className="relative">
                        <select
                            value={selectedJobId ?? ''}
                            onChange={e => setSelectedJobId(Number(e.target.value))}
                            className="w-full appearance-none bg-white border border-black rounded-lg px-4 py-2.5 pr-10 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all cursor-pointer"
                        >
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    {job.title} ({job.applications_count ?? 0} applicants)
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Applicants List */}
            {loadingApplicants ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : applicants.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold">No applicants for this job yet.</p>
                    <p className="text-gray-400 text-sm mt-1">Candidates who apply will appear here.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {applicants.map(app => (
                        <div
                            key={app.id}
                            onClick={() => router.push(`/employer/applicants/${app.id}`)}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-[#5B4DFF]/30 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Left Side */}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base">
                                        {app.candidate_name || 'Anonymous Candidate'}
                                    </h3>
                                    {app.candidate_email && (
                                        <p className="text-sm text-gray-600 mt-1">Email: {app.candidate_email}</p>
                                    )}
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB') : '—'}
                                    </p>
                                    <div className="mt-3">
                                        <StatusBadge status={app.status} />
                                    </div>
                                </div>

                                {/* Right Side: Actions */}
                                <div className="flex flex-col gap-2 shrink-0 w-[160px]" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(app.resume) window.open(app.resume, '_blank'); else toast.error('No resume found'); }}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#E6EFFF] text-[#2563EB] font-bold rounded-lg text-xs hover:bg-[#DBEAFE] transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> View Resume
                                    </button>
                                    <select
                                        value={app.status || 'APPLIED'}
                                        onChange={e => {
                                            const newStatus = e.target.value;
                                            handleQuickStatus(e as any, app.id, newStatus);
                                        }}
                                        disabled={updatingId === app.id}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="APPLIED">Applied</option>
                                        <option value="UNDER_REVIEW">Under Review</option>
                                        <option value="SHORTLISTED">Shortlisted</option>
                                        <option value="INTERVIEW">Interview</option>
                                        <option value="NOT_SHORTLISTED">Not Shortlisted</option>
                                    </select>
                                    <button className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 bg-white text-gray-600 font-bold rounded-lg text-xs hover:bg-gray-50 transition-colors">
                                        <MessageSquare className="w-3.5 h-3.5" /> Note
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {appTotalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                        disabled={appPage <= 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    {getPageItems(appPage, appTotalPages).map((item, idx) =>
                        item === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => setAppPage(item as number)}
                                className={`h-9 w-9 rounded-full text-sm font-semibold border transition-colors ${
                                    appPage === item ? 'bg-[#5B4DFF] text-white border-[#5B4DFF]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setAppPage((p) => Math.min(appTotalPages, p + 1))}
                        disabled={appPage >= appTotalPages}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function ApplicantsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
            <ApplicantsPageContent />
        </Suspense>
    );
}
