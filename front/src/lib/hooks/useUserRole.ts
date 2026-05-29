'use client'

import { useEffect, useState } from 'react'

interface User {
    id: number
    email: string
    role: 'ADMIN' | 'COMPANY_ADMIN' | 'RECRUITER' | 'CANDIDATE'
    full_name: string
}

export const useUserRole = () => {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        try {
            const getCookie = (name: string) => {
                const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
                return match ? decodeURIComponent(match[2]) : null
            }
            const storedRole = getCookie('user_role')
            if (storedRole) {
                setRole(storedRole)
            }
        } catch {
            setRole(null)
        }
    }, [])

    return {
        user,
        role,
        isAdmin: role === 'ADMIN',
        isCompanyAdmin: role === 'COMPANY_ADMIN',
        isRecruiter: role === 'RECRUITER',
        isCandidate: role === 'CANDIDATE',
        isLoaded: role !== null
    }
}
