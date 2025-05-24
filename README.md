# Notifier App Frontend

This is the frontend for the Notifier App, a Next.js application designed to allow users to configure and manage notifications based on changes in their Notion databases.

## Overview

The Notifier App frontend enables users to:

*   Sign up and log in using Firebase Authentication.
*   Manage their account settings, including password changes.
*   Register and manage Notion Integrations by providing their Notion API tokens.
*   Register and manage Destination Webhooks where notifications will be sent.
*   Create and manage Notification Templates, which link a Notion Integration, a specific Notion Database, and a Destination to define notification rules and message formats.

## Prerequisites

Before running this application, ensure you have the following set up:

*   **Node.js and Bun:** Download and install Node.js (which includes npm) and Bun. Bun is the recommended package manager for this project.
*   **Firebase Project:**
    *   You need an active Firebase project.
    *   The Firebase configuration in `src/lib/firebase.ts` **must be updated** with your actual Firebase project credentials. The current values are placeholders.
*   **Backend API Running:**
    *   This frontend application requires a corresponding backend API to be running and accessible.
    *   The base URL for this API is configured in `src/lib/apiClient.ts` (currently set to `/api/v1`). Ensure this points to your live backend. If the backend is on a different domain or port, you'll need to configure this to be an absolute URL (e.g., `https://your-backend-api.com/api/v1`).

## Environment Variables

Currently, critical configurations (like Firebase API keys) are managed directly in `src/lib/firebase.ts` as placeholders. **It is crucial to update these placeholders with your actual Firebase project configuration.**

For a production setup, it's highly recommended to move these configurations to environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, etc.) and update `src/lib/firebase.ts` to read from `process.env`. However, for this version, direct modification of the file is required.

No other specific `.env` variables are pre-configured for application behavior at this stage, but this could be added as the project evolves.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Using Bun (recommended):
    ```bash
    bun install
    ```
    Alternatively, using npm or yarn:
    ```bash
    # npm install
    # or
    # yarn install
    ```

3.  **Configure Firebase:**
    Open `src/lib/firebase.ts` and replace the placeholder Firebase configuration with your actual project credentials.

4.  **Configure Backend API URL:**
    Open `src/lib/apiClient.ts` and ensure the `BASE_URL` constant points to your running backend API. For local development, if the backend runs on a different port, this might be e.g. `http://localhost:8000/api/v1`.

## Running the Development Server

To start the development server:

```bash
bun dev
```
Or, if you are not using Bun:
```bash
npm run dev
# or
yarn dev
```

The application will typically be available at [http://localhost:3000](http://localhost:3000).

## Building for Production (Optional)

To create a production build:

```bash
bun run build
```

And to start the production server:

```bash
bun start
```

---

## Development Notes & Important Considerations

### 1. Firebase Configuration

The file `src/lib/firebase.ts` contains **placeholder values** for the Firebase project configuration. You **must** replace these with the actual configuration details from your Firebase project for authentication and other Firebase services to work.

```typescript
// Example snippet from src/lib/firebase.ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual API key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your actual auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your actual project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your actual storage bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your actual messaging sender ID
  appId: "YOUR_APP_ID", // Replace with your actual app ID
};
```

### 2. Backend API Dependency

This frontend application is designed to work with a separate backend API. The base URL for this API is defined in `src/lib/apiClient.ts` as `const BASE_URL = "/api/v1";`.

*   If your backend is hosted on a different domain or port during development (e.g., `http://localhost:8080`), you must update `BASE_URL` to the absolute path of your backend API (e.g., `http://localhost:8080/api/v1`).
*   For production, this URL should point to your deployed backend API endpoint.
*   All API calls made by the frontend (e.g., for managing Notion integrations, destinations, templates) are directed to this base URL. If the backend is not running or accessible at this URL, these features will not work.

### 3. Notification Template - API Dependent Features

The Notification Template creation and editing screens (`src/app/templates/new` and `src/app/templates/[id]/edit`) have certain features that are dependent on specific backend API capabilities which might not be fully implemented yet or require further backend development:

*   **Dynamic Notion Database Selection:** Currently, the user manually inputs the "Target Notion Database ID". A future enhancement would involve fetching a list of available databases from the backend based on the selected Notion Integration.
*   **Dynamic Condition Building:** The "Notification Conditions" section is currently a placeholder. A full implementation would require backend support to define, store, and process these conditions, likely involving a dynamic UI to build these conditions based on the schema of the selected Notion Database.
*   **Dynamic Placeholder Suggestions:** The message body for notifications mentions support for placeholders (e.g., `{PropertyName}`). While users can manually type these, a more advanced feature would be for the frontend to suggest available placeholders based on the schema of the selected Notion Database, which would require an API endpoint to fetch this schema.

The current implementation provides the basic structure for these features, with manual inputs and UI placeholders where backend dependencies are significant.

### 4. API Base URL

As mentioned, the current API base URL in `src/lib/apiClient.ts` is `/api/v1`. This implies the backend API is either served from the same domain/port or a proxy is set up. Verify this and update it to the correct absolute URL of your backend if it's hosted elsewhere (e.g., `https://api.example.com/api/v1`).

---

## Default Next.js Information

### Learn More (Next.js)

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
