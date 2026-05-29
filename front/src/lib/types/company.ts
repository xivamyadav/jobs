export interface Company {
    id: number
    name: string
    description?: string
    email: string
    phone: string
    website?: string
    address?: string
    city?: string
    country?: string
    logo?: string
    banner?: string
    industry?: string
    company_size?: string
    founded_year?: number
    is_verified: boolean
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CompanyCreatePayload {
    name: string
    description?: string
    email: string
    phone: string
    website?: string
    address?: string
    city?: string
    country?: string
    industry?: string
    company_size?: string
    founded_year?: number
}

export interface CompanyUpdatePayload extends Partial<CompanyCreatePayload> { }

export interface CompletionStatus {
    percentage: number
    missingFields: string[]
}
