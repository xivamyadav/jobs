'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/apis/auth'


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!email.trim()) {
            setError('Please enter your email address')
            return
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address')
            return
        }

        setIsLoading(true)

        try {
            await requestPasswordReset(email)
            setSuccess('OTP sent to your email. Enter OTP and new password on the next screen.')
            toast.success('OTP sent to your email.')
            setTimeout(() => {
                router.push('/reset-password')
            }, 1200)
        } catch (err: any) {
            let msg = 'Failed to send OTP'
            if (err.response?.data?.message) {
                msg = err.response.data.message
            } else if (err.response?.data?.error) {
                msg = err.response.data.error
            } else if (err.response?.data?.detail) {
                msg = err.response.data.detail
            } else if (err.message) {
                msg = err.message
            }
            setError(msg)
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-600 mt-2">Enter your email to receive an OTP</p>
            </div>
            <Card className="p-8 border border-gray-200 shadow-lg">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <Mail className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-green-700">{success}</p>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                        <Input
                            type="email"
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(null) }}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Sending...
                            </>
                        ) : (
                            'Send OTP'
                        )}
                    </Button>
                </form>
                <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-indigo-600 font-medium hover:underline">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
            </Card>
        </div>
    )
}

// (Removed duplicate return and unreachable code)