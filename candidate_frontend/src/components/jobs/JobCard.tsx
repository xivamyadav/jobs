"use client";

import React from 'react';
import { Job } from '@/lib/types/job';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Briefcase, Clock, Bookmark, CheckCircle2, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface JobCardProps {
  job: Job;
  isActive?: boolean;
  onClick?: () => void;
  onSave?: (e: React.MouseEvent) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

function parseSkills(skills: any[]): string[] {
  if (!skills || skills.length === 0) return [];
  const result: string[] = [];
  skills.forEach((skillObj) => {
    const raw = typeof skillObj === 'string' ? skillObj : (skillObj?.skill_name || skillObj?.name || '');
    const parts = raw.split(/\s+[Oo]r\s+/);
    parts.forEach((p: string) => { if (p.trim()) result.push(p.trim()); });
  });
  return result;
}

function formatSalary(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `${value}`;
}

export default function JobCard({ job, isActive, onClick, onSave, isSaved, isApplied }: JobCardProps) {
  const min_exp_yrs = job.job_min_exp;
  const max_exp_yrs = job.job_max_exp;
  const hasSalary = job.job_min_salary != null && job.job_max_salary != null;
  const skills = parseSkills(job.skills as any[]);

  const MAX_SKILLS = 6;
  const displaySkills = skills.slice(0, MAX_SKILLS);
  const remainingSkills = skills.length - MAX_SKILLS;

  return (
    <Card
      className={cn("cursor-pointer overflow-hidden transition-all")}
      onClick={onClick}
      style={{
        backgroundColor: isActive ? '#F5F8FF ' : 'white',
        borderRadius: 12,
        border: isActive ? '1.5px solid #2D31A6' : '1.5px solid #e5e7eb',
        boxShadow: isActive ? '0 6px 20px rgba(124,58,237,0.08)' : '0 1px 6px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease',
        opacity: isApplied ? 0.85 : 1,
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
          (e.currentTarget as HTMLElement).style.borderColor = '#2D31A6';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
          (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
        }
      }}
    >
      <CardContent >
        {/* Title + Bookmark */}
        <div className="flex justify-between items-start gap-2 mb-1 ">
          <div className="flex items-center gap-3">

            <div>
              <h3 className="font-bold text-md leading-tight text-gray-900 line-clamp-1">{job.job_title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-500">{job.company_name}</p>
                {isApplied && (
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Applied
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 shrink-0 text-gray-400"
            onClick={(e) => { e.stopPropagation(); onSave?.(e); }}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-indigo-600 text-indigo-600")} />
          </Button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5 text-sm font-semibold text-indigo-700">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-500" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-500" />
            {min_exp_yrs} - {max_exp_yrs} yrs
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-indigo-500" />
            {job.employment_type?.replace(/_/g, ' ')}
          </span>
          <span className="flex items-center gap-1 font-medium text-indigo-700">
            <IndianRupee className="w-3 h-3 text-indigo-500" />
            {job.job_min_salary} – {job.job_max_salary} LPA
          </span>

        </div>

        {/* Skills exactly like Naukri: bullet separated text */}
        {skills.length > 0 && (
          <div className="mt-3 text-[13px] text-gray-600 font-medium truncate flex items-center gap-2">
            {displaySkills.map((skill, idx) => (
              <React.Fragment key={idx}>
                <span>{skill}</span>
                {idx < displaySkills.length - 1 && <span className="text-gray-400">•</span>}
              </React.Fragment>
            ))}
            {remainingSkills > 0 && (
              <>
                <span className="text-gray-400">•</span>
                <span>+{remainingSkills}</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}