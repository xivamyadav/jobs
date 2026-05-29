// Backend User object structure
export interface User {
    id: number
    email: string
    full_name: string
    phone_number?: string
    account_type: 'ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CANDIDATE'
    profile_picture?: string
    bio?: string
    company_id?: number
    is_email_verified: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

// Login/Register Request Payloads
export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    email: string
    password: string
    password_confirm: string
    full_name: string
    phone_number?: string
    account_type: 'COMPANY_ADMIN' | 'CANDIDATE' | 'RECRUITER' | 'ADMIN'
}

// Auth Response from Backend
export interface AuthResponse {
    access: string
    refresh: string
    user: User
}

// Token Refresh Response
export interface TokenRefreshResponse {
    access: string
}

// Password Reset Request
export interface PasswordResetRequest {
    email: string
}

export interface PasswordResetResponse {
    uid: string
    token: string
}

// Password Reset Confirm
export interface PasswordResetConfirm {
    uid: string
    token: string
    new_password: string
    new_password_confirm: string
}

// Password Change Request
export interface PasswordChangePayload {
    old_password: string
    new_password: string
    new_password_confirm: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: {
        message: string
        code?: string
    }
}