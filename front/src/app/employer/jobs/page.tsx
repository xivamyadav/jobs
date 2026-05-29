'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getCompanyJobs, deleteJob, pauseJob, publishJob } from '@/apis/job';
import apiClient from '@/lib/api-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus, Eye, Users, Pause, Trash2, Play, MapPin, Briefcase,
    Calendar, Filter, X, FileEdit, ChevronRight, ChevronLeft, CheckCircle2,
    ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

interface Job {
    id: number;
    title: string;
    job_code?: string;
    status: string;
    job_type?: string;
    location?: string;
    job_min_exp?: number;
    job_max_exp?: number;
    applications_count?: number;
    created_at?: string;
    published_at?: string;
}

function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase();
    if (s === 'published') return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 uppercase tracking-wide">
            Published
        </span>
    );
    if (s === 'paused') return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wide">
            Paused
        </span>
    );
    if (s === 'draft') return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
            Draft
        </span>
    );
    return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wide">
            {status}
        </span>
    );
}

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [pendingDraftsOpen, setPendingDraftsOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCompanyJobs({ page });
            // Unwrap paginated response: it comes as { success: true, data: { items: [...], pagination: {...} } }
            // Or fallback to results if it's standard DRF
            const dataNode = res?.data ?? res;
            const jobList = dataNode?.items ?? dataNode?.results ?? res?.results ?? res?.data?.results ?? res?.data ?? res;
            const pagination = dataNode?.pagination ?? res?.pagination;
            setTotalItems(pagination?.count ?? (Array.isArray(jobList) ? jobList.length : 0));
            setTotalPages(pagination?.total_pages ?? 1);
            setJobs(Array.isArray(jobList) ? jobList : []);
        } catch {
            toast.error('Failed to load jobs. Please refresh.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);
    useEffect(() => { setPage(1); }, [searchQuery, statusFilter, typeFilter, sortBy]);
    useEffect(() => {
        if (pendingDraftsOpen) {
            fetchJobs();
        }
    }, [pendingDraftsOpen, fetchJobs]);
    useEffect(() => {
        const handleFocus = () => fetchJobs();
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [fetchJobs]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        setDeletingId(id);
        try {
            await deleteJob(String(id));
            toast.success('Job deleted');
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch { toast.error('Failed to delete job'); }
        finally { setDeletingId(null); }
    };

    const handlePausePublish = async (job: Job) => {
        setTogglingId(job.id);
        try {
            if (getStatus(job) === 'published') {
                await pauseJob(String(job.id));
                toast.success('Job paused → moved to Inactive');
            } else {
                await publishJob(String(job.id));
                toast.success('Job published → now Active');
            }
            fetchJobs();
        } catch { toast.error('Failed to update job status'); }
        finally { setTogglingId(null); }
    };

    const handleDeleteDraft = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteJob(String(id));
            toast.success('Draft deleted');
            setJobs(prev => prev.filter(j => j.id !== id));
        } catch { toast.error('Failed to delete draft'); }
        finally { setDeletingId(null); }
    };

    const getStatus = (job: Job) => (job.status || '').toLowerCase();
    const isDraft = (job: Job) => getStatus(job) === 'draft';
    const isPublished = (job: Job) => getStatus(job) === 'published';
    const isPaused = (job: Job) => getStatus(job) === 'paused';

    // Stats
    const totalJobs = totalItems || jobs.length;
    const activeJobs = jobs.filter(isPublished);
    const inactiveJobs = jobs.filter(isPaused);
    const draftJobs = jobs.filter(isDraft);
    const totalApplicants = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

    // Filter
    const filteredJobs = jobs.filter(job => {
        if (isDraft(job)) return false; // Drafts only in modal
        const jobStatus = getStatus(job);
        const matchSearch = !searchQuery
            || job.title?.toLowerCase().includes(searchQuery.toLowerCase())
            || (typeof job.location === 'string' && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchStatus = statusFilter === 'all'
            || (statusFilter === 'active' && jobStatus === 'published')
            || (statusFilter === 'inactive' && jobStatus === 'paused')
            || jobStatus === statusFilter;
        const matchType = typeFilter === 'all' || job.job_type === typeFilter;
        return matchSearch && matchStatus && matchType;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        if (sortBy === 'oldest') return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        return 0;
    });

    const clearFilters = () => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); setSortBy('newest'); };

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

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">All Posted Jobs</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {totalJobs} jobs · {activeJobs.length} published
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Pending Drafts */}
                    <button
                        onClick={() => setPendingDraftsOpen(true)}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border border-[#5B4DFF]/20 bg-[#F4F2FF] text-[#5B4DFF] font-bold text-sm hover:bg-[#EDE9FE] transition-colors shadow-sm"
                    >
                        Pending Drafts
                        <span className="w-6 h-6 rounded-full bg-[#E0DDFD] text-[#5B4DFF] text-[11px] font-extrabold flex items-center justify-center">
                            {draftJobs.length}
                        </span>
                    </button>
                    <Link
                        href="/employer/jobs/new"
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#5B4DFF] hover:bg-[#4a3dec] text-white font-bold text-sm transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Post New Job
                    </Link>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-3xl font-extrabold text-gray-900">{totalJobs}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Total Jobs</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-3xl font-extrabold text-green-600">{activeJobs.length}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Active Jobs</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-3xl font-extrabold text-amber-500">{inactiveJobs.length}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Inactive Jobs</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-3xl font-extrabold text-gray-900">{totalApplicants}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Total Applicants</p>
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-gray-600 font-semibold text-sm">
                    <Filter className="w-4 h-4" /> Filters
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search</label>
                        <input
                            type="text"
                            placeholder="Title, location..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/30 focus:border-[#5B4DFF]"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/30">
                            <option value="all">All</option>
                            <option value="active">Active (Published)</option>
                            <option value="inactive">Inactive (Paused)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Type</label>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/30">
                            <option value="all">All</option>
                            <option value="full_time">Full-Time</option>
                            <option value="part_time">Part-Time</option>
                            <option value="contract">Contract</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sort</label>
                        <div className="flex gap-2">
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/30">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                            <button onClick={clearFilters}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-semibold whitespace-nowrap">
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Job List ── */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
                    <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No jobs found.</p>
                    <Link href="/employer/jobs/new"
                        className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#5B4DFF] text-white rounded-xl text-sm font-bold hover:bg-[#4a3dec] transition-colors">
                        <Plus className="w-4 h-4" /> Post your first job
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            <div className="flex items-start justify-between p-5 gap-4">
                                {/* Left: Job Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        {job.job_code && (
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                {job.job_code}
                                            </span>
                                        )}
                                        <h3 className="font-extrabold text-gray-900 text-base">{job.title}</h3>
                                        <StatusBadge status={job.status} />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {typeof job.location === 'string' ? job.location : 'Remote'}
                                            </span>
                                        )}
                                        {job.job_type && (
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                {job.job_type?.replace('_', '-')}
                                            </span>
                                        )}
                                        {(job.job_min_exp !== undefined || job.job_max_exp !== undefined) && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {job.job_min_exp ?? 0} - {job.job_max_exp ?? 0} Yrs ({(job.job_min_exp ?? 0) === 0 ? 'Fresher' : 'Exp'})
                                            </span>
                                        )}
                                        <button
                                            onClick={() => router.push(`/employer/applicants?job=${job.id}`)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#5B4DFF] text-[11px] font-bold hover:bg-[#E0E7FF] transition-colors ml-2"
                                        >
                                            <Users className="w-3.5 h-3.5" />
                                            {job.applications_count || 0} applications ↗
                                        </button>
                                    </div>
                                    {job.created_at && (
                                        <p className="text-[11px] text-gray-400 mt-2">
                                            Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>

                                {/* Right: Action Buttons */}
                                <div className="flex flex-col gap-2 shrink-0 min-w-[120px]">
                                    {/* View */}
                                    <Link
                                        href={`/employer/jobs/${job.id}/edit`}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors w-full"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> View
                                    </Link>
                                    {/* Candidates */}
                                    <button
                                        onClick={() => router.push(`/employer/applicants?job=${job.id}`)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#5B4DFF] text-white text-xs font-bold hover:bg-[#4a3dec] transition-colors w-full"
                                    >
                                        <Users className="w-3.5 h-3.5" /> Candidates
                                    </button>
                                    {/* Pause / Publish */}
                                    <button
                                        disabled={togglingId === job.id}
                                        onClick={() => handlePausePublish(job)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                                    >
                                        {job.status === 'published'
                                            ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                                            : <><Play className="w-3.5 h-3.5" /> Publish</>
                                        }
                                    </button>
                                    {/* Delete */}
                                    <button
                                        disabled={deletingId === job.id}
                                        onClick={() => handleDelete(job.id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 text-xs font-bold hover:bg-gray-50 transition-colors w-full disabled:opacity-50"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                                onClick={() => setPage(item as number)}
                                className={`h-9 w-9 rounded-full text-sm font-semibold border transition-colors ${
                                    page === item ? 'bg-[#5B4DFF] text-white border-[#5B4DFF]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}
                    <button
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ── Pending Drafts Modal ── */}
            {pendingDraftsOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        {/* Modal Header */}
                        <div className="flex items-start justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">Pending Drafts</h2>
                                <p className="text-sm text-gray-500 mt-0.5">Jobs you started but haven't published yet.</p>
                            </div>
                            <button
                                onClick={() => setPendingDraftsOpen(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Draft List */}
                        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                            {draftJobs.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-6">No pending drafts.</p>
                            ) : draftJobs.map(job => (
                                <div key={job.id} className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-[#5B4DFF]/30 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase">Draft</span>
                                            {job.created_at && (
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-sm">{job.title}</h3>
                                        {job.job_type && (
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Briefcase className="w-3 h-3" />
                                                {job.job_type?.replace('_', '-')}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link
                                            href={`/employer/jobs/${job.id}/edit`}
                                            onClick={() => setPendingDraftsOpen(false)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5B4DFF]/30 bg-[#F4F2FF] text-[#5B4DFF] text-xs font-extrabold hover:bg-[#EDE9FE] transition-colors"
                                        >
                                            <FileEdit className="w-3.5 h-3.5" /> Continue
                                        </Link>
                                        <button
                                            disabled={deletingId === job.id}
                                            onClick={() => handleDeleteDraft(job.id)}
                                            className="p-2 rounded-xl border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setPendingDraftsOpen(false)}
                                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
