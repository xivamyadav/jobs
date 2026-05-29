import { z } from 'zod'

export const jobBasicsSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    categoryId: z.string().min(1, 'Please select a category'),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
    workMode: z.enum(['onsite', 'remote', 'hybrid']),
    location: z.string().optional(),
    openings: z.number().int().min(1).max(999),
}).refine(
    (data) => {
        if (data.workMode !== 'remote' && !data.location) {
            return false
        }
        return true
    },
    { message: 'Location is required for on-site and hybrid jobs', path: ['location'] }
)

export type JobBasicsFormData = z.infer<typeof jobBasicsSchema>

export const jobDetailsSchema = z.object({
    description: z.string().min(100, 'Description must be at least 100 characters'),
    responsibilities: z.string().min(50, 'Responsibilities must be at least 50 characters'),
    requirements: z.string().min(50, 'Requirements must be at least 50 characters'),
    niceToHave: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    currency: z.string().default('USD'),
    showSalary: z.boolean().default(false),
    applicationDeadline: z.string().optional(),
}).refine((data) => {
    if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
        return false
    }
    return true
}, { message: 'Minimum salary cannot be greater than maximum', path: ['salaryMin'] })

export type JobDetailsFormData = z.infer<typeof jobDetailsSchema>

export const createJobSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    categoryId: z.string().min(1, 'Please select a category'),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
    workMode: z.enum(['onsite', 'remote', 'hybrid']),
    location: z.string().optional(),
    openings: z.number().int().min(1).max(999),
    description: z.string().min(100, 'Description must be at least 100 characters'),
    responsibilities: z.string().min(50, 'Responsibilities must be at least 50 characters'),
    requirements: z.string().min(50, 'Requirements must be at least 50 characters'),
    niceToHave: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    currency: z.string().default('USD'),
    showSalary: z.boolean().default(false),
    applicationDeadline: z.string().optional(),
}).refine(
    (data) => {
        if (data.workMode !== 'remote' && !data.location) {
            return false
        }
        return true
    },
    { message: 'Location is required for on-site and hybrid jobs', path: ['location'] }
)
    .refine((data) => {
        if (data.salaryMin && data.salaryMax && data.salaryMin > data.salaryMax) {
            return false
        }
        return true
    }, { message: 'Minimum salary cannot be greater than maximum', path: ['salaryMin'] })

export type CreateJobPayload = z.infer<typeof createJobSchema>
