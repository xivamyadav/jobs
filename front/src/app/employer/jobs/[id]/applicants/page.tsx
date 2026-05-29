'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, AlertCircle, Download, Mail, FileDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { applicantsApi } from '@/lib/api/applicants'
import { jobsApi } from '@/lib/api/jobs-employer'
import { toast } from 'sonner'
import type { Applicant, ApplicationStatus } from '@/lib/types/applicant'
import type { Job } from '@/lib/types/job-employer'

const statusBadgeColors: Record<string, { bg: string; text: string }> = {
  'new': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'under-review': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  'shortlisted': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'interview-scheduled': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'offered': { bg: 'bg-green-100', text: 'text-green-700' },
  'hired': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-700' },
  'withdrawn': { bg: 'bg-gray-100', text: 'text-gray-700' },
}

const statuses: any[] = [
  'new', 'under-review', 'shortlisted', 'interview-scheduled',
  'offered', 'hired', 'rejected', 'withdrawn'
]

export default function JobApplicantsPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<any>('all')
  const [updatingStatus, setUpdatingStatus] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [params.id, search, statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load job info
      const jobData = await jobsApi.getById(params.id)
      setJob(jobData)

      // Load applicants for this job
      const filters: Record<string, any> = { jobId: params.id }
      if (search) filters.search = search
      if (statusFilter !== 'all') filters.status = statusFilter

      const result = await applicantsApi.getAll(filters)
      setApplicants(result.applicants)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applicants')
      toast.error('Failed to load applicants')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicantId: any, newStatus: any) => {
    try {
      setUpdatingStatus(applicantId)
      const updated = await applicantsApi.updateStatus(applicantId, newStatus)
      setApplicants(applicants.map(a => String(a.id) === String(applicantId) ? updated : a))
      toast.success('Status updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Applied Date', 'Phone', 'Location']
    const rows = applicants.map(a => [
      a.candidateName,
      a.candidateEmail,
      a.status,
      new Date(a.appliedAt).toLocaleDateString(),
      a.candidatePhone || 'N/A',
      a.location || 'N/A'
    ])

    let csv = headers.join(',') + '\n'
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n'
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${job?.title || 'applicants'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
        <p className="text-gray-500 font-medium">Loading applicants...</p>
      </div>
    )
  }

  if (error && !applicants.length) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900">{error}</h3>
              <p className="text-red-700 text-sm mt-1">Please try again or go back to the job listing</p>
            </div>
            <Button onClick={() => loadData()} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link href={`/employer/jobs/${params.id}`} className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
        <ArrowLeft size={18} /> Back to Job
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">
          Applicants for {job?.title}
        </h1>
        <p className="text-gray-500 font-medium">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters & Export */}
      <Card className="bg-white border-gray-200 rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Search</label>
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 text-sm bg-white"
              >
                <option value="all">All</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={handleExportCSV} variant="outline" className="flex-1 rounded-xl h-10">
                <FileDown size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      {applicants.length === 0 ? (
        <Card className="bg-white border-gray-200 rounded-2xl">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">No applicants found matching your filters</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Candidate</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Applied</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((applicant) => {
                  const statusColor = statusBadgeColors[applicant.status]
                  return (
                    <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/employer/applicants/${applicant.id}`}
                          className="font-semibold text-indigo-600 hover:underline"
                        >
                          {applicant.candidateName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{applicant.candidateEmail}</td>
                      <td className="px-6 py-4">
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value as ApplicationStatus)}
                          disabled={updatingStatus === applicant.id}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase border-0 cursor-pointer disabled:opacity-50 ${statusColor.bg} ${statusColor.text}`}
                        >
                          {statuses.map(s => (
                            <option key={s} value={s}>{s.replace('-', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(applicant.appliedAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                          >
                            <Link href={`/employer/applicants/${applicant.id}`}>
                              <Eye size={16} />
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                          >
                            <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                              <Download size={16} />
                            </a>
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="rounded-lg"
                          >
                            <a href={`mailto:${applicant.candidateEmail}`}>
                              <Mail size={16} />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}