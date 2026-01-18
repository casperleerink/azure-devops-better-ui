import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw/server";

// Mock Electron modules that are not available in Node.js test environment
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/tmp/test-app-data"),
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((str: string) => Buffer.from(`encrypted:${str}`)),
    decryptString: vi.fn((buf: Buffer) => buf.toString().replace("encrypted:", "")),
  },
}));

// Start server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
  server.close();
});
