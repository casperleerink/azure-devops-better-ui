import { Outlet, Link, useLocation } from "@tanstack/react-router";
import { cn } from "../lib/utils";

const navItems = [
  { path: "/work-items", label: "Work Items" },
  { path: "/create", label: "Create" },
  { path: "/settings", label: "Settings" },
];

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-border bg-card">
        <nav className="flex items-center gap-6 px-6 py-3">
          <span className="font-semibold text-foreground">Azure DevOps</span>
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  location.pathname === item.path ||
                    (item.path === "/work-items" && location.pathname === "/")
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
