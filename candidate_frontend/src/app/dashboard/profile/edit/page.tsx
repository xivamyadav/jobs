"use client";

import { useEffect, useState, useCallback } from 'react';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { candidateApi } from '@/apis/user/index';
import type { Candidate, Certification, Education, Experience, Skill, Resume } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

interface ProfileData {
  basicInfo: Candidate;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  resume: Resume | null;
}

type PageState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: ProfileData };

function toArray<T>(res: any): T[] {
  const data = res?.data ?? res;
  if (Array.isArray(data)) return data as T[];
  if (data?.items && Array.isArray(data.items)) return data.items as T[];
  if (data?.results && Array.isArray(data.results)) return data.results as T[];
  return [];
}

function resolveResume(resumes: any): Resume | null {
  const data = resumes?.data ?? resumes;
  let arr: Resume[] = [];
  if (Array.isArray(data)) arr = data;
  else if (data?.results && Array.isArray(data.results)) arr = data.results;
  else if (data && typeof data === 'object') arr = [data];
  return arr.find((r) => r.is_active) ?? arr[0] ?? null;
}

// Flatten the nested location object and normalize field names
// API returns email/phone_number, but form expects primary_email/primary_phone
function flattenBasicInfo(raw: any): Candidate {
  const data = raw?.data ?? raw;
  const loc = data.location;
  return {
    ...data,
    email: data.email || data.primary_email,
    phone_number: data.phone_number || data.primary_phone,
    primary_email: data.email || data.primary_email,
    primary_phone: data.phone_number || data.primary_phone,
    location_id: loc?.id ?? data.location_id ?? undefined,
    location_text: loc
      ? [loc.city, loc.state, loc.country].filter(Boolean).join(', ')
      : data.location_text ?? '',
  };
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded-lg mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4 rounded-2xl border bg-card p-6">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto" />
          <div className="h-5 w-32 bg-muted rounded mx-auto" />
          <div className="h-4 w-24 bg-muted rounded mx-auto" />
          <div className="space-y-2 pt-4">
            {[80, 60, 70].map((w, i) => (
              <div key={i} className="h-3 bg-muted rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 space-y-3">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="space-y-2">
                {[90, 75, 55].map((w, j) => (
                  <div key={j} className="h-3 bg-muted rounded" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">Failed to load profile</p>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition"
      >
        Try again
      </button>
    </div>
  );
}

export default function ProfileEditPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' });

  const fetchProfile = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [basicInfo, experience, education, skills, resumes, certRaw] = await Promise.all([
        candidateApi.getBasicInfo(),
        candidateApi.getExperiences(),
        candidateApi.getEducations(),
        candidateApi.getSkills(),
        candidateApi.getResumes(),
        candidateApi.getCertifications().catch(() => []),
      ]);

      setState({
        status: 'ready',
        data: {
          basicInfo: flattenBasicInfo(basicInfo),
          experience: toArray<Experience>(experience),
          education: toArray<Education>(education),
          skills: toArray<Skill>(skills),
          certifications: toArray<Certification>(certRaw),
          resume: resolveResume(resumes),
        },
      });
    } catch (err: any) {
      const raw: string = err?.message ?? 'Something went wrong.';
      const message = raw.startsWith('{')
        ? 'Server returned an error. Please try again.'
        : raw;
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  if (state.status === 'loading') return <ProfileSkeleton />;
  if (state.status === 'error') return <ProfileError message={state.message} onRetry={fetchProfile} />;

  return (
    <main className="min-h-screen bg-background">
      <ProfileEditor initialData={state.data} />
    </main>
  );
}
