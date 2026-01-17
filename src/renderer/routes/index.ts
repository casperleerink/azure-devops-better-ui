import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, createRoute } from "@tanstack/react-router";
import { CreateWorkItemPage } from "./create";
import { RootLayout } from "./root";
import { SettingsPage } from "./settings";
import { WorkItemDetailPage } from "./work-item-detail";
import { WorkItemsPage } from "./work-items";

interface RouterContext {
  queryClient: QueryClient;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
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

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateWorkItemPage,
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
  createRoute_,
  settingsRoute,
]);
