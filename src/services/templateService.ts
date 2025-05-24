import { fetchApiClient } from "@/lib/apiClient";
import { Template, CreateTemplateData, UpdateTemplateData } from "@/types/template";

/**
 * Fetches all templates for the current user.
 */
export const getTemplates = async (): Promise<Template[]> => {
  const response = await fetchApiClient("/templates", {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch templates");
  }
  return response.json();
};

/**
 * Fetches a single template by its ID.
 * @param id - The ID of the template to fetch.
 */
export const getTemplate = async (id: string): Promise<Template> => {
  const response = await fetchApiClient(`/templates/${id}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch template with ID ${id}`);
  }
  return response.json();
};

/**
 * Creates a new template for the current user.
 * @param data - Object containing the data for the new template.
 */
export const createTemplate = async (
  data: CreateTemplateData
): Promise<Template> => {
  const response = await fetchApiClient("/templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    // Attempt to parse error response from backend if available
    const errorBody = await response.json().catch(() => ({ message: "Failed to create template" }));
    throw new Error(errorBody.message || "Failed to create template");
  }
  return response.json();
};

/**
 * Updates an existing template.
 * @param id - The ID of the template to update.
 * @param data - Object containing the data to update.
 */
export const updateTemplate = async (
  id: string,
  data: UpdateTemplateData
): Promise<Template> => {
  const response = await fetchApiClient(`/templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: `Failed to update template with ID ${id}` }));
    throw new Error(errorBody.message || `Failed to update template with ID ${id}`);
  }
  return response.json();
};

/**
 * Deletes a specific template for the current user.
 * @param id - The ID of the template to delete.
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  const response = await fetchApiClient(`/templates/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: `Failed to delete template with ID ${id}` }));
    throw new Error(errorBody.message || `Failed to delete template with ID ${id}`);
  }
  // No content expected for a successful DELETE
};
