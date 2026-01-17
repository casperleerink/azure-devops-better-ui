import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, X, RotateCcw } from "lucide-react";
import type { WorkItemListFilters, WorkItemType } from "@shared/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const workItemTypes: WorkItemType[] = ["Epic", "Feature", "User Story", "Task"];

const defaultFilters: WorkItemListFilters = {
  types: workItemTypes,
  assignedTo: "me",
};

// Helper to get badge variant for work item type
function getTypeBadgeVariant(type: WorkItemType) {
  switch (type) {
    case "Epic":
      return "epic";
    case "Feature":
      return "feature";
    case "User Story":
      return "userStory";
    case "Task":
      return "task";
    default:
      return "secondary";
  }
}

// Helper to get badge variant for work item state
function getStateBadgeVariant(state: string) {
  const normalizedState = state.toLowerCase();
  if (normalizedState === "new" || normalizedState === "to do") return "new";
  if (normalizedState === "active" || normalizedState === "in progress")
    return "active";
  if (normalizedState === "resolved" || normalizedState === "done")
    return "resolved";
  if (normalizedState === "closed" || normalizedState === "removed")
    return "closed";
  return "secondary";
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}

export function WorkItemsPage() {
  const [filters, setFilters] = useState<WorkItemListFilters>(defaultFilters);

  const {
    data: workItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workItems", filters],
    queryFn: () => window.ado.workItems.list(filters),
  });

  const toggleType = (type: WorkItemType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.text ||
    filters.assignedTo !== "me" ||
    filters.types.length !== workItemTypes.length;

  return (
    <div className="flex h-full">
      {/* Sidebar Filters */}
      <aside className="w-72 border-r border-border bg-muted/30 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Work Item Types Card */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium">
              Work Item Types
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-3">
              {workItemTypes.map((type) => (
                <div key={type} className="flex items-center space-x-3">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.types.includes(type)}
                    onCheckedChange={() => toggleType(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                  >
                    <Badge variant={getTypeBadgeVariant(type)} className="text-xs">
                      {type}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assigned To Card */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Assigned To</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Select
              value={filters.assignedTo === "me" ? "me" : "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  assignedTo: value === "me" ? "me" : undefined,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">Me</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Search Card */}
        <Card>
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={filters.text || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    text: e.target.value || undefined,
                  }))
                }
                placeholder="Search by title..."
                className="pl-9"
              />
              {filters.text && (
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, text: undefined }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Work Items</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading
                ? "Loading..."
                : workItems
                  ? `${workItems.length} items found`
                  : "Browse and manage your work items"}
            </p>
          </div>
          <Button asChild>
            <Link to="/create">
              <Plus className="h-4 w-4" />
              New Work Item
            </Link>
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">Error loading work items</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Failed to load work items"}
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="w-28">State</TableHead>
                  <TableHead className="w-40">Assigned To</TableHead>
                  <TableHead className="w-28">Changed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(8)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full max-w-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-28">Type</TableHead>
                  <TableHead className="w-28">State</TableHead>
                  <TableHead className="w-40">Assigned To</TableHead>
                  <TableHead className="w-28">Changed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workItems?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Link
                        to="/work-items/$id"
                        params={{ id: String(item.id) }}
                        className="text-primary font-medium hover:underline"
                      >
                        {item.id}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(item.type)}>
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStateBadgeVariant(item.state)}>
                        {item.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.assignedTo?.displayName || (
                        <span className="text-muted-foreground/50">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground text-sm"
                      title={
                        item.changedDate
                          ? new Date(item.changedDate).toLocaleString()
                          : undefined
                      }
                    >
                      {item.changedDate
                        ? formatRelativeTime(item.changedDate)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {workItems?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-muted-foreground">
                          No work items found
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Try adjusting your filters or create a new work item
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-2">
                          <Link to="/create">
                            <Plus className="h-4 w-4" />
                            Create Work Item
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
