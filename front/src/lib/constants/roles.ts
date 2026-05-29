/**
 * ByteBuzz HRMS - Role Types & Permissions Contract
 * Backend Integration Document
 * 
 * IMPORTANT: Use EXACT strings below. Any spelling difference will cause 400 Bad Request
 */

// Account types for registration
export const ACCOUNT_TYPES = {
    // Job seeker - minimal profile
    CANDIDATE: 'CANDIDATE',

    // Company owner/employer - full company details required
    COMPANY_ADMIN: 'COMPANY_ADMIN',

    // Company HR/Staff - limited permissions (added by COMPANY_ADMIN)
    RECRUITER: 'RECRUITER',

    // Platform super admin - backend only (Django command)
    ADMIN: 'ADMIN',
} as const

export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES]

/**
 * Role Permissions Matrix
 */
export const ROLE_PERMISSIONS = {
    [ACCOUNT_TYPES.CANDIDATE]: {
        canViewJobs: true,
        canApplyJobs: true,
        canPostJobs: false,
        canViewApplicants: false,
        canManageCompany: false,
        canAddRecruiters: false,
    },
    [ACCOUNT_TYPES.COMPANY_ADMIN]: {
        canViewJobs: true,
        canApplyJobs: false,
        canPostJobs: true,
        canViewApplicants: true,
        canManageCompany: true,
        canAddRecruiters: true,
    },
    [ACCOUNT_TYPES.RECRUITER]: {
        canViewJobs: true,
        canApplyJobs: false,
        canPostJobs: true,
        canViewApplicants: true,
        canManageCompany: false,
        canAddRecruiters: false,
    },
    [ACCOUNT_TYPES.ADMIN]: {
        canViewJobs: true,
        canApplyJobs: false,
        canPostJobs: true,
        canViewApplicants: true,
        canManageCompany: true,
        canAddRecruiters: true,
    },
} as const

/**
 * API Contract Notes:
 * 
 * 1. ID Formatting:
 *    - WRONG: "job-123" (string with prefix)
 *    - CORRECT: 123 (raw number)
 *    - Use raw IDs in API calls, format UI strings separately
 * 
 * 2. Pagination:
 *    - WRONG: ?limit=10
 *    - CORRECT: ?page=1&page_size=10
 * 
 * 3. File Uploads:
 *    - Use FormData() object
 *    - Set Content-Type: multipart/form-data
 *    - Browser handles header automatically
 * 
 * 4. Location Format:
 *    - CORRECT: "Mumbai, Maharashtra" (City, State)
 *    - Use dropdown or autocomplete for consistency
 * 
 * 5. Phone Number:
 *    - Default for candidates: "+1 (000) 000-0000"
 *    - Validate format before sending
 */
