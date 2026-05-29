"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { candidateApi } from "@/apis/user";

// --- 1. Define Types ---

export interface UserState {
    id: string;
    username: string;
    email?: string;
    role?: string; // Naya field add kiya
}

interface TokenPayload {
    id: string | number;
    exp?: number;
    iat?: number;
    jti?: string;
    token_type?: string;
}

interface AuthContextValue {
    user: UserState | null;
    loading: boolean;
    login: (access: string, refresh: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
};

const REFRESH_COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 30,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserState | null>(null);
    const [loading, setLoading] = useState(true);

    const setUserFromToken = async (accessToken: string) => {
        try {
            const decoded = jwtDecode<TokenPayload>(accessToken);

            // Profile API se real data fetch ho raha hai
            const profile = await candidateApi.getProfile();

            setUser({
                id: String(decoded.id),
                // "User" fallback hata kar generic placeholder rakha
                username: profile?.data?.full_name || profile?.data?.primary_email || "Account",
                email: profile?.data?.primary_email || "",
                // Role ko backend se connect kiya (Candidate mock data khatam)
                role: profile?.data?.role || "Member",
            });
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        const accessToken = Cookies.get("access");
        if (accessToken) {
            await setUserFromToken(accessToken);
        }
    };

    useEffect(() => {
        const accessToken = Cookies.get("access");
        if (accessToken) {
            setUserFromToken(accessToken);
        } else {
            setLoading(false);
        }
    }, []);

    const login = (access: string, refresh: string) => {
        Cookies.set("access", access, COOKIE_OPTIONS);
        Cookies.set("refresh", refresh, REFRESH_COOKIE_OPTIONS);
        setUserFromToken(access);
    };

    const logout = () => {
        Cookies.remove("access");
        Cookies.remove("refresh");
        setUser(null);
        window.location.href = "/login";
    };

    const contextValue: AuthContextValue = {
        user,
        loading,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {/* Loading ke waqt screen khali na dikhe, isliye children load hone dein */}
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
