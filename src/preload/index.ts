import { contextBridge, ipcRenderer } from "electron";
import type {
  AdoConfig,
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

const api = {
  config: {
    get: (): Promise<AdoConfig | null> => ipcRenderer.invoke("ado:config:get"),
    set: (config: AdoConfig): Promise<void> => ipcRenderer.invoke("ado:config:set", config),
  },
  auth: {
    setPat: (pat: string): Promise<void> => ipcRenderer.invoke("ado:auth:setPat", pat),
    clearPat: (): Promise<void> => ipcRenderer.invoke("ado:auth:clearPat"),
    test: (): Promise<{ success: boolean; error?: string }> => ipcRenderer.invoke("ado:auth:test"),
    hasPat: (): Promise<boolean> => ipcRenderer.invoke("ado:auth:hasPat"),
  },
  identities: {
    search: (query: string): Promise<Identity[]> =>
      ipcRenderer.invoke("ado:identities:search", query),
    listProjectUsers: (): Promise<Identity[]> =>
      ipcRenderer.invoke("ado:identities:listProjectUsers"),
    getCurrentUser: (): Promise<Identity> => ipcRenderer.invoke("ado:identities:getCurrentUser"),
  },
  users: {
    search: (query: string): Promise<UserSearchResult[]> =>
      ipcRenderer.invoke("ado:users:search", query),
  },
  workItems: {
    list: (filters: WorkItemListFilters): Promise<WorkItemSummary[]> =>
      ipcRenderer.invoke("ado:workItems:list", filters),
    get: (id: number): Promise<WorkItemDetail> => ipcRenderer.invoke("ado:workItems:get", id),
    create: (payload: WorkItemCreatePayload): Promise<WorkItemDetail> =>
      ipcRenderer.invoke("ado:workItems:create", payload),
    update: (id: number, patch: WorkItemUpdatePatch): Promise<WorkItemDetail> =>
      ipcRenderer.invoke("ado:workItems:update", id, patch),
    getTypeStates: (type: WorkItemType): Promise<WorkItemTypeState[]> =>
      ipcRenderer.invoke("ado:workItems:getTypeStates", type),
    listChildren: (parentId: number): Promise<WorkItemSummary[]> =>
      ipcRenderer.invoke("ado:workItems:listChildren", parentId),
  },
  iterations: {
    list: (): Promise<Iteration[]> => ipcRenderer.invoke("ado:iterations:list"),
  },
  areaPaths: {
    list: (): Promise<AreaPath[]> => ipcRenderer.invoke("ado:areaPaths:list"),
  },
};

contextBridge.exposeInMainWorld("ado", api);

// Type declaration for the renderer
export type AdoApi = typeof api;
