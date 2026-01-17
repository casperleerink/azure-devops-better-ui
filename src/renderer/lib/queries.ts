import { queryOptions } from "@tanstack/react-query";

export const currentUserQueryOptions = queryOptions({
  queryKey: ["currentUser"],
  queryFn: () => window.ado.identities.getCurrentUser(),
  staleTime: 1000 * 60 * 30, // 30 minutes
});
