import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
    icon: ReactNode;
    message: string;
    ctaText?: string;
    onCtaClick?: () => void;
}

const EmptyState: FC<EmptyStateProps> = ({ icon, message, ctaText, onCtaClick }) => {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-gray-400 mb-4">{icon}</div>
            <p className="text-lg font-medium text-gray-700 mb-4">{message}</p>
            {ctaText && onCtaClick && (
                <Button onClick={onCtaClick}>{ctaText}</Button>
            )}
        </div>
    );
};

export default EmptyState;