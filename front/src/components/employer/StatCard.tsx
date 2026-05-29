import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    colorClass: string
    bgClass: string
    trend?: string
}

export function StatCard({
    label,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    trend,
}: StatCardProps) {
    return (
        <div className={`${bgClass} border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group`}>
            {/* Icon Section */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
                <div className={`${bgClass} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`${colorClass} w-5 h-5`} />
                </div>
            </div>

            {/* Value Section */}
            <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <p className="text-xs text-gray-600 font-medium">{trend}</p>
                )}
            </div>
        </div>
    )
}