import { FC } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = 'medium', className }) => {
    return (
        <div
            className={cn(
                'animate-spin rounded-full border-2 border-t-transparent border-gray-400',
                sizeClasses[size],
                className
            )}
        />
    );
};

export default LoadingSpinner;