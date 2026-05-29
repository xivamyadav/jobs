// Role-Based Access Control System

export type UserRole = 'COMPANY_ADMIN' | null

// Define what each role can access
export const rolePermissions = {
    COMPANY_ADMIN: {
        allowedPages: [
            '/employer/applicants',
            '/employer/applicants/[id]',
            '/employer/company',
            '/employer/dashboard',
            '/employer/settings',
            '/employer/notifications'
        ],
        description: 'Employer - Can manage all applicants and company'
    }
}

// Check if role can access page
export function canAccessPage(role: UserRole, page: string): boolean {
    if (!role) return false

    const permissions = rolePermissions[role]
    if (!permissions) return false

    return permissions.allowedPages.some(allowedPage => {
        // Handle exact matches
        if (allowedPage === page) return true

        // Handle wildcard matches
        if (allowedPage.endsWith('/*')) {
            const basePath = allowedPage.slice(0, -2)
            return page.startsWith(basePath)
        }

        // Handle dynamic routes [id]
        const pattern = allowedPage.replace(/\[id\]/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        return regex.test(page)
    })
}

// Get role label for display
export function getRoleLabel(role: UserRole): string {
    if (!role) return 'Unknown'
    return rolePermissions[role]?.description || 'Unknown'
}

// What each role can do
export const roleCapabilities = {
    CANDIDATE: {
        canSearchJobs: true,
        canApplyToJobs: true,
        canViewOwnApplications: true,
        canViewOtherApplications: false,
        canCreateJobs: false,
        canManageCompany: false,
        canViewAnalytics: false
    },
    RECRUITER: {
        canSearchJobs: false,
        canApplyToJobs: false,
        canViewOwnApplications: false,
        canViewOtherApplications: true,  // Only for their jobs
        canCreateJobs: true,
        canManageCompany: false,
        canViewAnalytics: true  // For their jobs
    },
    COMPANY_ADMIN: {
        canSearchJobs: false,
        canApplyToJobs: false,
        canViewOwnApplications: false,
        canViewOtherApplications: true,  // All applications
        canCreateJobs: false,
        canManageCompany: true,
        canViewAnalytics: true  // For entire company
    },
    ADMIN: {
        canSearchJobs: true,
        canApplyToJobs: true,
        canViewOwnApplications: true,
        canViewOtherApplications: true,
        canCreateJobs: true,
        canManageCompany: true,
        canViewAnalytics: true
    }
}
