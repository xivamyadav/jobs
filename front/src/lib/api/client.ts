import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 0,
});

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(async (config) => {
    // Client-side par session fetch karein
    if (typeof window !== 'undefined') {
        const session = (await getSession()) as any;
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        // 1. Handle 401 (Unauthorized/Session Expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Loop rokne ke liye

            if (typeof window !== 'undefined') {
                toast.error('Session expired. Please log in again.');
                // Next-auth ka state clean karke logout karein
                await signOut({ callbackUrl: '/login', redirect: true });
            }
        }

        // 2. Handle 403 (Forbidden/No Permission)
        else if (error.response?.status === 403) {
            toast.error("You don't have permission to perform this action.");
        }

        // 3. General Error Handling (Backend message priority)
        else {
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';

            // Sirf client-side par toast dikhayein
            if (typeof window !== 'undefined') {
                toast.error(errorMessage);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;