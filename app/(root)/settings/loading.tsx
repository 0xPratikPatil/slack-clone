"use client";

import { Skeleton } from "@/components/ui/skeleton"; // Adjust the import based on your actual path
import { Separator } from "@/components/ui/separator";

const SettingsProfileLoader = () => {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-1/3" /> {/* Title Skeleton */}
        <Skeleton className="h-4 w-1/2" /> {/* Description Skeleton */}
      </div>
      <Separator />
      <div className="flex flex-col space-y-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />{" "}
            {/* Avatar Skeleton */}
            <div className="grid gap-1">
              <Skeleton className="h-4 w-1/4" /> {/* Name Skeleton */}
              <Skeleton className="h-4 w-1/3" /> {/* Email Skeleton */}
            </div>
          </div>
        </div>
        <form className="space-y-8">
          <div>
            <Skeleton className="h-4 w-1/4" /> {/* Name Field Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Name Input Skeleton */}
          </div>
          <div>
            <Skeleton className="h-4 w-1/4" />{" "}
            {/* Pronouns Field Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Pronouns Input Skeleton */}
          </div>
          <div>
            <Skeleton className="h-4 w-1/4" /> {/* Bio Field Label Skeleton */}
            <Skeleton className="h-20 w-full" /> {/* Bio Textarea Skeleton */}
          </div>
          <div>
            <Skeleton className="h-4 w-1/4" /> {/* URLs Field Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* URL Input Skeleton */}
            <Skeleton className="h-10 w-full mt-2" />{" "}
            {/* Add URL Button Skeleton */}
          </div>
          <Skeleton className="h-10 w-1/4" />{" "}
          {/* Update Profile Button Skeleton */}
        </form>
      </div>
    </div>
  );
};

export default SettingsProfileLoader;
