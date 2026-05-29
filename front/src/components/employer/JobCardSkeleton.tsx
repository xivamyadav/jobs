import { Skeleton } from '@/components/ui/skeleton';

const JobCardSkeleton = () => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
        </div>
    );
};

export default JobCardSkeleton;