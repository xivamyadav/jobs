'use client'

import { Bell, LogOut, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface TopBarProps {
    title: string
}

export function TopBar({ title }: TopBarProps) {
    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" disabled={true} className="relative text-gray-400 cursor-not-allowed">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full" />
                </Button>

                <div className="flex items-center gap-2 pl-4 border-l">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="hidden sm:block text-sm">
                        <p className="font-medium">John Employer</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
