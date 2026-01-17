import type { WorkItemType } from "@shared/types";
import { BookOpen, CheckSquare, Circle, Zap } from "lucide-react";

export const workItemTypes: WorkItemType[] = ["Epic", "Feature", "User Story", "Task"];

export function getTypeIcon(type: WorkItemType) {
  switch (type) {
    case "Epic":
      return <Zap className="text-purple-500" />;
    case "Feature":
      return <Circle className="text-orange-500" />;
    case "User Story":
      return <BookOpen className="text-blue-500" />;
    case "Task":
      return <CheckSquare className="text-green-500" />;
    default:
      return <Circle />;
  }
}

export function getTypeBadgeVariant(type: WorkItemType) {
  switch (type) {
    case "Epic":
      return "purple-subtle";
    case "Feature":
      return "orange-subtle";
    case "User Story":
      return "blue-subtle";
    case "Task":
      return "green-subtle";
    default:
      return "primary-subtle";
  }
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
