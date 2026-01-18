import { ipcMain } from "electron";
import type {
  AdoConfig,
  WorkItemCreatePayload,
  WorkItemListFilters,
  WorkItemType,
  WorkItemUpdatePatch,
} from "../shared/types";
import {
  createWorkItem,
  getCurrentUser,
  getWorkItem,
  getWorkItemTypeStates,
  listAreaPaths,
  listIterations,
  listProjectUsers,
  listWorkItems,
  searchIdentities,
  searchUsers,
  testConnection,
  updateWorkItem,
} from "./ado-client";
import { clearPat, hasPat, setPat } from "./secure-store";
import { getConfig, setConfig } from "./store";

export function registerIpcHandlers() {
  // Config handlers
  ipcMain.handle("ado:config:get", async () => {
    return getConfig();
  });

  ipcMain.handle("ado:config:set", async (_, config: AdoConfig) => {
    setConfig(config);
  });

  // Auth handlers
  ipcMain.handle("ado:auth:setPat", async (_, pat: string) => {
    setPat(pat);
  });

  ipcMain.handle("ado:auth:clearPat", async () => {
    clearPat();
  });

  ipcMain.handle("ado:auth:test", async () => {
    return testConnection();
  });

  ipcMain.handle("ado:auth:hasPat", async () => {
    return hasPat();
  });

  // Identity handlers
  ipcMain.handle("ado:identities:search", async (_, query: string) => {
    return searchIdentities(query);
  });

  ipcMain.handle("ado:identities:listProjectUsers", async () => {
    return listProjectUsers();
  });

  ipcMain.handle("ado:identities:getCurrentUser", async () => {
    return getCurrentUser();
  });

  // User handlers
  ipcMain.handle("ado:users:search", async (_, query: string) => {
    return searchUsers(query);
  });

  // Work item handlers
  ipcMain.handle("ado:workItems:list", async (_, filters: WorkItemListFilters) => {
    return listWorkItems(filters);
  });

  ipcMain.handle("ado:workItems:get", async (_, id: number) => {
    return getWorkItem(id);
  });

  ipcMain.handle("ado:workItems:create", async (_, payload: WorkItemCreatePayload) => {
    return createWorkItem(payload);
  });

  ipcMain.handle("ado:workItems:update", async (_, id: number, patch: WorkItemUpdatePatch) => {
    return updateWorkItem(id, patch);
  });

  ipcMain.handle("ado:workItems:getTypeStates", async (_, type: WorkItemType) => {
    return getWorkItemTypeStates(type);
  });

  // Iteration handlers
  ipcMain.handle("ado:iterations:list", async () => {
    return listIterations();
  });

  // Area path handlers
  ipcMain.handle("ado:areaPaths:list", async () => {
    return listAreaPaths();
  });
}
