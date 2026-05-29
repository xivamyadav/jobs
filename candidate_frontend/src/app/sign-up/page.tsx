"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import Image from "next/image";
import { GoogleLogin } from "@react-oauth/google";
import { fetchSignup, SignupPayload } from "@/apis/user";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [signupError, setSignupError] = useState<string | null>(null);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError(null);

        if (password !== confirmPassword) {
            setSignupError("Passwords do not match");
            return;
        }

        try {
            const payload: SignupPayload = {
                email,
                password,
                confirm_password: confirmPassword,
            };

            const result = await fetchSignup(payload);
            setSignupSuccess(true);

        }

        catch (error: any) {
            const errData = error?.response?.data;
            const message =
                errData?.message ||
                errData?.detail ||
                "Signup failed. Please try again.";
            setSignupError(message);
        }
    };

    if (signupSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 font-sans">
                <div className="w-full max-w-md text-center space-y-5 px-10 py-12">

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto shadow-sm">
                        <Mail className="w-7 h-7 text-indigo-500" />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">
                            Check your email
                        </h2>
                        <p className="text-sm text-slate-500">
                            We sent a verification link to
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                            {email}
                        </p>
                    </div>

                    <p className="text-xs text-slate-400">
                        Didn't receive it? Check your spam folder.
                    </p>

                    {/* Back to login */}
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full py-3 font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-sm transition"
                    >
                        Back to Sign In
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans">
            <div className="w-full max-w-md">
                <div className="px-10 py-10 space-y-4">

                    {/* Header */}
                    <div className="text-center mb-7">
                        <div className="  flex items-center justify-center mx-auto mb-5">
                            <Image src="/images/bytebuzz_logo.webp" alt="" height={40} width={40} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-[-0.025em] text-slate-900 mb-1.5">
                            Create your account
                        </h2>
                        <p className="text-sm text-slate-500">
                            Join BuzzByte and get started today
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showSignupPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                    className="absolute right-3 top-2"
                                >
                                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-[12.5px] font-semibold text-slate-500 mb-1.5 tracking-wide uppercase">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border rounded-xl text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-2"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {signupError && (
                            <p className="text-red-500 text-sm">{signupError}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full py-3 font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            Create Account
                        </button>

                    </form>

                    {/* Login */}
                    <p className="text-center text-sm mt-4">
                        Already have an account?{" "}
                        <span
                            onClick={() => router.push("/login")}
                            className="text-indigo-600 cursor-pointer"
                        >
                            Sign in
                        </span>
                    </p>

                    {googleClientId ? (
                        <div className="flex justify-center mt-4">
                            <GoogleLogin />
                        </div>
                    ) : null}

                </div>
            </div>
        </div>
    );
}
