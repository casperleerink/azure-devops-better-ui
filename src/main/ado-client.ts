import type { z } from "zod";
import type {
  AdoPatchOperation,
  AreaPath,
  Identity,
  Iteration,
  UserSearchResult,
  WorkItemCreatePayload,
  WorkItemDetail,
  WorkItemListFilters,
  WorkItemSummary,
  WorkItemType,
  WorkItemTypeState,
  WorkItemUpdatePatch,
} from "../shared/types";
import {
  AdoBatchWorkItemsSchema,
  type AdoClassificationNode,
  AdoClassificationNodeSchema,
  AdoConnectionDataSchema,
  AdoIdentitySearchResultSchema,
  AdoIterationsSchema,
  AdoWiqlResultSchema,
  type AdoWorkItem,
  AdoWorkItemSchema,
  AdoWorkItemTypeStatesSchema,
} from "./ado-schemas";
import { getPat } from "./secure-store";
import { getConfig } from "./store";

/** Maximum number of work items to fetch in a single batch request */
const BATCH_SIZE = 200;

/** Default timeout for API requests in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;

/** Escape single quotes in WIQL strings to prevent injection */
function escapeWiql(value: string): string {
  return value.replace(/'/g, "''");
}

function getAuthHeader(): string {
  const pat = getPat();
  if (!pat) {
    throw new Error("PAT not configured");
  }
  return `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;
}

async function adoFetchInternal<T>(
  endpoint: string,
  options: RequestInit = {},
  includeProject: boolean,
): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error("Azure DevOps not configured");
  }

  const url = includeProject
    ? `${config.organizationUrl}/${config.projectName}/_apis/${endpoint}`
    : `${config.organizationUrl}/_apis/${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Azure DevOps API error: ${response.status} ${text}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Azure DevOps API request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function adoFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return adoFetchInternal<T>(endpoint, options, true);
}

async function adoFetchOrg<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return adoFetchInternal<T>(endpoint, options, false);
}

/**
 * Fetch from Azure DevOps API with Zod schema validation
 * Throws an error if the response doesn't match the expected schema
 */
async function adoFetchValidated<T>(
  endpoint: string,
  schema: z.ZodType<T>,
  options: RequestInit = {},
  includeProject = true,
): Promise<T> {
  const rawResponse = await adoFetchInternal<unknown>(endpoint, options, includeProject);

  const result = schema.safeParse(rawResponse);
  if (!result.success) {
    console.error("Azure DevOps API validation error:", result.error.format());
    throw new Error(
      `Invalid response from Azure DevOps API (${endpoint}): ${result.error.message}`,
    );
  }

  return result.data;
}

export async function testConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getConfig();
    if (!config) {
      return { success: false, error: "Azure DevOps not configured" };
    }

    const pat = getPat();
    if (!pat) {
      return { success: false, error: "PAT not configured" };
    }

    // Test by fetching project info (org-level endpoint, no project in path)
    await adoFetchOrg("projects?api-version=7.1");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getCurrentUser(): Promise<Identity> {
  const result = await adoFetchValidated(
    "connectionData?api-version=7.1-preview",
    AdoConnectionDataSchema,
    {},
    false,
  );

  return {
    id: result.authenticatedUser.id,
    displayName:
      result.authenticatedUser.customDisplayName || result.authenticatedUser.providerDisplayName,
    uniqueName: result.authenticatedUser.properties.Account.$value,
  };
}

function buildWiqlQuery(filters: WorkItemListFilters): string {
  const conditions: string[] = [];

  // Work item types (escaped to prevent WIQL injection)
  if (filters.types.length > 0) {
    const typeConditions = filters.types.map((t) => `[System.WorkItemType] = '${escapeWiql(t)}'`);
    conditions.push(`(${typeConditions.join(" OR ")})`);
  }

  // Assigned to
  if (filters.assignedTo === "me") {
    conditions.push("[System.AssignedTo] = @Me");
  } else if (filters.assignedTo && typeof filters.assignedTo === "object") {
    conditions.push(`[System.AssignedTo] = '${escapeWiql(filters.assignedTo.uniqueName)}'`);
  }

  // States (escaped to prevent WIQL injection)
  if (filters.states && filters.states.length > 0) {
    const stateConditions = filters.states.map((s) => `[System.State] = '${escapeWiql(s)}'`);
    conditions.push(`(${stateConditions.join(" OR ")})`);
  }

  // Text search (escaped to prevent WIQL injection)
  if (filters.text) {
    conditions.push(`[System.Title] CONTAINS '${escapeWiql(filters.text)}'`);
  }

  // Area Path (escaped to prevent WIQL injection)
  if (filters.areaPath) {
    // Clean up path: strip leading backslash and remove \Area segment
    const cleanAreaPath = filters.areaPath.replace(/^\\/, "").replace(/\\Area(?=\\|$)/, "");
    conditions.push(`[System.AreaPath] UNDER '${escapeWiql(cleanAreaPath)}'`);
  }

  // Iteration Path (escaped to prevent WIQL injection)
  if (filters.iterationPath) {
    conditions.push(`[System.IterationPath] UNDER '${escapeWiql(filters.iterationPath)}'`);
  }

  // Changed since
  if (filters.changedSinceDays) {
    conditions.push(`[System.ChangedDate] >= @Today - ${filters.changedSinceDays}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderBy =
    filters.sort === "createdDesc"
      ? "ORDER BY [System.CreatedDate] DESC"
      : "ORDER BY [System.ChangedDate] DESC";

  return `SELECT [System.Id] FROM WorkItems ${whereClause} ${orderBy}`;
}

function mapWorkItem(item: AdoWorkItem): WorkItemSummary {
  // Validate required fields are present (should always be true for full work item fetches)
  if (!item.fields["System.Title"]) {
    throw new Error(`Work item ${item.id} missing required field: System.Title`);
  }
  if (!item.fields["System.WorkItemType"]) {
    throw new Error(`Work item ${item.id} missing required field: System.WorkItemType`);
  }
  if (!item.fields["System.State"]) {
    throw new Error(`Work item ${item.id} missing required field: System.State`);
  }

  return {
    id: item.id,
    url: item.url,
    type: item.fields["System.WorkItemType"] as WorkItemType,
    title: item.fields["System.Title"],
    state: item.fields["System.State"],
    assignedTo: item.fields["System.AssignedTo"]
      ? {
          displayName: item.fields["System.AssignedTo"].displayName,
          uniqueName: item.fields["System.AssignedTo"].uniqueName,
        }
      : undefined,
    areaPath: item.fields["System.AreaPath"],
    iterationPath: item.fields["System.IterationPath"],
    changedDate: item.fields["System.ChangedDate"],
  };
}

function mapWorkItemDetail(item: AdoWorkItem): WorkItemDetail {
  const summary = mapWorkItem(item);

  // Find parent relation
  let parentId: number | undefined;
  if (item.relations) {
    const parentRelation = item.relations.find(
      (r) => r.rel === "System.LinkTypes.Hierarchy-Reverse",
    );
    if (parentRelation) {
      const urlParts = parentRelation.url.split("/");
      parentId = parseInt(urlParts[urlParts.length - 1], 10);
    }
  }

  return {
    ...summary,
    descriptionHtml: item.fields["System.Description"],
    tags: item.fields["System.Tags"]?.split(";").map((t: string) => t.trim()),
    parentId,
  };
}

export async function listWorkItems(filters: WorkItemListFilters): Promise<WorkItemSummary[]> {
  const query = buildWiqlQuery(filters);

  // Run WIQL query to get IDs
  const wiqlResult = await adoFetchValidated("wit/wiql?api-version=7.1", AdoWiqlResultSchema, {
    method: "POST",
    body: JSON.stringify({ query }),
  });

  if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
    return [];
  }

  // Batch fetch work items
  const ids = wiqlResult.workItems.map((w) => w.id);
  const workItemsById = new Map<number, WorkItemSummary>();

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const idsParam = batchIds.join(",");
    const fields = [
      "System.Id",
      "System.Title",
      "System.WorkItemType",
      "System.State",
      "System.AssignedTo",
      "System.AreaPath",
      "System.IterationPath",
      "System.ChangedDate",
    ].join(",");

    const batchResult = await adoFetchValidated(
      `wit/workitems?ids=${idsParam}&fields=${fields}&api-version=7.1`,
      AdoBatchWorkItemsSchema,
    );

    for (const item of batchResult.value) {
      workItemsById.set(item.id, mapWorkItem(item));
    }
  }

  // Preserve the original sort order from WIQL query
  return ids.map((id) => workItemsById.get(id)!).filter(Boolean);
}

export async function listChildren(parentId: number): Promise<WorkItemSummary[]> {
  // Query for work items that have the specified parent
  const query = `SELECT [System.Id] FROM WorkItemLinks WHERE [Source].[System.Id] = ${parentId} AND [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward' ORDER BY [Target].[System.CreatedDate] ASC MODE (MustContain)`;

  // Run WIQL query to get child work item IDs
  const wiqlResult = await adoFetchValidated("wit/wiql?api-version=7.1", AdoWiqlResultSchema, {
    method: "POST",
    body: JSON.stringify({ query }),
  });

  if (!wiqlResult.workItemRelations || wiqlResult.workItemRelations.length === 0) {
    return [];
  }

  // Extract target work item IDs (exclude the source parent)
  const ids = wiqlResult.workItemRelations.filter((rel) => rel.target).map((rel) => rel.target!.id);

  if (ids.length === 0) {
    return [];
  }

  // Batch fetch work items
  const workItemsById = new Map<number, WorkItemSummary>();

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const idsParam = batchIds.join(",");
    const fields = [
      "System.Id",
      "System.Title",
      "System.WorkItemType",
      "System.State",
      "System.AssignedTo",
      "System.AreaPath",
      "System.IterationPath",
      "System.ChangedDate",
    ].join(",");

    const batchResult = await adoFetchValidated(
      `wit/workitems?ids=${idsParam}&fields=${fields}&api-version=7.1`,
      AdoBatchWorkItemsSchema,
    );

    for (const item of batchResult.value) {
      workItemsById.set(item.id, mapWorkItem(item));
    }
  }

  // Preserve the original sort order from WIQL query
  return ids.map((id) => workItemsById.get(id)!).filter(Boolean);
}

export async function getWorkItem(id: number): Promise<WorkItemDetail> {
  const result = await adoFetchValidated(
    `wit/workitems/${id}?$expand=relations&api-version=7.1`,
    AdoWorkItemSchema,
  );
  return mapWorkItemDetail(result);
}

export async function createWorkItem(payload: WorkItemCreatePayload): Promise<WorkItemDetail> {
  const patchDoc: AdoPatchOperation[] = [
    { op: "add", path: "/fields/System.Title", value: payload.title },
  ];

  if (payload.description) {
    patchDoc.push({
      op: "add",
      path: "/fields/System.Description",
      value: payload.description,
    });
  }

  if (payload.assignedTo) {
    patchDoc.push({
      op: "add",
      path: "/fields/System.AssignedTo",
      value: payload.assignedTo,
    });
  }

  if (payload.areaPath) {
    // Clean up path: strip leading backslash and remove \Area segment
    const cleanAreaPath = payload.areaPath.replace(/^\\/, "").replace(/\\Area(?=\\|$)/, "");
    patchDoc.push({
      op: "add",
      path: "/fields/System.AreaPath",
      value: cleanAreaPath,
    });
  }

  if (payload.iterationPath) {
    patchDoc.push({
      op: "add",
      path: "/fields/System.IterationPath",
      value: payload.iterationPath,
    });
  }

  if (payload.parentId) {
    patchDoc.push({
      op: "add",
      path: "/relations/-",
      value: {
        rel: "System.LinkTypes.Hierarchy-Reverse",
        url: `${getConfig()!.organizationUrl}/_apis/wit/workItems/${payload.parentId}`,
      },
    });
  }

  const typeEncoded = encodeURIComponent(payload.type);
  const result = await adoFetchValidated(
    `wit/workitems/$${typeEncoded}?api-version=7.1`,
    AdoWorkItemSchema,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(patchDoc),
    },
  );

  return mapWorkItemDetail(result);
}

export async function updateWorkItem(
  id: number,
  patch: WorkItemUpdatePatch,
): Promise<WorkItemDetail> {
  const patchDoc: AdoPatchOperation[] = [];

  if (patch.title !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.Title",
      value: patch.title,
    });
  }

  if (patch.description !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.Description",
      value: patch.description,
    });
  }

  if (patch.state !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.State",
      value: patch.state,
    });
  }

  if (patch.assignedTo !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.AssignedTo",
      value: patch.assignedTo,
    });
  }

  if (patch.areaPath !== undefined) {
    // Clean up path: strip leading backslash and remove \Area segment
    const cleanAreaPath = patch.areaPath.replace(/^\\/, "").replace(/\\Area(?=\\|$)/, "");
    patchDoc.push({
      op: "replace",
      path: "/fields/System.AreaPath",
      value: cleanAreaPath,
    });
  }

  if (patch.iterationPath !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.IterationPath",
      value: patch.iterationPath,
    });
  }

  const result = await adoFetchValidated(`wit/workitems/${id}?api-version=7.1`, AdoWorkItemSchema, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify(patchDoc),
  });

  return mapWorkItemDetail(result);
}

