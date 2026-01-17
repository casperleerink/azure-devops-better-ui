import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkItemDialog } from "@/components/work-items/CreateWorkItemDialog";
import { cn } from "../lib/utils";

const navItems = [
  { path: "/work-items", label: "Work Items" },
  { path: "/settings", label: "Settings" },
];

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="border-b border-alpha/5 bg-gray-50">
        <nav className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold text-gray-950">Azure DevOps</span>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-1.5 text-base font-medium transition-colors rounded-lg",
                    location.pathname === item.path ||
                      (item.path === "/work-items" && location.pathname === "/")
                      ? "text-gray-950"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <CreateWorkItemDialog
            trigger={
              <Button variant="primary" size="default">
                <Plus className="size-4" />
                <span>New Work Item</span>
              </Button>
            }
          />
        </nav>
      </header>
      <main className="flex-1 overflow-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}
