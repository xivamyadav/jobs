'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Briefcase, Calendar, DollarSign, Clock, Trash2, PauseCircle, PlayCircle, Loader2, AlertCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getJobDetail, deleteJob, pauseJob, publishJob } from '@/apis/job'

interface Job {
  id: number
  title: string
  description: string
  qualifications: string
  job_type: string
  experience_level: string
  experience_min?: number
  experience_max?: number
  location: string
  is_remote: boolean
  salary_min: number
  salary_max: number
  currency: string
  status: 'draft' | 'published' | 'paused' | 'expired'
  created_at: string
  published_at?: string
  expires_at: string
  applicants_count?: number
  views_count?: number
}

function formatExperience(min?: number, max?: number): string {
  if (min === undefined || min === null) return 'Not specified'
  if (max === undefined || max === null) {
    return min === 0 ? 'Fresher' : `${min}+ Yrs`
  }
  if (min === max) {
    return min === 0 ? 'Fresher' : `${min} ${min === 1 ? 'Yr' : 'Yrs'}`
  }
  if (min === 0 && max === 0) return 'Fresher'
  if (min === 0) return `0 - ${max} Yrs (Fresher)`
  return `${min} - ${max} Yrs`
}

function formatSalary(min: number | string | undefined | null, max: number | string | undefined | null, currency: string | undefined | null): string {
  if (min === undefined || min === null || max === undefined || max === null) return 'Not disclosed'
  
  const minNum = typeof min === 'string' ? parseFloat(min) : min
  const maxNum = typeof max === 'string' ? parseFloat(max) : max
  
  if (isNaN(minNum) || isNaN(maxNum)) return 'Not disclosed'

  const curr = currency || 'INR'

  if (curr === 'INR') {
    if (minNum >= 1000) {
      const minLakhs = (minNum / 100000).toFixed(1).replace(/\.0$/, '')
      const maxLakhs = (maxNum / 100000).toFixed(1).replace(/\.0$/, '')
      return `${minLakhs} - ${maxLakhs} LPA`
    } else {
      const minStr = minNum.toFixed(1).replace(/\.0$/, '')
      const maxStr = maxNum.toFixed(1).replace(/\.0$/, '')
      return `${minStr} - ${maxStr} LPA`
    }
  } else {
    const symbol = curr === 'USD' ? '$' : curr + ' '
    if (minNum >= 1000) {
      const minK = (minNum / 1000).toFixed(1).replace(/\.0$/, '')
      const maxK = (maxNum / 1000).toFixed(1).replace(/\.0$/, '')
      return `${symbol}${minK}K - ${symbol}${maxK}K PA`
    } else {
      return `${symbol}${minNum} - ${symbol}${maxNum} PA`
    }
  }
}