export async function searchIdentities(query: string): Promise<Identity[]> {
  const result = await adoFetchValidated(
    `IdentityPicker/Identities?api-version=7.1-preview.1`,
    AdoIdentitySearchResultSchema,
    {
      method: "POST",
      body: JSON.stringify({
        query,
        identityTypes: ["user"],
        operationScopes: ["ims", "source"],
        options: { MinResults: 5, MaxResults: 20 },
      }),
    },
    false,
  );

  return result.results.flatMap((r) =>
    r.identities.map((i) => ({
      id: i.localId || i.id,
      displayName: i.displayName,
      uniqueName: i.signInAddress || i.samAccountName || i.uniqueName || "",
      imageUrl: i.image || i.imageUrl,
    })),
  );
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const result = await adoFetchValidated(
    `IdentityPicker/Identities?api-version=7.1-preview.1`,
    AdoIdentitySearchResultSchema,
    {
      method: "POST",
      body: JSON.stringify({
        query,
        identityTypes: ["user"],
        operationScopes: ["ims", "source"],
        options: { MinResults: 5, MaxResults: 20 },
      }),
    },
    false,
  );

  return result.results.flatMap((r) =>
    r.identities.map((i) => ({
      id: i.localId || i.id,
      displayName: i.displayName,
      uniqueName: i.signInAddress || i.samAccountName || i.uniqueName || "",
      imageUrl: i.image || i.imageUrl,
    })),
  );
}

