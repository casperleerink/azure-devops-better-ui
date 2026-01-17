import { createRootRouteWithContext, createRoute, createRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { RootLayout } from "./root";
import { WorkItemsPage } from "./work-items";
import { WorkItemDetailPage } from "./work-item-detail";
import { CreateWorkItemPage } from "./create";
import { SettingsPage } from "./settings";

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
