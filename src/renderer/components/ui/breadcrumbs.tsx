import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";

export const Breadcrumbs = ({
  items,
}: {
  items: { title: string; path: string; params?: Record<string, string> }[];
}) => {
  return (
    <div className="flex items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div className="flex items-center gap-2" key={item.path}>
            <Link to={item.path} params={item.params} className="h-full px-2">
              {item.title}
            </Link>
            {!isLast && <ChevronRightIcon className="size-4 opacity-40" />}
          </div>
        );
      })}
    </div>
  );
};
