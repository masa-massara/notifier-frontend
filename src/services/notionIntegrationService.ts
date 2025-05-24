import { fetchApiClient } from "@/lib/apiClient";
import type { NotionIntegration } from "@/types/notionIntegration";

/**
 * Fetches all Notion integrations for the current user.
 */
export const getNotionIntegrations = async (): Promise<NotionIntegration[]> => {
	const response = await fetchApiClient("/me/notion-integrations", {
		method: "GET",
	});
	if (!response.ok) {
		// The fetchApiClient should ideally throw an error for non-ok responses
		// but if not, we ensure it here.
		throw new Error("Failed to fetch Notion integrations");
	}
	return response.json();
};

/**
 * Creates a new Notion integration for the current user.
 * @param data - Object containing the name and token for the new integration.
 */
export const createNotionIntegration = async (data: {
	name: string;
	token: string;
}): Promise<NotionIntegration> => {
	const response = await fetchApiClient("/me/notion-integrations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		throw new Error("Failed to create Notion integration");
	}
	return response.json();
};

/**
 * Deletes a specific Notion integration for the current user.
 * @param integrationId - The ID of the Notion integration to delete.
 */
export const deleteNotionIntegration = async (
	integrationId: string,
): Promise<void> => {
	const response = await fetchApiClient(
		`/me/notion-integrations/${integrationId}`,
		{
			method: "DELETE",
		},
	);
	if (!response.ok) {
		// fetchApiClient should throw an error on non-ok responses,
		// but we can also check the status code for more specific handling if needed.
		// For example, if response.status === 404, we could throw a custom NotFoundError.
		throw new Error("Failed to delete Notion integration");
	}
	// For DELETE requests, there might not be a JSON body to parse,
	// so we don't call response.json() unless the API guarantees a body.
	// If the API returns a 204 No Content, response.json() would error.
	// If successful and no error is thrown by fetchApiClient, we assume success.
};
