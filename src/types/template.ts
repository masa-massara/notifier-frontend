export interface TemplateCondition {
  propertyId: string;
  operator: string;
  value: any; // Keeping as 'any' for now as per instruction
}

export interface Template {
  id: string;
  name: string;
  userNotionIntegrationId: string;
  destinationId: string;
  notionDatabaseId: string;
  conditions: TemplateCondition[]; // Updated type
  body: string;
  updatedAt?: string; // Assuming this might come from the backend for "Last Updated"
  createdAt?: string;

  // Optional fields for display purposes, might be populated after fetching related data
  // or if the backend provides them joined.
  notionIntegrationName?: string;
  destinationName?: string;
}

// For creation, we omit 'id' and the optional display names
export type CreateTemplateData = Omit<
  Template,
  "id" | "notionIntegrationName" | "destinationName" | "updatedAt" | "createdAt"
>;

// For updates, all fields are partial, and we omit 'id' and optional display names
export type UpdateTemplateData = Partial<CreateTemplateData>;
