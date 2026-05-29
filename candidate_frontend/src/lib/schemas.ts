import { z } from "zod";

export const basicInfoSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters."),
  primary_email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  primary_phone: z.string().optional().or(z.literal('')),
  about: z.string().optional().or(z.literal('')),
  current_designation: z.string().optional(),
  experience_years: z.coerce.number().min(0).optional(),
  experience_months: z.coerce.number().min(0).max(11).optional(),
  current_salary_amount: z.coerce.number().min(0).optional(),
  expected_salary_amount: z.coerce.number().min(0).optional(),
  salary_currency: z.string().optional(),
  salary_period: z.enum(["YEAR", "MONTH"]),
  notice_period_days: z.coerce.number().optional(),
  location_text: z.string().optional().nullable(),
  is_fresher: z.boolean().default(false),
});
