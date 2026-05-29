'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { confirmPasswordReset } from '@/apis/auth'

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isPageReady, setIsPageReady] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            const emailParam = params.get('email') || ''
            if (emailParam) setEmail(emailParam)
            setIsPageReady(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        if (!email || !otp) {
            setError('Please provide email and OTP')
            return
        }
        if (!newPassword) {
            setError('Please enter a new password')
            return
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long')
            return
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setIsLoading(true)
        try {
            const response = await confirmPasswordReset(email, otp, newPassword, confirmPassword)
            toast.success('Password reset successful. Redirecting to login...')
            setTimeout(() => router.push('/login'), 1200)
        } catch (err: any) {
            let msg = 'Failed to reset password'
            if (err?.response?.data?.detail) msg = err.response.data.detail
            else if (err?.response?.data?.message) msg = err.response.data.message
            else if (err?.message) msg = err.message
            setError(msg)
            toast.error(msg)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isPageReady) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                    <p className="text-gray-600 mt-2">Loading...</p>
                </div>
                <Card className="p-8 border border-gray-200 shadow-lg">
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-600 mt-2">Enter the OTP and your new password</p>
            </div>
            <Card className="p-8 border border-gray-200 shadow-lg">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">OTP</label>
                        <Input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                        <Input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                        <Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>

                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="w-4 h-4 rounded border" />
                        <span className="text-sm text-gray-600">Show password</span>
                    </label>

                    <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
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