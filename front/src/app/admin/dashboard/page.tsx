'use client'

import { useUserRole } from '@/lib/hooks/useUserRole'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Users, Building2, Briefcase, BarChart3 } from 'lucide-react'
import { AccessDenied } from '@/components/AccessDenied'

export default function AdminDashboard() {
    const { role } = useUserRole()
    const router = useRouter()

    if (role !== 'ADMIN') {
        return <AccessDenied role={role as any} requiredRole="ADMIN" message="Only administrators can access this area" />
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">System administrator panel - Manage users, companies, and jobs</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                <div className="text-3xl font-bold text-gray-900 mt-1">150</div>
                            </div>
                            <Users className="w-12 h-12 text-blue-100" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Companies</p>
                                <div className="text-3xl font-bold text-gray-900 mt-1">25</div>
                            </div>
                            <Building2 className="w-12 h-12 text-green-100" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Job Posts</p>
                                <div className="text-3xl font-bold text-gray-900 mt-1">89</div>
                            </div>
                            <Briefcase className="w-12 h-12 text-purple-100" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Applications</p>
                                <div className="text-3xl font-bold text-gray-900 mt-1">342</div>
                            </div>
                            <BarChart3 className="w-12 h-12 text-orange-100" />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
                    <p className="text-blue-800 font-semibold">
                        Admin dashboard is under construction. Configure admin features here.
                    </p>
                </div>
            </div>
        </div>
    )
}
