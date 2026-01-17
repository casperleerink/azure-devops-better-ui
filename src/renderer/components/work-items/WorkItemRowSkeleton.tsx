import { Row } from "@/components/ui/row";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkItemRowSkeleton() {
  return (
    <Row className="py-0">
      {/* Icon placeholder */}
      <Skeleton className="size-8 rounded shrink-0 ml-1" />

      {/* Title placeholder */}
      <div className="flex-1 py-4 pl-3 pr-4">
        <Skeleton className="h-4 w-2/3 rounded-sm" />
      </div>

      {/* Right section with status, avatar, date, and button space */}
      <div className="flex items-center gap-3 pr-4">
        {/* Status selector placeholder */}
        <Skeleton className="h-6 w-20 rounded-lg" />

        {/* Avatar placeholder */}
        <Skeleton className="size-5 rounded-full" />

        {/* Date placeholder */}
        <Skeleton className="h-4 w-14 rounded-sm" />

        {/* More button placeholder */}
        <Skeleton className="size-6 rounded-md" />
      </div>
    </Row>
  );
}
