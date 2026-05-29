'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Building2, ChevronRight, AlertCircle } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface ProfileSetupModalProps {
    completeness: number
    onClose: () => void
}

export function ProfileSetupModal({ completeness, onClose }: ProfileSetupModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await apiClient.patch('/company/profile/', {
                full_name: formData.full_name || undefined,
                phone_number: formData.phone_number || undefined,
            }) as any

            if (response.data?.success || response.status === 200) {
                toast.success('Profile updated successfully!')
                router.push('/employer/company')
                onClose()
            } else {
                toast.error(response.data?.message || 'Failed to update profile')
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Failed to update profile'
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSkip = () => {
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md rounded-3xl border-indigo-100 shadow-2xl">
                <CardContent className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl flex items-center justify-center">
                            <Building2 className="text-indigo-600" size={32} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                        Complete Your Profile
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                        Let's get your basic information to get started. It only takes a minute!
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name
                            </label>
                            <Input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                disabled={isLoading}
                                className="h-11 rounded-lg border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <Input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                                disabled={isLoading}
                                className="h-11 rounded-lg border-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                onClick={handleSkip}
                                variant="outline"
                                className="flex-1 rounded-xl border-gray-200 font-semibold hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Skip
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save & Continue'}
                                <ChevronRight size={18} />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
