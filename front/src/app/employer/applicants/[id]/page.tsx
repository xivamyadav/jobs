'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { ChevronLeft, FileText, CheckCircle2, XCircle, Clock, User, MessageSquare, Calendar, Mail, Phone, Briefcase, GraduationCap } from 'lucide-react';

interface ApplicationDetail {
    id: number;
    candidate_name: string;
    candidate_email: string;
    status: string;
    created_at: string;
    cover_letter?: string;
    employer_notes?: string;
    recruiter_notes?: string;
    job_title?: string;
    resume?: {
        resume_file?: string;
        headline?: string;
        summary?: string;
        total_experience?: number;
    } | null;
    skills?: string[];
    candidate_phone?: string;
}

const STATUS_OPTIONS = [
    { value: 'APPLIED', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
    { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-amber-100 text-amber-700' },
    { value: 'RESUME_VIEWED', label: 'Resume Viewed', color: 'bg-purple-100 text-purple-700' },
    { value: 'SHORTLISTED', label: 'Shortlisted', color: 'bg-green-100 text-green-700' },
    { value: 'NOT_SHORTLISTED', label: 'Not Shortlisted', color: 'bg-red-100 text-red-700' },
    { value: 'INTERVIEW', label: 'Interview', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'OFFER', label: 'Offer', color: 'bg-emerald-100 text-emerald-700' },
];

function StatusBadgeLarge({ status }: { status: string }) {
    const opt = STATUS_OPTIONS.find(o => o.value === status?.toUpperCase()) || STATUS_OPTIONS[0];
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${opt.color} border`}>
            {status?.replace('_', ' ')}
        </span>
    );
}

export default function ApplicantDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [app, setApp] = useState<ApplicationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteText, setNoteText] = useState('');

    useEffect(() => {
        const fetchApp = async () => {
            try {
                const res = await apiClient.get(`/application/${params.id}/`);
                const data = res.data?.data ?? res.data;
                setApp(data);
                setNoteText(data?.employer_notes || data?.recruiter_notes || '');
            } catch {
                toast.error('Failed to load applicant details');
                router.push('/employer/applicants');
            } finally {
                setLoading(false);
            }
        };
        fetchApp();
    }, [params.id, router]);

    const handleStatusChange = async (newStatus: string) => {
        if (!app) return;
        setUpdatingStatus(true);
        try {
            await apiClient.patch(`/application-status/${app.id}/`, { status: newStatus });
            setApp(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
        } catch {
            toast.error('Failed to update status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleViewResume = async () => {
        if (!app) return;
        try {
            const res = await apiClient.post(`/resume/${app.id}/`);
            const url = res.data?.resume?.resume_file || res.data?.resume_url;
            if (url) window.open(url, '_blank');
            else toast.info('No resume uploaded by candidate');
            setApp(prev => prev ? { ...prev, status: prev.status === 'APPLIED' ? 'RESUME_VIEWED' : prev.status } : null);
        } catch {
            toast.error('Failed to fetch resume');
        }
    };

    const handleSaveNote = async () => {
        if (!app) return;
        try {
            await apiClient.patch(`/application-notes/${app.id}/`, { employer_notes: noteText });
            setApp(prev => prev ? { ...prev, employer_notes: noteText } : null);
            toast.success('Note saved');
            setNoteOpen(false);
        } catch {
            toast.error('Failed to save note');
        }
    };

    if (loading) return (
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
            <div className="h-40 bg-white border border-gray-100 rounded-2xl" />
            <div className="h-24 bg-white border border-gray-100 rounded-2xl" />
        </div>
    );

    if (!app) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Applicant Profile</h1>
                    {app.job_title && (
                        <p className="text-sm text-gray-500 mt-0.5">
                            Applied for: <span className="font-semibold text-[#5B4DFF]">{app.job_title}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Candidate Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-[#5B4DFF]/10 border-2 border-[#5B4DFF]/20 flex items-center justify-center text-[#5B4DFF] font-bold text-2xl shrink-0">
                        {app.candidate_name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{app.candidate_name || 'Anonymous Candidate'}</h2>
                        {app.resume?.headline && (
                            <p className="text-sm text-[#5B4DFF] font-semibold mt-0.5">{app.resume.headline}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                            {app.candidate_email && (
                                <span className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> {app.candidate_email}
                                </span>
                            )}
                            {app.candidate_phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4" /> {app.candidate_phone}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString('en-GB') : '—'}
                            </span>
                            {app.resume?.total_experience !== undefined && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="w-4 h-4" /> {app.resume.total_experience} yrs exp
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skills */}
                {app.skills && app.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {app.skills.map((skill, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Status + Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Status</p>
                        <StatusBadgeLarge status={app.status} />
                    </div>
                    <button
                        onClick={handleViewResume}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold transition-colors"
                    >
                        <FileText className="w-4 h-4 text-[#5B4DFF]" />
                        View Resume
                    </button>
                </div>

                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        disabled={updatingStatus || app.status === 'SHORTLISTED'}
                        onClick={() => handleStatusChange('SHORTLISTED')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-bold hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Shortlist
                    </button>
                    <button
                        disabled={updatingStatus || app.status === 'NOT_SHORTLISTED'}
                        onClick={() => handleStatusChange('NOT_SHORTLISTED')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-4 h-4" /> Not Shortlisted
                    </button>
                    <button
                        disabled={updatingStatus || app.status === 'UNDER_REVIEW'}
                        onClick={() => handleStatusChange('UNDER_REVIEW')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold hover:bg-amber-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Clock className="w-4 h-4" /> Under Review
                    </button>
                    <button
                        disabled={updatingStatus || app.status === 'INTERVIEW'}
                        onClick={() => handleStatusChange('INTERVIEW')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-sm font-bold hover:bg-indigo-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <GraduationCap className="w-4 h-4" /> Interview
                    </button>
                </div>
            </div>

            {/* Resume Summary */}
            {app.resume?.summary && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Profile Summary</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{app.resume.summary}</p>
                </div>
            )}

            {/* Cover Letter */}
            {app.cover_letter && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Cover Letter</h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{app.cover_letter}</p>
                </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Recruiter Notes</h3>
                    <button
                        onClick={() => setNoteOpen(!noteOpen)}
                        className="flex items-center gap-1.5 text-sm text-[#5B4DFF] font-semibold hover:underline"
                    >
                        <MessageSquare className="w-4 h-4" /> {noteOpen ? 'Cancel' : 'Add / Edit Note'}
                    </button>
                </div>
                {(app.employer_notes || app.recruiter_notes) && !noteOpen && (
                    <p className="text-gray-600 text-sm italic bg-gray-50 rounded-xl p-3 border border-gray-100">
                        {app.employer_notes || app.recruiter_notes}
                    </p>
                )}
                {noteOpen && (
                    <div className="space-y-3">
                        <textarea
                            rows={4}
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Write your notes about this candidate..."
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B4DFF]/30 resize-none"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setNoteOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSaveNote} className="px-4 py-2 rounded-xl bg-[#5B4DFF] text-white font-semibold text-sm hover:bg-[#4a3dec]">Save Note</button>
                        </div>
                    </div>
                )}
                {!app.employer_notes && !app.recruiter_notes && !noteOpen && (
                    <p className="text-gray-400 text-sm italic">No notes yet.</p>
                )}
            </div>
        </div>
    );
}
