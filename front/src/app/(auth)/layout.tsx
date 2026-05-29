'use client'

import React from "react";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { Card } from "@/components/ui/card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Blur Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/30 blur-[120px]" />
            </div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <ErrorBoundary fallback={
                    <Card className="border-red-200 bg-red-50 p-8">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
                            <p className="text-red-700 mb-4">An unexpected error occurred. Please try again or contact support.</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </Card>
                }>
                    {children}
                </ErrorBoundary>
            </div>

            <div className="mt-12 text-center relative z-10">
                <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">
                    &copy; {new Date().getFullYear()} BYTEBUZZ HRMS &bull; PREMIUM EMPLOYER PORTAL
                </p>
            </div>
        </div>
    );
}