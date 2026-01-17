import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import type { AdoConfig } from "../shared/types";

const CONFIG_FILE = "config.json";

function getConfigPath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, CONFIG_FILE);
}

export function getConfig(): AdoConfig | null {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(data) as AdoConfig;
    }
  } catch (error) {
    console.error("Failed to read config:", error);
  }
  return null;
}

export function setConfig(config: AdoConfig): void {
  const configPath = getConfigPath();
  const userDataPath = app.getPath("userData");

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
