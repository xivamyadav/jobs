'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp } from '@/apis/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

export default function VerifyOtpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOtp({ otp });
            toast.success('Verified successfully!');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-[20px] shadow-xl border border-gray-100"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Verify Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter the OTP sent to your email.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="otp">One Time Password</Label>
                        <Input
                            id="otp"
                            required
                            className="mt-1"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#5B4DFF] hover:bg-[#4a3dec] text-white"
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
