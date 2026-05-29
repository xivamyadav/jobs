"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { fetchForgotPassword } from "@/apis/user";

export default function ForgotPasswordUsernamePage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // moved to useEffect to avoid router.push during render
    useEffect(() => {
        if (success) {
            // in handleSendOtp after success:
            router.push(`/forget-password/enter-otp?email=${encodeURIComponent(email)}`);
        }
    }, [success]);

    const handleSendOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await fetchForgotPassword({ email: email.trim() });
            setSuccess(true);

        } catch (error: any) {
            setError(
                error?.response?.data?.message || "User not found!     Please Sign Up."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Sending OTP to your email...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-sans">
            <div className="w-full max-w-[420px] px-6 py-8">

                <h1 className="text-2xl font-bold text-center text-slate-900 mb-6">
                    Forgot Password
                </h1>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter your email"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        Send Reset Link
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Remember your password?{" "}
                    <span
                        onClick={() => router.push("/login")}
                        className="text-indigo-600 font-medium cursor-pointer hover:text-indigo-700"
                    >
                        Sign in
                    </span>
                </p>

            </div>
        </div>
    );
}
