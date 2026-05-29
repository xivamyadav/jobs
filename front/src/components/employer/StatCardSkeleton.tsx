import { Skeleton } from '@/components/ui/skeleton';

const StatCardSkeleton = () => {
    return (
        <div className="p-4 bg-white rounded-lg shadow flex items-center">
            <Skeleton className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="ml-4">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
};

export default StatCardSkeleton;