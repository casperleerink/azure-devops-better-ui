import { getConfig } from "./store";
import { getPat } from "./secure-store";
import type {
  WorkItemSummary,
  WorkItemDetail,
  WorkItemListFilters,
  WorkItemCreatePayload,
  WorkItemUpdatePatch,
  Identity,
  WorkItemType,
} from "../shared/types";

function getAuthHeader(): string {
  const pat = getPat();
  if (!pat) {
    throw new Error("PAT not configured");
  }
  return `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;
}

async function adoFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error("Azure DevOps not configured");
  }

  const url = `${config.organizationUrl}/${config.projectName}/_apis/${endpoint}`;

  const response = await fetch(url, {
    ...options,
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
}

async function adoFetchOrg<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = getConfig();
  if (!config) {
    throw new Error("Azure DevOps not configured");
  }

  const url = `${config.organizationUrl}/_apis/${endpoint}`;

  const response = await fetch(url, {
    ...options,
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

    // Test by fetching project info
    await adoFetch("projects?api-version=7.1");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildWiqlQuery(filters: WorkItemListFilters): string {
  const conditions: string[] = [];

  // Work item types
  if (filters.types.length > 0) {
    const typeConditions = filters.types.map((t) => `[System.WorkItemType] = '${t}'`);
    conditions.push(`(${typeConditions.join(" OR ")})`);
  }

  // Assigned to
  if (filters.assignedTo === "me") {
    conditions.push("[System.AssignedTo] = @Me");
  } else if (filters.assignedTo && typeof filters.assignedTo === "object") {
    conditions.push(`[System.AssignedTo] = '${filters.assignedTo.identityId}'`);
  }

  // States
  if (filters.states && filters.states.length > 0) {
    const stateConditions = filters.states.map((s) => `[System.State] = '${s}'`);
    conditions.push(`(${stateConditions.join(" OR ")})`);
  }

  // Text search
  if (filters.text) {
    conditions.push(`[System.Title] CONTAINS '${filters.text}'`);
  }

  // Area Path
  if (filters.areaPath) {
    conditions.push(`[System.AreaPath] UNDER '${filters.areaPath}'`);
  }

  // Iteration Path
  if (filters.iterationPath) {
    conditions.push(`[System.IterationPath] UNDER '${filters.iterationPath}'`);
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

function mapWorkItem(item: any): WorkItemSummary {
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

function mapWorkItemDetail(item: any): WorkItemDetail {
  const summary = mapWorkItem(item);

  // Find parent relation
  let parentId: number | undefined;
  if (item.relations) {
    const parentRelation = item.relations.find(
      (r: any) => r.rel === "System.LinkTypes.Hierarchy-Reverse"
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
  const wiqlResult = await adoFetch<{ workItems: { id: number }[] }>(
    "wit/wiql?api-version=7.1",
    {
      method: "POST",
      body: JSON.stringify({ query }),
    }
  );

  if (!wiqlResult.workItems || wiqlResult.workItems.length === 0) {
    return [];
  }

  // Batch fetch work items (max 200 at a time)
  const ids = wiqlResult.workItems.map((w) => w.id);
  const batchSize = 200;
  const results: WorkItemSummary[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batchIds = ids.slice(i, i + batchSize);
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

    const batchResult = await adoFetch<{ value: any[] }>(
      `wit/workitems?ids=${idsParam}&fields=${fields}&api-version=7.1`
    );

    results.push(...batchResult.value.map(mapWorkItem));
  }

  return results;
}

export async function getWorkItem(id: number): Promise<WorkItemDetail> {
  const result = await adoFetch<any>(
    `wit/workitems/${id}?$expand=relations&api-version=7.1`
  );
  return mapWorkItemDetail(result);
}

export async function createWorkItem(
  payload: WorkItemCreatePayload
): Promise<WorkItemDetail> {
  const patchDoc: { op: string; path: string; value: any }[] = [
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
    patchDoc.push({
      op: "add",
      path: "/fields/System.AreaPath",
      value: payload.areaPath,
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
  const result = await adoFetch<any>(
    `wit/workitems/$${typeEncoded}?api-version=7.1`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json-patch+json",
      },
      body: JSON.stringify(patchDoc),
    }
  );

  return mapWorkItemDetail(result);
}

export async function updateWorkItem(
  id: number,
  patch: WorkItemUpdatePatch
): Promise<WorkItemDetail> {
  const patchDoc: { op: string; path: string; value: any }[] = [];

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
    patchDoc.push({
      op: "replace",
      path: "/fields/System.AreaPath",
      value: patch.areaPath,
    });
  }

  if (patch.iterationPath !== undefined) {
    patchDoc.push({
      op: "replace",
      path: "/fields/System.IterationPath",
      value: patch.iterationPath,
    });
  }

  const result = await adoFetch<any>(`wit/workitems/${id}?api-version=7.1`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify(patchDoc),
  });

  return mapWorkItemDetail(result);
}

export async function searchIdentities(query: string): Promise<Identity[]> {
  const result = await adoFetchOrg<{ results: any[] }>(
    `IdentityPicker/Identities?api-version=7.1-preview.1`,
    {
      method: "POST",
      body: JSON.stringify({
        query,
        identityTypes: ["user"],
        operationScopes: ["ims", "source"],
        options: { MinResults: 5, MaxResults: 20 },
      }),
    }
  );

  return result.results.flatMap((r: any) =>
    r.identities.map((i: any) => ({
      id: i.localId,
      displayName: i.displayName,
      uniqueName: i.signInAddress || i.samAccountName,
      imageUrl: i.image,
    }))
  );
}

export async function listProjectUsers(): Promise<Identity[]> {
  const config = getConfig();
  if (!config) {
    throw new Error("Azure DevOps not configured");
  }

  // Get team members - this is a common approach
  const result = await adoFetch<{ value: any[] }>(
    `teams?api-version=7.1`
  );

  const allMembers: Map<string, Identity> = new Map();

  for (const team of result.value.slice(0, 5)) {
    try {
      const members = await adoFetch<{ value: any[] }>(
        `teams/${team.id}/members?api-version=7.1`
      );
      for (const member of members.value) {
        if (member.identity && !allMembers.has(member.identity.id)) {
          allMembers.set(member.identity.id, {
            id: member.identity.id,
            displayName: member.identity.displayName,
            uniqueName: member.identity.uniqueName,
            imageUrl: member.identity.imageUrl,
          });
        }
      }
    } catch {
      // Skip teams we can't access
    }
  }

  return Array.from(allMembers.values());
}
