import { z } from 'zod'

export const companyProfileSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    foundedYear: z.number().optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    location: z.string().optional(),
    about: z.string().max(2000, 'About must be less than 2000 characters').optional(),
    socialLinks: z.object({
        linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
        
    }).optional(),
})

export type CompanyProfileFormData = z.infer<typeof companyProfileSchema>
