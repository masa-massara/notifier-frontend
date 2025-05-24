export interface Template {
  id: string;
  name: string;
  notionIntegrationId: string;
  destinationId: string;
  notionDatabaseId: string;
  conditions: string | Record<string, any>; // Placeholder: string or simple object
  messageBody: string;
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