export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Load job data
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getJobDetail(params.id)
        if (response.success) {
          setJob(response.data)
        } else {
          setError(response.message || 'Failed to load job')
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load job'
        setError(message)
        toast.error('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }
    loadJob()
  }, [params.id])

  // Toggle publish/pause status
  const handleStatusToggle = async () => {
    if (!job) return

    setStatusUpdating(true)
    try {
      let response
      if (job.status === 'published') {
        response = await pauseJob(params.id)
      } else {
        response = await publishJob(params.id)
      }

      if (response.success) {
        const newStatus = job.status === 'published' ? 'paused' : 'published'
        setJob({ ...job, status: newStatus as any })
        toast.success(`Job ${newStatus} successfully`)
      } else {
        toast.error(response.message || 'Failed to update job status')
      }
    } catch (err) {
      toast.error('Failed to update job status')
    } finally {
      setStatusUpdating(false)
    }
  }

  // Delete job
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return

    if (!job) return

    setDeleting(true)
    try {
      const response = await deleteJob(params.id)
      if (response.success) {
        toast.success('Job deleted successfully')
        router.push('/employer/jobs')
      } else {
        toast.error(response.message || 'Failed to delete job')
      }
    } catch (err) {
      toast.error('Failed to delete job')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-600" />
        <p className="text-gray-600 font-medium">Loading job details...</p>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8">
        <Link href="/employer/jobs" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
          <ArrowLeft size={18} /> Back to Jobs
        </Link>
        <Card className="border-red-200 bg-red-50 p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Job Not Found</h2>
          <p className="text-red-700 mb-6">{error || 'This job could not be loaded'}</p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="/employer/jobs">Back to All Jobs</Link>
          </Button>
        </Card>
      </div>
    )
  }

  const statusBadgeColor = job.status === 'published'
    ? 'bg-green-100 text-green-700'
    : job.status === 'draft'
      ? 'bg-gray-100 text-gray-700'
      : 'bg-yellow-100 text-yellow-700'

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Navigation */}
      <div className="flex justify-between items-center">
        <Link href="/employer/jobs" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
          <ArrowLeft size={18} /> Back to All Jobs
        </Link>
        <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${statusBadgeColor}`}>
          {job.status}
        </div>
      </div>

      {/* Job Header Card */}
      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100">
                  <Briefcase size={16} /> {job.job_type}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold bg-gray-50 text-gray-600 px-4 py-2 rounded-xl border border-gray-200">
                  <MapPin size={16} /> {job.is_remote ? 'Remote' : 'On-site'}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1.5 text-sm font-semibold bg-gray-50 text-gray-600 px-4 py-2 rounded-xl border border-gray-200">
                    <MapPin size={16} /> {job.location}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 self-start md:self-auto">
              <Button
                variant="outline"
                className="rounded-lg border-gray-200 font-semibold"
                onClick={handleStatusToggle}
                disabled={statusUpdating}
              >
                {statusUpdating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Updating...
                  </>
                ) : job.status === 'published' ? (
                  <>
                    <PauseCircle size={16} className="mr-2" /> Pause Job
                  </>
                ) : (
                  <>
                    <PlayCircle size={16} className="mr-2" /> Publish Job
                  </>
                )}
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                <Link href={`/employer/jobs/${job.id}/applicants`}>View Applicants</Link>
              </Button>
              <Button
                variant="destructive"
                className="rounded-lg font-semibold"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" /> Delete Job
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Required Skills */}
          {job.required_skills_details && job.required_skills_details.length > 0 && (
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills_details.map((skill: any, idx: number) => (
                    <span key={skill.skill_id || `skill-${idx}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-sm font-semibold">
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {job.description && (
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap"
                >
                  {job.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {job.qualifications && (
            <Card className="rounded-2xl border-gray-100">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Qualifications & Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap"
                >
                  {job.qualifications}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Job Info & Stats */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card className="rounded-2xl border-gray-100">
            <CardHeader>
              <CardTitle className="text-base font-bold">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <DollarSign size={16} /> Salary
                </span>
                {(job.salary_min || job.salaryMin) && (job.salary_max || job.salaryMax) ? (
                  <span className="font-bold text-gray-900">
                    {formatSalary(job.salary_min || job.salaryMin, job.salary_max || job.salaryMax, job.currency)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Not shown</span>
                )}
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Briefcase size={16} /> Experience
                </span>
                <span className="font-bold text-gray-900">
                  {formatExperience(job.experience_min, job.experience_max)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Users size={16} /> Openings
                </span>
                <span className="font-bold text-gray-900">{job.openings || 1}</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Clock size={16} /> Posted
                </span>
                <span className="font-bold text-gray-900">{new Date(job.created_at || job.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Calendar size={16} /> Deadline
                </span>
                <span className="font-bold text-gray-900">
                  {(job.expires_at || job.applicationDeadline) ? new Date(job.expires_at || job.applicationDeadline).toLocaleDateString() : 'No deadline'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Application Stats */}
          <Card className="rounded-2xl border-gray-100 bg-indigo-50">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">Applicants</p>
                <p className="text-4xl font-black text-indigo-600">{job.applicants_count || job.applicantCount || 0}</p>
              </div>
              <div className="border-t border-indigo-200 pt-4 text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">Job Views</p>
                <p className="text-3xl font-black text-indigo-600">{job.views_count || job.viewCount || 0}</p>
              </div>
              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-4">
                <Link href={`/employer/jobs/${job.id}/applicants`}>View All Applicants</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}