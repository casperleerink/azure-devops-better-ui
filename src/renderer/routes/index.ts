import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, createRoute } from "@tanstack/react-router";
import { currentUserQueryOptions } from "../lib/queries";
import { RootLayout } from "./root";
import { SettingsPage } from "./settings";
import { WorkItemDetailPage } from "./work-item-detail";
import { WorkItemsPage } from "./work-items";

interface RouterContext {
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  loader: async ({ context: { queryClient } }) => {
    // Prefetch current user - don't await to avoid blocking if not authenticated
    queryClient.prefetchQuery(currentUserQueryOptions).catch(() => {
      // Ignore errors - user may not be authenticated yet
    });
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: WorkItemsPage,
});

const workItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/work-items",
  component: WorkItemsPage,
});

const workItemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/work-items/$id",
  component: WorkItemDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  workItemsRoute,
  workItemDetailRoute,
  settingsRoute,
]);
