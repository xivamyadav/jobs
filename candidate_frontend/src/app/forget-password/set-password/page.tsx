"use client";

import { useState, FormEvent, ChangeEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchResetPassword } from "@/apis/user";
import { Eye, EyeOff } from "lucide-react";

function SetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read email and otp from URL
    const email = searchParams.get("email") || "";
    const otp = searchParams.get("otp") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await fetchResetPassword({
                email,
                otp,
                new_password: newPassword,
                confirm_new_password: confirmPassword,
            });

            setSuccess(true);

        } catch (error: any) {
            setError(
                error?.response?.data?.message || "Failed to reset password. Try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="w-full max-w-[420px] px-6 py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className="space-y-2">
                    <h2 className="text-[22px] font-bold tracking-tight text-slate-900">
                        Password updated!
                    </h2>
                    <p className="text-sm text-slate-500">
                        Your password has been reset successfully.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/login")}
                    className="w-full py-3 font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm transition"
                >
                    Back to Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[420px] px-6 py-8">
            <h1 className="text-2xl font-bold text-center text-slate-900 mb-8">
                Set New Password
            </h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">

                {/* New Password */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Enter new password"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            placeholder="Confirm new password"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-50"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full mt-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Updating..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default function SetPasswordPage() {
    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-sans">
            <Suspense fallback={<div className="text-sm text-gray-400">Loading...</div>}>
                <SetPasswordForm />
            </Suspense>
        </div>
    );
}
