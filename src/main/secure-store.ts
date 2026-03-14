import fs from "node:fs";
import path from "node:path";
import { app, safeStorage } from "electron";

const PAT_FILE = "pat.enc";

let cachedPat: string | null = null;

function getPatPath(): string {
  const userDataPath = app.getPath("userData");
  return path.join(userDataPath, PAT_FILE);
}

export function setPat(pat: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Encryption is not available on this system");
  }

  const encrypted = safeStorage.encryptString(pat);
  const patPath = getPatPath();
  const userDataPath = app.getPath("userData");

  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  fs.writeFileSync(patPath, encrypted);
  cachedPat = pat;
}

export function getPat(): string | null {
  if (cachedPat !== null) {
    return cachedPat;
  }
  try {
    const patPath = getPatPath();
    if (fs.existsSync(patPath)) {
      const encrypted = fs.readFileSync(patPath);
      cachedPat = safeStorage.decryptString(encrypted);
      return cachedPat;
    }
  } catch (error) {
    console.error("Failed to read PAT:", error);
  }
  return null;
}

export function clearPat(): void {
  cachedPat = null;
  const patPath = getPatPath();
  if (fs.existsSync(patPath)) {
    fs.unlinkSync(patPath);
  }
}

export function hasPat(): boolean {
  const patPath = getPatPath();
  return fs.existsSync(patPath);
}
