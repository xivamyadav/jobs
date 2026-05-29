'use client'

import { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageHeaderProps {
    title: string
    breadcrumbs?: { label: string; href?: string }[]
    actionSlot?: ReactNode
    className?: string
}

const PageHeader: FC<PageHeaderProps> = ({ title, breadcrumbs, actionSlot, className }) => {
    return (
        <div className={cn('flex items-center justify-between py-4', className)}>
            <div>
                {breadcrumbs && (
                    <nav className="mb-2">
                        <ol className="flex items-center gap-2 text-sm text-gray-600">
                            {breadcrumbs.map((breadcrumb, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    {breadcrumb.href ? (
                                        <Link href={breadcrumb.href} className="hover:text-gray-900">
                                            {breadcrumb.label}
                                        </Link>
                                    ) : (
                                        <span>{breadcrumb.label}</span>
                                    )}
                                    {index < breadcrumbs.length - 1 && <span>/</span>}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            {actionSlot && <div>{actionSlot}</div>}
        </div>
    )
}

export default PageHeader
