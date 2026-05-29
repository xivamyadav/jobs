// src/app/(auth)/logout/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            // Profile completion flag logic removed
            // Cookies clear karne ka logic
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        };
        performLogout();
    }, [router]);

    return <div className="flex items-center justify-center h-screen">Logging out...</div>;
}