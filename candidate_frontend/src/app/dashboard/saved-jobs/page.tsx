"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSavedJobs, useJobDetails, useApplications } from '@/hooks/jobs/use-jobs';
import { Job } from '@/lib/types/job';
import JobCard from '@/components/jobs/JobCard';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import JobDetails from '@/components/jobs/JobDetail';
import ApplyModal from '@/components/jobs/ApplyModal';
import { useToast } from '@/hooks/use-toast';

export default function SavedJobsPage() {
  const { toast } = useToast();
  const { data: savedJobs, loading, toggleSave } = useSavedJobs();
  const { apply } = useApplications();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const { data: jobDetail, loading: detailLoading } = useJobDetails(selectedJobId);
  const [appliedOverrides, setAppliedOverrides] = useState<Set<number>>(new Set());

  const savedIds = useMemo(
    () => new Set(savedJobs.map((j) => j.job_id ?? j.id)),
    [savedJobs]
  );

  const isApplied = useCallback(
    (job: { id?: number; application_status?: string | null }) => {
      if (job?.id && appliedOverrides.has(job.id)) return true;
      return Boolean(job?.application_status);
    },
    [appliedOverrides]
  );

  useEffect(() => {
    if (savedJobs.length === 0) {
      setSelectedJobId(null);
      return;
    }
    const exists = savedJobs.some(job => (job.job_id ?? job.id) === selectedJobId);
    if (!selectedJobId || !exists) {
      setSelectedJobId(savedJobs[0].job_id ?? savedJobs[0].id);
    }
  }, [savedJobs, selectedJobId]);

  const handleApply = async (formData: any) => {
    if (!jobDetail) return;
    try {
      await apply(jobDetail.id, formData);
      setAppliedOverrides((prev) => new Set(prev).add(jobDetail.id));
      if (savedIds.has(jobDetail.id)) {
        await toggleSave(jobDetail);
      }
      setApplyModalOpen(false);
      toast({
        title: "Application Sent!",
        description: `You've successfully applied for ${jobDetail.job_title}.`,
      });
    } catch {
      toast({
        title: "Submission Failed",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-secondary/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <div className="min-h-full bg-slate-50/50 p-6 rounded-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground">Jobs you've bookmarked for later.</p>
        </header>
        <div className="text-center py-24 border-2 border-dashed rounded-2xl bg-white/80">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved jobs yet</h2>
          <p className="text-muted-foreground mb-8">
            Start exploring jobs and bookmark the ones you like.
          </p>
          <Button asChild>
            <Link href="/dashboard/jobs">Browse Jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full bg-slate-50/50 p-6 rounded-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="text-muted-foreground">
            {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} bookmarked
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6 items-start">
          <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {savedJobs.map((job) => {
              const jobKey = job.job_id ?? job.id;
              const applied = isApplied(job);
              const saved = savedIds.has(jobKey);
              return (
                <JobCard
                  key={jobKey}
                  job={job as unknown as Job}
                  isActive={selectedJobId === jobKey}
                  isSaved={saved}
                  isApplied={applied}
                  onClick={() => setSelectedJobId(jobKey)}
                  onSave={() => toggleSave(job)}
                />
              );
            })}
          </div>

          <div className="sticky top-4 max-h-[calc(100vh-220px)]">
            <JobDetails
              job={jobDetail}
              loading={detailLoading}
              isSaved={jobDetail ? savedIds.has(jobDetail.id) : false}
              isApplied={jobDetail ? isApplied(jobDetail) : false}
              onApply={() => setApplyModalOpen(true)}
              onSave={toggleSave}
            />
          </div>
        </div>
      </div>

      <ApplyModal
        job={jobDetail}
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        onSubmit={handleApply}
      />
    </>
  );
}
