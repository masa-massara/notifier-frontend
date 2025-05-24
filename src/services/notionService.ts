import { fetchApiClient } from "../lib/apiClient";
import { NotionDatabase, NotionProperty } from "../types/notionIntegration"; // Added NotionProperty

export async function getNotionDatabases(integrationId: string): Promise<NotionDatabase[]> {
  const response = await fetchApiClient(`/me/notion-integrations/${integrationId}/databases`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Notion databases");
  }

  const data = await response.json();
  return data as NotionDatabase[];
}

export async function getNotionDatabaseProperties(
	integrationId: string,
	databaseId: string
): Promise<NotionProperty[]> {
	const response = await fetchApiClient(
		`/notion-databases/${databaseId}/properties?integrationId=${integrationId}`,
		{
			method: "GET",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch Notion database properties");
	}

	const data = await response.json();
	return data as NotionProperty[];
}
