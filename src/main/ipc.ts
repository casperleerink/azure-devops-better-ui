import { ipcMain } from "electron";
import { getConfig, setConfig } from "./store";
import { setPat, clearPat, hasPat } from "./secure-store";
import {
  testConnection,
  listWorkItems,
  getWorkItem,
  createWorkItem,
  updateWorkItem,
  searchIdentities,
  listProjectUsers,
} from "./ado-client";
import type {
  AdoConfig,
  WorkItemListFilters,
  WorkItemCreatePayload,
  WorkItemUpdatePatch,
} from "../shared/types";

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
}
