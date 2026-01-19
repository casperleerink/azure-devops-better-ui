import { z } from "zod";

/**
 * Azure DevOps API Response Schemas
 *
 * These schemas validate responses from the Azure DevOps REST API.
 * All schemas use liberal .optional() for non-critical fields to handle
 * API variations across different Azure DevOps versions and configurations.
 */

// Identity schema (used in AssignedTo fields and identity searches)
export const AdoIdentitySchema = z.object({
  id: z.string(),
  displayName: z.string(),
  uniqueName: z.string().optional(),
  signInAddress: z.string().optional(),
  samAccountName: z.string().optional(),
  imageUrl: z.string().optional(),
  localId: z.string().optional(),
  image: z.string().optional(),
});

export type AdoIdentity = z.infer<typeof AdoIdentitySchema>;

// Work item fields (flexible object for dynamic field access)
// All fields are optional to handle partial responses when specific fields are requested
export const AdoWorkItemFieldsSchema = z.object({
  "System.Id": z.number().optional(),
  "System.Title": z.string().optional(),
  "System.WorkItemType": z.string().optional(),
  "System.State": z.string().optional(),
  "System.AssignedTo": AdoIdentitySchema.optional(),
  "System.AreaPath": z.string().optional(),
  "System.IterationPath": z.string().optional(),
  "System.ChangedDate": z.string().optional(),
  "System.Description": z.string().optional(),
  "System.Tags": z.string().optional(),
  "System.CreatedDate": z.string().optional(),
});

export type AdoWorkItemFields = z.infer<typeof AdoWorkItemFieldsSchema>;

// Work item relation (for parent/child links)
export const AdoRelationSchema = z.object({
  rel: z.string(),
  url: z.string(),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type AdoRelation = z.infer<typeof AdoRelationSchema>;

// Full work item response
export const AdoWorkItemSchema = z.object({
  id: z.number(),
  url: z.string(),
  fields: AdoWorkItemFieldsSchema,
  relations: z.array(AdoRelationSchema).optional(),
});

export type AdoWorkItem = z.infer<typeof AdoWorkItemSchema>;

// WIQL query results
export const AdoWiqlResultSchema = z.object({
  workItems: z
    .array(
      z.object({
        id: z.number(),
      }),
    )
    .optional(),
  workItemRelations: z
    .array(
      z.object({
        source: z.object({ id: z.number() }).nullable().optional(),
        target: z.object({ id: z.number() }).nullable().optional(),
      }),
    )
    .optional(),
});

export type AdoWiqlResult = z.infer<typeof AdoWiqlResultSchema>;

// Batch work items response
export const AdoBatchWorkItemsSchema = z.object({
  value: z.array(AdoWorkItemSchema),
});

export type AdoBatchWorkItems = z.infer<typeof AdoBatchWorkItemsSchema>;

// Connection data (for current user)
export const AdoConnectionDataSchema = z.object({
  authenticatedUser: z.object({
    id: z.string(),
    descriptor: z.string(),
    subjectDescriptor: z.string(),
    providerDisplayName: z.string(),
    customDisplayName: z.string().optional(),
    isActive: z.boolean(),
    properties: z.object({
      Account: z.object({
        $value: z.string(),
      }),
    }),
  }),
});

export type AdoConnectionData = z.infer<typeof AdoConnectionDataSchema>;

// Identity search results
export const AdoIdentitySearchResultSchema = z.object({
  results: z.array(
    z.object({
      identities: z.array(AdoIdentitySchema),
    }),
  ),
});

export type AdoIdentitySearchResult = z.infer<typeof AdoIdentitySearchResultSchema>;

// Work item type states
export const AdoWorkItemTypeStateSchema = z.object({
  name: z.string(),
  color: z.string().default(""),
  category: z.string().default(""),
});

export const AdoWorkItemTypeStatesSchema = z.object({
  value: z.array(AdoWorkItemTypeStateSchema),
});

export type AdoWorkItemTypeStates = z.infer<typeof AdoWorkItemTypeStatesSchema>;

// Iterations
export const AdoIterationSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  attributes: z
    .object({
      startDate: z.string().optional(),
      finishDate: z.string().optional(),
    })
    .optional(),
});

export const AdoIterationsSchema = z.object({
  value: z.array(AdoIterationSchema),
});

export type AdoIterations = z.infer<typeof AdoIterationsSchema>;

// Classification nodes (for area paths) - recursive structure
type AdoClassificationNodeType = {
  id: number;
  name: string;
  path: string;
  hasChildren: boolean;
  children?: AdoClassificationNodeType[];
};

export const AdoClassificationNodeSchema: z.ZodType<AdoClassificationNodeType> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    path: z.string(),
    hasChildren: z.boolean(),
    children: z.array(AdoClassificationNodeSchema).optional(),
  }),
);

export type AdoClassificationNode = AdoClassificationNodeType;
