export type WorkItemType = "Epic" | "Feature" | "User Story" | "Task";

export type WorkItemSummary = {
  id: number;
  url: string;
  type: WorkItemType;
  title: string;
  state: string;
  assignedTo?: { displayName: string; uniqueName?: string };
  areaPath?: string;
  iterationPath?: string;
  changedDate?: string;
};

export type WorkItemDetail = WorkItemSummary & {
  descriptionHtml?: string;
  tags?: string[];
  parentId?: number;
};

export type WorkItemListFilters = {
  assignedTo?: "me" | { identityId: string; uniqueName: string };
  types: WorkItemType[];
  states?: string[];
  text?: string;
  areaPath?: string;
  iterationPath?: string;
  changedSinceDays?: number;
  sort?: "changedDesc" | "createdDesc";
};

export type WorkItemCreatePayload = {
  type: WorkItemType;
  title: string;
  description?: string;
  assignedTo?: string;
  parentId?: number;
  areaPath?: string;
  iterationPath?: string;
};

export type WorkItemUpdatePatch = {
  title?: string;
  description?: string;
  state?: string;
  assignedTo?: string;
  areaPath?: string;
  iterationPath?: string;
};

/**
 * JSON Patch operations for Azure DevOps API
 * Discriminated union ensures type safety based on operation type
 */
export type AdoPatchOperation =
  | { op: "add"; path: string; value: unknown }
  | { op: "replace"; path: string; value: unknown }
  | { op: "remove"; path: string }
  | { op: "test"; path: string; value: unknown }
  | { op: "copy"; from: string; path: string }
  | { op: "move"; from: string; path: string };

export type AdoConfig = {
  organizationUrl: string;
  projectName: string;
  defaultAreaPath?: string;
};

export type Identity = {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl?: string;
};

export type UserSearchResult = {
  id: string;
  displayName: string;
  uniqueName: string;
  imageUrl?: string;
};

export type WorkItemTypeState = {
  name: string;
  color: string;
  category: string;
};

export type Iteration = {
  id: string;
  name: string;
  path: string;
  startDate?: string;
  finishDate?: string;
};

export type AreaPath = {
  id: number;
  name: string;
  path: string;
  hasChildren: boolean;
};

// IPC Channel types
export type IpcChannels = {
  // Config
  "ado:config:get": () => Promise<AdoConfig | null>;
  "ado:config:set": (config: AdoConfig) => Promise<void>;

  // Auth
  "ado:auth:setPat": (pat: string) => Promise<void>;
  "ado:auth:clearPat": () => Promise<void>;
  "ado:auth:test": () => Promise<{ success: boolean; error?: string }>;
  "ado:auth:hasPat": () => Promise<boolean>;

  // Identities
  "ado:identities:search": (query: string) => Promise<Identity[]>;
  "ado:identities:listProjectUsers": () => Promise<Identity[]>;
  "ado:identities:getCurrentUser": () => Promise<Identity>;

  // Users
  "ado:users:search": (query: string) => Promise<UserSearchResult[]>;

  // Work Items
  "ado:workItems:list": (filters: WorkItemListFilters) => Promise<WorkItemSummary[]>;
  "ado:workItems:get": (id: number) => Promise<WorkItemDetail>;
  "ado:workItems:create": (payload: WorkItemCreatePayload) => Promise<WorkItemDetail>;
  "ado:workItems:update": (id: number, patch: WorkItemUpdatePatch) => Promise<WorkItemDetail>;
  "ado:workItems:getTypeStates": (type: WorkItemType) => Promise<WorkItemTypeState[]>;
  "ado:workItems:listChildren": (parentId: number) => Promise<WorkItemSummary[]>;
  "ado:workItems:updateParent": (
    workItemId: number,
    parentId: number | null,
  ) => Promise<WorkItemDetail>;

  // Iterations
  "ado:iterations:list": () => Promise<Iteration[]>;

  // Area Paths
  "ado:areaPaths:list": () => Promise<AreaPath[]>;
};
