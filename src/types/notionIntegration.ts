export interface NotionIntegration {
  id: string;
  integrationName: string;
  createdAt: string; // Assuming ISO date string
  // You might want to add other relevant fields here in the future,
  // e.g., workspace_name, workspace_icon, etc.
  // For now, keeping it simple as per the requirements.
}

export interface NotionDatabase {
  id: string;
  name: string;
}

export interface NotionPropertyOption {
  id: string;
  name: string;
  color?: string;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: string;
  options?: NotionPropertyOption[];
}
