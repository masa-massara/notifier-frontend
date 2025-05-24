import { fetchApiClient } from "@/lib/apiClient";
import { NotionIntegration } from "@/types/notionIntegration";

/**
 * Fetches all Notion integrations for the current user.
 */
export const getUserNotionIntegrations = async (): Promise<NotionIntegration[]> => {
  const response = await fetchApiClient("/me/notion-integrations", {
    method: "GET",
  });
  // fetchApiClient handles non-ok responses by throwing an error
  return response.json();
};

/**
 * Creates a new Notion integration for the current user.
 * @param data - Object containing the name and token for the new integration.
 */
export const createUserNotionIntegration = async (data: {
  integrationName: string; // Changed from 'name' to 'integrationName'
  notionIntegrationToken: string; // Changed from 'token' to 'notionIntegrationToken'
}): Promise<NotionIntegration> => {
  const response = await fetchApiClient("/me/notion-integrations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // fetchApiClient handles non-ok responses by throwing an error
  return response.json();
};

/**
 * Deletes a specific Notion integration for the current user.
 * @param integrationId - The ID of the Notion integration to delete.
 */
export const deleteUserNotionIntegration = async (
  integrationId: string
): Promise<void> => {
  await fetchApiClient(
    `/me/notion-integrations/${integrationId}`,
    {
      method: "DELETE",
    }
  );
  // fetchApiClient handles non-ok responses by throwing an error
  // For DELETE requests, typically no body is returned on success (e.g. 204 No Content)
  // so we don't call response.json()
};
