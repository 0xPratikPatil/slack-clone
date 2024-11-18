"use client";

import { Skeleton } from "@/components/ui/skeleton"; // Adjust the import based on your actual path
import { Separator } from "@/components/ui/separator";

const SettingsAccountLoader = () => {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-1/3" /> {/* Title Skeleton */}
        <Skeleton className="h-4 w-1/2" /> {/* Description Skeleton */}
      </div>
      <Separator />
      <form className="space-y-8">
        <div>
          <Skeleton className="h-4 w-1/4" />{" "}
          {/* Username Field Label Skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Username Input Skeleton */}
        </div>
        <div className="flex flex-col space-y-2">
          <div>
            <Skeleton className="h-4 w-1/4" />{" "}
            {/* Email Field Label Skeleton */}
            <Skeleton className="h-10 w-full" /> {/* Email Input Skeleton */}
          </div>
          <Skeleton className="h-4 w-1/4" />{" "}
          {/* Email Verification Alert Skeleton */}
          <Skeleton className="h-10 w-1/4" />{" "}
          {/* Resend Verification Button Skeleton */}
        </div>
        <div>
          <Skeleton className="h-4 w-1/4" />{" "}
          {/* Timezone Field Label Skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Timezone Select Skeleton */}
        </div>
        <div>
          <Skeleton className="h-4 w-1/4" />{" "}
          {/* Language Field Label Skeleton */}
          <Skeleton className="h-10 w-full" /> {/* Language Select Skeleton */}
        </div>
        <Skeleton className="h-10 w-1/4" />{" "}
        {/* Update Account Button Skeleton */}
      </form>
    </div>
  );
};

export default SettingsAccountLoader;
