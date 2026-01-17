import { safeStorage, app } from "electron";
import fs from "fs";
import path from "path";

const PAT_FILE = "pat.enc";

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
}

export function getPat(): string | null {
  try {
    const patPath = getPatPath();
    if (fs.existsSync(patPath)) {
      const encrypted = fs.readFileSync(patPath);
      return safeStorage.decryptString(encrypted);
    }
  } catch (error) {
    console.error("Failed to read PAT:", error);
  }
  return null;
}

export function clearPat(): void {
  const patPath = getPatPath();
  if (fs.existsSync(patPath)) {
    fs.unlinkSync(patPath);
  }
}

export function hasPat(): boolean {
  const patPath = getPatPath();
  return fs.existsSync(patPath);
}
