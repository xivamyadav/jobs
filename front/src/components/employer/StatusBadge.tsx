import { FC } from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'closed';
    className?: string;
}

const statusColors: Record<StatusBadgeProps['status'], string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-red-100 text-red-800',
};

const StatusBadge: FC<StatusBadgeProps> = ({ status, className }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded text-sm font-medium',
                statusColors[status],
                className
            )}
        >
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

export default StatusBadge;