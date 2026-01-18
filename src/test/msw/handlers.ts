import { HttpResponse, http } from "msw";

const BASE_URL = "https://dev.azure.com/test-org";
const PROJECT = "test-project";

// Mock work item data
export const mockWorkItem = {
  id: 123,
  url: `${BASE_URL}/${PROJECT}/_apis/wit/workItems/123`,
  fields: {
    "System.Id": 123,
    "System.Title": "Test Work Item",
    "System.WorkItemType": "Task",
    "System.State": "Active",
    "System.AssignedTo": {
      displayName: "Test User",
      uniqueName: "test@example.com",
    },
    "System.AreaPath": "test-project\\Area1",
    "System.IterationPath": "test-project\\Sprint1",
    "System.ChangedDate": "2024-01-15T10:00:00Z",
    "System.Description": "<p>Test description</p>",
    "System.Tags": "tag1;tag2",
  },
  relations: [
    {
      rel: "System.LinkTypes.Hierarchy-Reverse",
      url: `${BASE_URL}/_apis/wit/workItems/100`,
    },
  ],
};

export const mockWorkItemSummary = {
  id: 123,
  url: `${BASE_URL}/${PROJECT}/_apis/wit/workItems/123`,
  fields: {
    "System.Id": 123,
    "System.Title": "Test Work Item",
    "System.WorkItemType": "Task",
    "System.State": "Active",
    "System.AssignedTo": {
      displayName: "Test User",
      uniqueName: "test@example.com",
    },
    "System.AreaPath": "test-project\\Area1",
    "System.IterationPath": "test-project\\Sprint1",
    "System.ChangedDate": "2024-01-15T10:00:00Z",
  },
};

export const handlers = [
  // WIQL query - list work items
  http.post(`${BASE_URL}/${PROJECT}/_apis/wit/wiql`, () => {
    return HttpResponse.json({
      workItems: [{ id: 123 }, { id: 456 }],
    });
  }),

  // Get work items by IDs (batch)
  http.get(`${BASE_URL}/${PROJECT}/_apis/wit/workitems`, ({ request }) => {
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",") || [];

    const items = ids.map((id) => ({
      ...mockWorkItemSummary,
      id: Number.parseInt(id, 10),
      fields: {
        ...mockWorkItemSummary.fields,
        "System.Id": Number.parseInt(id, 10),
        "System.Title": `Work Item ${id}`,
      },
    }));

    return HttpResponse.json({ value: items });
  }),

  // Get single work item
  http.get(`${BASE_URL}/${PROJECT}/_apis/wit/workitems/:id`, ({ params }) => {
    const id = Number.parseInt(params.id as string, 10);
    return HttpResponse.json({
      ...mockWorkItem,
      id,
      fields: {
        ...mockWorkItem.fields,
        "System.Id": id,
      },
    });
  }),

  // Create work item
  http.post(`${BASE_URL}/${PROJECT}/_apis/wit/workitems/:type`, async ({ request }) => {
    const body = (await request.json()) as {
      op: string;
      path: string;
      value: unknown;
    }[];
    const titlePatch = body.find((p) => p.path === "/fields/System.Title");

    return HttpResponse.json({
      ...mockWorkItem,
      id: 999,
      fields: {
        ...mockWorkItem.fields,
        "System.Id": 999,
        "System.Title": titlePatch?.value || "New Work Item",
      },
    });
  }),

  // Update work item
  http.patch(`${BASE_URL}/${PROJECT}/_apis/wit/workitems/:id`, async ({ params, request }) => {
    const id = Number.parseInt(params.id as string, 10);
    const body = (await request.json()) as {
      op: string;
      path: string;
      value: unknown;
    }[];
    const titlePatch = body.find((p) => p.path === "/fields/System.Title");

    return HttpResponse.json({
      ...mockWorkItem,
      id,
      fields: {
        ...mockWorkItem.fields,
        "System.Id": id,
        "System.Title": titlePatch?.value || mockWorkItem.fields["System.Title"],
      },
    });
  }),

  // Test connection - list projects
  http.get(`${BASE_URL}/_apis/projects`, () => {
    return HttpResponse.json({
      value: [{ id: "1", name: "test-project" }],
    });
  }),

  // Get current user
  http.get(`${BASE_URL}/_apis/connectionData`, () => {
    return HttpResponse.json({
      authenticatedUser: {
        id: "user-123",
        descriptor: "desc",
        subjectDescriptor: "subj",
        providerDisplayName: "Test User",
        isActive: true,
        properties: {
          Account: { $value: "test@example.com" },
        },
      },
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  unauthorized: http.post(`${BASE_URL}/${PROJECT}/_apis/wit/wiql`, () => {
    return new HttpResponse("Unauthorized", { status: 401 });
  }),

  notFound: http.get(`${BASE_URL}/${PROJECT}/_apis/wit/workitems/:id`, () => {
    return new HttpResponse("Work item not found", { status: 404 });
  }),

  serverError: http.post(`${BASE_URL}/${PROJECT}/_apis/wit/wiql`, () => {
    return new HttpResponse("Internal Server Error", { status: 500 });
  }),
};
