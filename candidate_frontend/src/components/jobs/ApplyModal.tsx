"use client";

import React, { useState, useEffect } from 'react';
import { Job } from '@/lib/types/job';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Building2, MapPin, IndianRupee, Briefcase } from 'lucide-react';

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<any>;
}

export default function ApplyModal({ job, open, onOpenChange, onSubmit }: ApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset success state when modal is opened/closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => setIsSuccess(false), 300);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const success = await onSubmit({ job_id: job.id });
      if (success !== false) {
        setIsSuccess(true);
      }
    } catch (error) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-10 text-center bg-white relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-green-500" />
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h2>
            <p className="text-gray-600 mb-6 max-w-sm">
              You have successfully applied for <strong>{job?.job_title}</strong> at <strong>{job?.company_name}</strong>.
            </p>
            <Button 
              onClick={() => onOpenChange(false)} 
              className="w-full sm:w-auto px-8 rounded-full bg-gray-900 hover:bg-gray-800 text-white"
            >
              Done
            </Button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold text-gray-900">Confirm Application</DialogTitle>
              <DialogDescription className="text-gray-500 mt-2">
                Please review the job details before submitting your application.
              </DialogDescription>
            </DialogHeader>

            {job && (
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mb-8 space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg">{job.job_title}</h3>
                <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-700">{job.company_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-3 sm:gap-6 mt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.location || 'Remote'}</span>
                    </div>
                    {(job.job_min_exp !== undefined || job.job_max_exp !== undefined) && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{job.job_min_exp || 0} - {job.job_max_exp || 'Any'} Yrs</span>
                      </div>
                    )}
                    {(job.job_min_salary !== undefined || job.job_max_salary !== undefined) && (
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4 text-gray-400" />
                        <span>
                          {job.job_min_salary ? `${job.job_min_salary}` : 'Not Disclosed'} 
                          {job.job_max_salary ? ` - ${job.job_max_salary} LPA` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-3 sm:space-x-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/2 rounded-full border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full sm:w-1/2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {submitting ? "Applying..." : "Confirm & Apply"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
