import { store } from "@/store/store"; // Assuming you have a Jotai store instance exported from here
import { idTokenAtom } from "@/store/globalAtoms";

const BASE_URL = "/api/v1"; // Placeholder base URL

interface FetchOptions extends RequestInit {
  // You can add custom options here if needed
}

export const fetchApiClient = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const idToken = store.get(idTokenAtom); // Retrieve ID token from Jotai store

  const headers = new Headers(options.headers);

  if (idToken) {
    headers.append("Authorization", `Bearer ${idToken}`);
  }

  const fullUrl = `${BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle HTTP errors (e.g., 4xx, 5xx)
      const errorData = await response.json().catch(() => ({})); // Try to parse error response
      console.error("API Error:", response.status, errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch API Client Error:", error);
    throw error; // Re-throw the error to be caught by TanStack Query
  }
};

// Example usage (optional, for testing purposes):
// fetchApiClient("/users", { method: "GET" })
//   .then(response => response.json())
//   .then(data => console.log("Fetched data:", data))
//   .catch(error => console.error("Error fetching data:", error));
