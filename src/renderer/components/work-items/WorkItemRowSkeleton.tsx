import { Row } from "@/components/ui/row";
import { Skeleton } from "@/components/ui/skeleton";

export function WorkItemRowSkeleton() {
  return (
    <Row className="py-0">
      <Skeleton className="size-5 rounded-md shrink-0 ml-1.5" />
      <div className="flex-1 py-4 pl-3 pr-4">
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-3 pr-4">
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="h-5 w-16 rounded" />
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </Row>
  );
}
