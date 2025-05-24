export interface Destination {
	id: string;
	name?: string; // Optional as per spec for creation, can be required for display if always set by backend
	webhookUrl: string;
	createdAt: string; // Assuming ISO date string
}