export async function listProjectUsers(): Promise<Identity[]> {
  // Get unique assignees from recent work items - this works with basic work item permissions
  const query = `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] <> '' ORDER BY [System.ChangedDate] DESC`;

  const wiqlResult = await adoFetch<{ workItems: { id: number }[] }>(
    "wit/wiql?$top=500&api-version=7.1",
    {
      method: "POST",
      body: JSON.stringify({ query }),
    },
  );

  if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
    return [];
  }

  // Fetch up to BATCH_SIZE work items to extract unique users
  const ids = wiqlResult.workItems.slice(0, BATCH_SIZE).map((w) => w.id);
  const idsParam = ids.join(",");

  const result = await adoFetchValidated(
    `wit/workitems?ids=${idsParam}&fields=System.AssignedTo&api-version=7.1`,
    AdoBatchWorkItemsSchema,
  );

  const uniqueUsers: Map<string, Identity> = new Map();

  for (const item of result.value) {
    const assignedTo = item.fields["System.AssignedTo"];
    if (assignedTo && !uniqueUsers.has(assignedTo.id)) {
      uniqueUsers.set(assignedTo.id, {
        id: assignedTo.id,
        displayName: assignedTo.displayName,
        uniqueName: assignedTo.uniqueName || assignedTo.displayName,
        imageUrl: assignedTo.imageUrl,
      });
    }
  }

  return Array.from(uniqueUsers.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );
}

