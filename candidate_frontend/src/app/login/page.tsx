"use client";

import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchLogin } from "@/apis/user/route";
import { useGoogleLogin, type TokenResponse } from "@react-oauth/google";

interface AuthResponseData {
    access: string;
    refresh: string;
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

function GoogleLoginButton({
    onSuccess,
    onError,
}: {
    onSuccess: (tokenResponse: TokenResponse) => void | Promise<void>;
    onError: () => void;
}) {
    const googleLogin = useGoogleLogin({
        onSuccess,
        onError,
    });

    return (
        <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 py-[11px] px-4 bg-white border border-gray-200 rounded-[10px] text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
        </button>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [verifiedMessage, setVerifiedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const { login } = useAuth();

    useEffect(() => {
        const verified = searchParams.get("verified");
        const reason = searchParams.get("reason");

        if (verified === "true") {
            setVerifiedMessage({ type: "success", text: "Your email has been verified. Please log in." });
        } else if (verified === "false") {
            setVerifiedMessage({
                type: "error",
                text: reason === "link_expired"
                    ? "Verification link has expired. Please sign up again."
                    : "Email verification failed. Please try again."
            });
        }
    }, []);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter username and password");
            return;
        }
        try {
            setSubmitting(true);
            setError(null);
            const data = await fetchLogin({ email: username, password: password });
            if (data?.access && data?.refresh) {
                login(data.access, data.refresh);
            }
            router.push(returnUrl || "/dashboard");
        } catch (err) {
            const error = err as AxiosError<any>;
            setError(error.response?.data?.message || "Invalid username or password");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleLoginSuccess = async (tokenResponse: TokenResponse) => {
        try {
            const response = await axios.post<AuthResponseData>(
                `${process.env.NEXT_PUBLIC_API_URL}/account/google/`,
                { access_token: tokenResponse.access_token }
            );
            const { access, refresh } = response.data;
            login(access, refresh);
            router.push(returnUrl || "/dashboard");
        } catch (error) {
            setError("Google login failed. Please try again.");
        }
    };

    const handleGoogleLoginError = () => {
        setError("Google login failed. Please try again.");
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-white font-sans">
            <div className="w-full max-w-[400px] px-6">

                {/* Header */}
                <div className="text-center mb-7">
                    <div className="flex items-center justify-center mx-auto mb-5">
                        <Image src="/images/bytebuzz_logo.webp" alt="" height={40} width={40} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-[-0.025em] text-slate-900 mb-1.5">
                        Log in to your account
                    </h2>
                    <p className="text-sm text-slate-500">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                {/* Verified message banner */}
                {verifiedMessage && (
                    <div className={`mb-5 rounded-lg border px-3 py-2.5 text-sm ${verifiedMessage.type === "success"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-800"
                        }`}>
                        {verifiedMessage.text}
                    </div>
                )}

                {/* Username */}
                <div className="mb-4">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Username
                    </label>
                    <div className="relative group">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 group-focus-within:text-indigo-600 transition"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            required
                            className="w-full pl-10 pr-4 py-[11px] bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                        Password
                    </label>
                    <div className="relative group">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-gray-400 group-focus-within:text-indigo-600 transition"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                        >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            type={showCurrent ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            required
                            className="w-full pl-10 pr-10 py-[11px] bg-gray-50 border border-gray-200 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Forgot Password */}
                <div className="text-center mt-1 mb-5">
                    <span
                        onClick={() => router.push("/forget-password")}
                        className="text-[12px] font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer transition"
                    >
                        Forgot Password?
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                        <span className="text-[13px] text-red-600">{error}</span>
                    </div>
                )}

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleLogin}
                    disabled={submitting}
                    className="w-full py-3 text-[15px] font-semibold rounded-[10px] bg-indigo-600 text-white transition shadow-[0_1px_3px_rgba(79,70,229,0.25),0_4px_12px_rgba(79,70,229,0.15)] hover:bg-indigo-700 hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {submitting ? "Logging in..." : "Log In"}
                </button>

                {googleClientId ? (
                    <>
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium">or continue with</span>
                            <div className="flex-1 h-px bg-gray-200" />
                        </div>
                        <GoogleLoginButton
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                        />
                    </>
                ) : null}

                {/* Sign Up */}
                <div className="text-center mt-6">
                    <span className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <span
                            onClick={() => router.push("/sign-up")}
                            className="text-indigo-600 font-medium hover:text-indigo-700 cursor-pointer transition"
                        >
                            Sign up
                        </span>
                    </span>
                </div>

            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
