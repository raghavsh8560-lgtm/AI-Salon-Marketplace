import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`} />
  );
};

export const SalonCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col sm:flex-row h-full">
      {/* Image Skeleton */}
      <Skeleton className="w-full sm:w-48 md:w-60 h-48 sm:h-full min-h-[190px]" />
      
      {/* Content Skeleton */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-1/3 mt-1" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <div>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