export async function getWorkItemTypeStates(type: WorkItemType): Promise<WorkItemTypeState[]> {
  const typeEncoded = encodeURIComponent(type);
  const result = await adoFetchValidated(
    `wit/workitemtypes/${typeEncoded}/states?api-version=7.1`,
    AdoWorkItemTypeStatesSchema,
  );
  return result.value;
}

export async function listIterations(): Promise<Iteration[]> {
  const config = getConfig();
  if (!config) {
    throw new Error("Azure DevOps not configured");
  }

  const result = await adoFetchValidated(
    `work/teamsettings/iterations?api-version=7.1`,
    AdoIterationsSchema,
  );

  // Filter to iterations that ended within the last 3 months, or are current/future
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return result.value
    .filter((iteration) => {
      if (!iteration.attributes?.finishDate) {
        return true;
      }
      const finishDate = new Date(iteration.attributes.finishDate);
      return finishDate >= threeMonthsAgo;
    })
    .map((iteration) => ({
      id: iteration.id,
      name: iteration.name,
      path: iteration.path,
      startDate: iteration.attributes?.startDate,
      finishDate: iteration.attributes?.finishDate,
    }));
}

export async function listAreaPaths(): Promise<AreaPath[]> {
  const result = await adoFetchValidated(
    "wit/classificationnodes/areas?$depth=10&api-version=7.1",
    AdoClassificationNodeSchema,
  );

  // Flatten the tree structure into a list
  const areas: AreaPath[] = [];

  function traverse(node: AdoClassificationNode) {
    // API returns paths like "\ProjectName\Area\ActualArea\SubArea"
    // but work items expect "ProjectName\ActualArea\SubArea"
    // So we need to: 1) strip leading backslash, 2) remove the "\Area" segment
    const cleanPath = node.path
      .replace(/^\\/, "") // Remove leading backslash
      .replace(/\\Area(?=\\|$)/, ""); // Remove \Area segment (but not if it's part of a name)
    areas.push({
      id: node.id,
      name: node.name,
      path: cleanPath,
      hasChildren: node.hasChildren,
    });
    if (node.children) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  traverse(result);
  return areas;
}
