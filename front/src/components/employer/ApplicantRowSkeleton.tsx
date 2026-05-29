import { Skeleton } from '@/components/ui/skeleton';

const ApplicantRowSkeleton = () => {
    return (
        <div className="flex items-center space-x-4 p-4 border-b border-gray-200">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-20" />
        </div>
    );
};

export default ApplicantRowSkeleton;