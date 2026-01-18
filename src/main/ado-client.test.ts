import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandlers } from "../test/msw/handlers";
import { server } from "../test/msw/server";

// Mock the store and secure-store modules
vi.mock("./store", () => ({
  getConfig: vi.fn(() => ({
    organizationUrl: "https://dev.azure.com/test-org",
    projectName: "test-project",
  })),
}));

vi.mock("./secure-store", () => ({
  getPat: vi.fn(() => "test-pat-token"),
}));

// Import after mocks are set up
import { getCurrentUser, getWorkItem, listWorkItems, testConnection } from "./ado-client";
import { getPat } from "./secure-store";
import { getConfig } from "./store";

describe("ado-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listWorkItems", () => {
    it("returns parsed work items with correct fields", async () => {
      const filters = {
        types: ["Task" as const],
      };

      const result = await listWorkItems(filters);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 123,
        title: "Work Item 123",
        type: "Task",
        state: "Active",
      });
      expect(result[0].assignedTo).toEqual({
        displayName: "Test User",
        uniqueName: "test@example.com",
      });
    });

    it("returns empty array when no work items match", async () => {
      server.use(
        http.post("https://dev.azure.com/test-org/test-project/_apis/wit/wiql", () => {
          return HttpResponse.json({ workItems: [] });
        }),
      );

      const result = await listWorkItems({ types: [] });

      expect(result).toHaveLength(0);
    });

    it("preserves order from WIQL query", async () => {
      server.use(
        http.post("https://dev.azure.com/test-org/test-project/_apis/wit/wiql", () => {
          return HttpResponse.json({
            workItems: [{ id: 456 }, { id: 123 }],
          });
        }),
      );

      const result = await listWorkItems({ types: [] });

      expect(result[0].id).toBe(456);
      expect(result[1].id).toBe(123);
    });
  });

  describe("getWorkItem", () => {
    it("fetches single work item by id", async () => {
      const result = await getWorkItem(123);

      expect(result).toMatchObject({
        id: 123,
        title: "Test Work Item",
        type: "Task",
        state: "Active",
        descriptionHtml: "<p>Test description</p>",
      });
    });

    it("includes tags when present", async () => {
      const result = await getWorkItem(123);

      expect(result.tags).toEqual(["tag1", "tag2"]);
    });

    it("includes parent ID from relations", async () => {
      const result = await getWorkItem(123);

      expect(result.parentId).toBe(100);
    });
  });

  describe("authentication", () => {
    it("includes Authorization header in requests", async () => {
      let capturedAuth: string | null = null;

      server.use(
        http.post("https://dev.azure.com/test-org/test-project/_apis/wit/wiql", ({ request }) => {
          capturedAuth = request.headers.get("Authorization");
          return HttpResponse.json({ workItems: [] });
        }),
      );

      await listWorkItems({ types: [] });

      expect(capturedAuth).toBe(`Basic ${Buffer.from(":test-pat-token").toString("base64")}`);
    });

    it("throws error when PAT is not configured", async () => {
      vi.mocked(getPat).mockReturnValueOnce(null);

      await expect(listWorkItems({ types: [] })).rejects.toThrow("PAT not configured");
    });

    it("throws error when config is not set", async () => {
      vi.mocked(getConfig).mockReturnValueOnce(null);

      await expect(listWorkItems({ types: [] })).rejects.toThrow("Azure DevOps not configured");
    });
  });

  describe("error handling", () => {
    it("throws error on API failure with status text", async () => {
      server.use(
        http.post("https://dev.azure.com/test-org/test-project/_apis/wit/wiql", () => {
          return new HttpResponse("Unauthorized - Invalid PAT", { status: 401 });
        }),
      );

      await expect(listWorkItems({ types: [] })).rejects.toThrow(
        "Azure DevOps API error: 401 Unauthorized - Invalid PAT",
      );
    });

    it("handles 404 for non-existent work item", async () => {
      server.use(
        http.get("https://dev.azure.com/test-org/test-project/_apis/wit/workitems/:id", () => {
          return new HttpResponse("Work item not found", { status: 404 });
        }),
      );

      await expect(getWorkItem(99999)).rejects.toThrow("Azure DevOps API error: 404");
    });

    it("handles 500 server errors", async () => {
      server.use(errorHandlers.serverError);

      await expect(listWorkItems({ types: [] })).rejects.toThrow("Azure DevOps API error: 500");
    });
  });

  describe("testConnection", () => {
    it("returns success when API responds", async () => {
      const result = await testConnection();

      expect(result).toEqual({ success: true });
    });

    it("returns error when PAT is not configured", async () => {
      vi.mocked(getPat).mockReturnValueOnce(null);

      const result = await testConnection();

      expect(result).toEqual({
        success: false,
        error: "PAT not configured",
      });
    });

    it("returns error when config is not set", async () => {
      vi.mocked(getConfig).mockReturnValueOnce(null);

      const result = await testConnection();

      expect(result).toEqual({
        success: false,
        error: "Azure DevOps not configured",
      });
    });

    it("returns error message on API failure", async () => {
      server.use(
        http.get("https://dev.azure.com/test-org/_apis/projects", () => {
          return new HttpResponse("Forbidden", { status: 403 });
        }),
      );

      const result = await testConnection();

      expect(result.success).toBe(false);
      expect(result.error).toContain("403");
    });
  });

  describe("getCurrentUser", () => {
    it("returns user identity from connection data", async () => {
      const result = await getCurrentUser();

      expect(result).toEqual({
        id: "user-123",
        displayName: "Test User",
        uniqueName: "test@example.com",
      });
    });
  });
});
