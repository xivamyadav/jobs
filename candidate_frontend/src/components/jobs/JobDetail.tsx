import { Job } from '@/lib/types/job';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  File,
  ArrowUpRight,
  Circle,
  MapPin,
  IndianRupee,
  Star,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { JSX } from 'react';

interface JobDetailsProps {
  job: Job | null;
  loading?: boolean;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
  tab?: string;
}

function parseSkills(skills: any[]): string[] {
  if (!skills || skills.length === 0) return [];
  const result: string[] = [];
  skills.forEach((skillObj) => {
    const raw = typeof skillObj === 'string' ? skillObj : skillObj?.skill_name || skillObj?.name || '';
    const parts = raw.split(/\s+[Oo]r\s+/);
    parts.forEach((p: string) => {
      if (p.trim()) result.push(p.trim());
    });
  });
  return result;
}

function normalizeArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof val !== 'string') return [];
  const str = val.trim();
  if (!str.startsWith('[')) return str ? [str] : [];
  
  // Basic array parsing if it's a stringified list
  try {
    const parsed = JSON.parse(str.replace(/'/g, '"'));
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}

  return [str.replace(/[\[\]]/g, '')];
}

function formatSalary(value: number): string {
  if (value >= 100000) return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)} LPA`;
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `${value} LPA`;
}

const APPLICATION_STATUSES = [
  { label: 'Applied', done: true },
  { label: 'Under Review', done: false },
  { label: 'Interview', done: false },
  { label: 'Decision', done: false },
] as const;

export default function JobDetail({
  job,
  loading,
  onApply,
  onSave,
  isSaved,
  isApplied,
  tab = 'active',
}: JobDetailsProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!job) {
    const icons: Record<string, JSX.Element> = {
      active: <Briefcase className="w-12 h-12 text-gray-300" />,
      saved: <Bookmark className="w-12 h-12 text-gray-300" />,
      application: <File className="w-12 h-12 text-gray-300" />,
    };
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
            {icons[tab] ?? <Briefcase className="w-12 h-12 text-gray-300" />}
        </div>
        <p className="text-gray-500 font-medium text-lg">Select a job to view details</p>
      </div>
    );
  }

  const minExpYears = job.job_min_exp ?? 0;
  const maxExpYears = job.job_max_exp ?? minExpYears;
  const minSalary = job.job_min_salary != null ? Number(job.job_min_salary) : null;
  const maxSalary = job.job_max_salary != null ? Number(job.job_max_salary) : null;
  const skills = parseSkills(job.skills as any[]);
  const description = job.description || (job as any).job_overview || '';
  const responsibilities = normalizeArray(job.responsibilities || (job as any).key_responsibilities || '');
  const qualifications = normalizeArray((job as any).qualifications || (job as any).qualification || '');

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 h-full p-6 lg:p-8 space-y-6">

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex justify-between items-start gap-6">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-2">{job.job_title}</h1>
            <div className="flex items-center gap-2 mb-6">
              {job.company_name && (
                <a href={`/dashboard/company/${job.company_id || 1}`} className="text-gray-700 hover:text-blue-600 font-medium text-base transition-colors">
                  {job.company_name}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm font-medium mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span>{minExpYears} - {maxExpYears} years</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-gray-400" />
                <span>{minSalary != null ? `${minSalary} - ${maxSalary || 0} LPA` : 'Not Disclosed'}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{job.location || 'Remote'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400"/> 
                        Posted: <strong className="text-gray-700 font-medium">
                            {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'Recently'}
                        </strong>
                    </span>
                </div>
                
                <div className="flex items-center gap-3">
                    {tab !== 'application' && (
                        <Button
                            variant="outline"
                            onClick={() => onSave(job)}
                            className={`rounded-full px-6 font-semibold transition-all ${isSaved ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'text-gray-700 hover:text-blue-600 border-gray-300 hover:border-blue-300'}`}
                        >
                            {isSaved ? 'Saved' : 'Save'}
                        </Button>
                    )}
                    {tab !== 'application' && (
                        <Button
                            onClick={() => onApply(job)}
                            disabled={isApplied}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 font-semibold shadow-sm"
                        >
                            {isApplied ? 'Applied' : 'Apply'}
                        </Button>
                    )}
                    {tab === 'application' && (
                        <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 font-semibold shadow-sm">
                            View Status
                        </Button>
                    )}
                </div>
            </div>
          </div>

          <div className="hidden lg:flex shrink-0 w-20 h-20 rounded-2xl bg-white border border-gray-100 shadow-sm items-center justify-center overflow-hidden">
            {job.logo_url ? (
              <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl font-bold text-blue-600">{job.company_name?.charAt(0) || 'C'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Application Tracker (If application tab) */}
      {tab === 'application' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Application Tracker</h3>
          <div className="flex justify-between items-center relative">
             <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full" />
             {APPLICATION_STATUSES.map((step, i) => (
                <div key={step.label} className="relative z-10 flex flex-col items-center gap-2">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step.done ? 'bg-green-500 text-white ring-4 ring-green-50' : 'bg-gray-100 text-gray-400'}`}>
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                   </div>
                   <span className={`text-xs font-semibold ${step.done ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8 space-y-10">
        


        {/* Highlights */}
        {(responsibilities.length > 0 || skills.length > 0) && (
            <div>
               <h3 className="text-lg font-bold text-gray-900 mb-4">Job Highlights</h3>
               <ul className="space-y-3">
                   {skills.length > 0 && (
                       <li className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                           <span className="text-gray-600 leading-relaxed">
                               <strong>Keyskills:</strong> {skills.join(', ')}
                           </span>
                       </li>
                   )}
                   {responsibilities.slice(0, 3).map((resp, i) => (
                       <li key={i} className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                           <span className="text-gray-600 leading-relaxed">{resp}</span>
                       </li>
                   ))}
               </ul>
            </div>
        )}

        {/* Full Description */}
        {description && (
            <div>
               <h3 className="text-lg font-bold text-gray-900 mb-4">Job Description</h3>
               <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                   {description}
               </div>
            </div>
        )}

        {/* Full Qualifications */}
        {qualifications.length > 0 && (
            <div>
               <h3 className="text-lg font-bold text-gray-900 mb-4">Qualifications & Requirements</h3>
               <ul className="space-y-3">
                   {qualifications.map((qual, i) => (
                       <li key={i} className="flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                           <span className="text-gray-600 leading-relaxed">{qual}</span>
                       </li>
                   ))}
               </ul>
            </div>
        )}
      </div>
    </div>
  );
}