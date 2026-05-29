"use client";

import { useState, useEffect, FormEvent, ChangeEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchForgotPassword, fetchVerifyOTP } from "@/apis/user";

const EXPIRY_KEY = "otp_expiry";

function EnterOtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem(EXPIRY_KEY);
        if (stored) {
            // refresh — continue from where it left off
            const secondsLeft = Math.floor((parseInt(stored) - Date.now()) / 1000);
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        } else {
            // fresh visit — start new 5 min timer
            const expiry = Date.now() + 300 * 1000;
            sessionStorage.setItem(EXPIRY_KEY, expiry.toString());
            setTimeLeft(300);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(timer);
            sessionStorage.removeItem(EXPIRY_KEY); // clear on leave/unmount
        };
    }, []);

    const handleResend = async () => {
        if (!email) return;
        setResending(true);
        setResendSuccess(false);
        setError(null);

        try {
            await fetchForgotPassword({ email });
            // reset timer on resend
            const expiry = Date.now() + 300 * 1000;
            sessionStorage.setItem(EXPIRY_KEY, expiry.toString());
            setResendSuccess(true);
            setTimeLeft(300);
        } catch (error: any) {
            setError(
                error?.response?.data?.message || "Failed to resend OTP. Please try again."
            );
        } finally {
            setResending(false);
        }
    };

    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (timeLeft <= 0) {
            setError("OTP has expired. Please request a new one.");
            return;
        }

        setLoading(true);

        try {
            const data = await fetchVerifyOTP({ email, otp });
            sessionStorage.removeItem(EXPIRY_KEY); // clear on success
            router.push(
                `/forget-password/set-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
            );

        } catch (error: any) {
            setError(
                error?.response?.data?.message || "Invalid OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
                <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Verifying OTP...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[420px] px-6 py-8">

            <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">
                Verify OTP
            </h1>
            <p className="text-sm text-center text-slate-500 mb-6">
                Enter the OTP sent to{" "}
                <span className="font-medium text-slate-700">{email}</span>
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Enter OTP
                    </label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                        required
                        disabled={loading || timeLeft <= 0}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
                    />
                </div>

                <div className={`text-xs text-center font-medium ${timeLeft <= 60 ? "text-red-500" : "text-gray-500"}`}>
                    {timeLeft > 0
                        ? `Time remaining: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
                        : "OTP expired — please request a new one"
                    }
                </div>

                <button
                    type="submit"
                    disabled={loading || !otp.trim() || timeLeft <= 0}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    Verify OTP
                </button>
            </form>

            <div className="text-center mt-4 space-y-1">
                {resendSuccess && (
                    <p className="text-xs text-green-600 font-medium">OTP resent successfully!</p>
                )}
                <p className="text-sm text-gray-500">
                    Didn't receive it?{" "}
                    <span
                        onClick={!resending ? handleResend : undefined}
                        className={`text-indigo-600 font-medium transition ${resending
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:text-indigo-700"
                            }`}
                    >
                        {resending ? "Resending..." : "Resend OTP"}
                    </span>
                </p>
            </div>

        </div>
    );
}

export default function EnterOtpPage() {
    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-sans">
            <Suspense fallback={<div className="text-sm text-gray-400">Loading...</div>}>
                <EnterOtpForm />
            </Suspense>
        </div>
    );
}
