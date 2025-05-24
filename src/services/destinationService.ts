import { fetchApiClient } from "@/lib/apiClient";
import type { Destination } from "@/types/destination";

/**
 * Fetches all destinations for the current user.
 */
export const getDestinations = async (): Promise<Destination[]> => {
	const response = await fetchApiClient("/destinations", {
		// Assuming API base path is already in fetchApiClient
		method: "GET",
	});
	if (!response.ok) {
		throw new Error("Failed to fetch destinations");
	}
	return response.json();
};

/**
 * Fetches a single destination by its ID.
 * @param id - The ID of the destination to fetch.
 */
export const getDestination = async (id: string): Promise<Destination> => {
	const response = await fetchApiClient(`/destinations/${id}`, {
		method: "GET",
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch destination with ID ${id}`);
	}
	return response.json();
};

/**
 * Creates a new destination for the current user.
 * @param data - Object containing the name (optional) and webhookUrl for the new destination.
 */
export const createDestination = async (data: {
	name?: string;
	webhookUrl: string;
}): Promise<Destination> => {
	const response = await fetchApiClient("/destinations", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		throw new Error("Failed to create destination");
	}
	return response.json();
};

/**
 * Updates an existing destination.
 * @param id - The ID of the destination to update.
 * @param data - Object containing the name (optional) and webhookUrl to update.
 */
export const updateDestination = async (
	id: string,
	data: { name?: string; webhookUrl: string },
): Promise<Destination> => {
	const response = await fetchApiClient(`/destinations/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		throw new Error(`Failed to update destination with ID ${id}`);
	}
	return response.json();
};

/**
 * Deletes a specific destination for the current user.
 * @param id - The ID of the destination to delete.
 */
export const deleteDestination = async (id: string): Promise<void> => {
	const response = await fetchApiClient(`/destinations/${id}`, {
		method: "DELETE",
	});
	if (!response.ok) {
		throw new Error(`Failed to delete destination with ID ${id}`);
	}
	// No content expected for a successful DELETE
};
