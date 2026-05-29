'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/employer/Sidebar'
import { TopBar } from '@/components/employer/TopBar'
import { usePathname } from 'next/navigation'

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/jobs': 'My Jobs',
    '/jobs/new': 'Post a New Job',
    '/applicants': 'All Applicants',
    '/company': 'Company Profile',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
}

export function EmployerLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const pageTitle = Object.entries(pageTitles).find(([path]) =>
        pathname === path || pathname.startsWith(path + '/')
    )?.[1] || 'Employer Portal'

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar title={pageTitle} />
                <main className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
