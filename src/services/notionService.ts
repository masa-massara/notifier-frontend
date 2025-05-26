// Removed: import { fetchApiClient } from "../lib/apiClient";
import { NotionDatabase, NotionProperty } from "../types/notionIntegration"; // Added NotionProperty

// Define a type for the API client methods expected by the service
export interface ApiClientMethods {
  get: (url: string, options?: RequestInit) => Promise<Response>;
  post: (url: string, body: any, options?: RequestInit) => Promise<Response>;
  put: (url: string, body: any, options?: RequestInit) => Promise<Response>;
  del: (url: string, options?: RequestInit) => Promise<Response>; // 'del' for delete
}

/**
 * Helper function to handle errors by attempting to parse response body.
 */
async function handleErrorResponse(response: Response, defaultMessage: string) {
  let errorBody = defaultMessage;
  try {
    const text = await response.text();
    if (text) {
      errorBody = `${defaultMessage}: ${response.status} ${text}`;
    }
  } catch (e) {
    // Ignore if reading text fails, use default message
  }
  return new Error(errorBody);
}

export async function getNotionDatabases(
  api: ApiClientMethods,
  integrationId: string
): Promise<NotionDatabase[]> {
  const response = await api.get(`/me/notion-integrations/${integrationId}/databases`);

  if (!response.ok) {
    throw await handleErrorResponse(response, "Failed to fetch Notion databases");
  }

  const data = await response.json();
  return data as NotionDatabase[];
}

export async function getNotionDatabaseProperties(
  api: ApiClientMethods,
	integrationId: string, // integrationId is part of the URL path, not a query param here based on original
	databaseId: string
): Promise<NotionProperty[]> {
	const response = await api.get(
		// Original path: `/notion-databases/${databaseId}/properties?integrationId=${integrationId}`
    // Corrected to match common REST patterns if integrationId is part of the path or to use query params correctly with api.get
    // Assuming the original path was correct and integrationId is needed as a query param for this specific endpoint
    `/notion-databases/${databaseId}/properties?integrationId=${integrationId}`
	);

	if (!response.ok) {
		throw await handleErrorResponse(response, "Failed to fetch Notion database properties");
	}

	const data = await response.json();
	return data as NotionProperty[];
}
