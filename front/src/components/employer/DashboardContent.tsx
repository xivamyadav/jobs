'use client'

import { formatDistanceToNow } from 'date-fns'
import { Briefcase, Users, TrendingUp, Eye } from 'lucide-react'
import PageHeader from '@/components/employer/PageHeader'
import { StatCard } from '@/components/employer/StatCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardPageProps {
    stats?: any
}

export function DashboardPageContent({ stats }: DashboardPageProps) {
    const dashboardStats = stats || {
        totalActiveJobs: 3,
        totalApplicants: 24,
        newApplicants: 3,
        totalViews: 1022,
    }

    const recentJobs = [
        {
            id: '1',
            title: 'Senior Frontend Engineer',
            location: 'Remote',
            type: 'Full-time',
            status: 'published',
            applications: 24,
            postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            id: '2',
            title: 'Product Manager',
            location: 'San Francisco, CA',
            type: 'Full-time',
            status: 'published',
            applications: 15,
            postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
    ]

    return (
        <div>
            <PageHeader
                title="Dashboard"
                actionSlot={
                    <Link href="/jobs/new">
                        <Button>Post a Job</Button>
                    </Link>
                }
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Active Jobs"
                    value={dashboardStats.totalActiveJobs}
                    icon={Briefcase}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                />
                <StatCard
                    label="Total Applicants"
                    value={dashboardStats.totalApplicants}
                    icon={Users}
                    colorClass="text-green-600"
                    bgClass="bg-green-50"
                />
                <StatCard
                    label="New This Week"
                    value={dashboardStats.newApplicants}
                    icon={TrendingUp}
                    colorClass="text-purple-600"
                    bgClass="bg-purple-50"
                />
                <StatCard
                    label="Job Views"
                    value={dashboardStats.totalViews}
                    icon={Eye}
                    colorClass="text-orange-600"
                    bgClass="bg-orange-50"
                />
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Job Title</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Applications</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Posted</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentJobs.map((job) => (
                                <tr key={job.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-blue-600"><Link href={`/jobs/${job.id}`}>{job.title}</Link></td>
                                    <td className="py-3 px-4">{job.location}</td>
                                    <td className="py-3 px-4">{job.type}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700">
                                            Published
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{job.applications}</td>
                                    <td className="py-3 px-4">{formatDistanceToNow(job.postedAt, { addSuffix: true })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-center">
                    <Link href="/jobs">
                        <Button variant="outline">View All Jobs</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
