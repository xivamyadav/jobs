'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAccessToken, getRefreshToken, setAuthTokens, removeAuthTokens } from '../lib/auth';
import { getCurrentUser } from '../apis/auth';

interface AuthContextType {
    isAuthenticated: boolean;
    user: any | null;
    login: (tokens: { access: string; refresh: string }, userData?: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    removeAuthTokens();
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = (tokens: { access: string; refresh: string }, userData?: any) => {
        setAuthTokens(tokens.access, tokens.refresh);
        setIsAuthenticated(true);
        if (userData) setUser(userData);
    };

    const logout = () => {
        removeAuthTokens();
        setIsAuthenticated(false);
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
