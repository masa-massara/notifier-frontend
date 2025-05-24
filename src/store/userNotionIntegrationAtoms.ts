import { atomsWithQuery, atomsWithMutation } from "jotai-tanstack-query";
import { currentUserAtom } from "@/store/globalAtoms";
import {
  getUserNotionIntegrations,
  createUserNotionIntegration,
  deleteUserNotionIntegration,
} from "@/services/userNotionIntegrationService";
import { NotionIntegration } from "@/types/notionIntegration";
// customQueryClientAtom from globalAtoms is not directly used here as
// getQueryClient is provided by the mutation callbacks.

// Atom for fetching user's Notion integrations
// atomsWithQuery returns a tuple: [dataAtom, statusAtom]
// We can name them according to convention, e.g., integrationsAtom, integrationsStatusAtom
export const [userNotionIntegrationsAtom, userNotionIntegrationsQueryAtom] =
  atomsWithQuery<NotionIntegration[], Error>((get) => ({
    queryKey: ["userNotionIntegrations", get(currentUserAtom)?.uid],
    queryFn: async () => {
      const currentUser = get(currentUserAtom);
      // The 'enabled' option should prevent this query from running if user is not authenticated.
      // However, if it somehow runs, this check provides a safeguard.
      if (!currentUser?.uid) {
        // console.warn("getUserNotionIntegrations queryFn called without authenticated user.");
        // Depending on desired behavior, either return empty array or throw.
        // Throwing an error will put the query in an 'error' state.
        throw new Error(
          "User not authenticated. Cannot fetch Notion integrations."
        );
      }
      return getUserNotionIntegrations();
    },
    enabled: !!get(currentUserAtom)?.uid, // Fetch only if UID exists
  }));

// Atom for creating a new Notion integration
// atomsWithMutation returns a single atom: the mutation atom itself.
export const [createUserNotionIntegrationMutationAtom] = atomsWithMutation<
  NotionIntegration, // TData: Type of data returned by the mutationFn
  { integrationName: string; notionIntegrationToken: string }, // TVariables: Type of variables passed to the mutationFn
  Error, // TError: Type of error the mutationFn might throw
  unknown, // TContext: Type of context used in onMutate, onError, onSettled
  (get: any) => any // TGet (setup function's get): using 'any' based on jotai-tanstack-query examples for simplicity
>((get) => ({ // 'get' here is the Jotai getter from the setup function of atomsWithMutation
  mutationFn: async (
    variables: { integrationName: string; notionIntegrationToken: string }
  ) => {
    // This function receives the variables when `mutate` is called on the atom's value
    return createUserNotionIntegration(variables);
  },
  onSuccess: (_data, _variables, _context, { getQueryClient }) => {
    // 'get' from the outer scope (atomsWithMutation's setup function) is available here
    const queryClient = getQueryClient(); // Access QueryClient via the callback context
    const currentUser = get(currentUserAtom); // Access other atoms using the 'get' from the setup function
    if (currentUser?.uid) {
      queryClient.invalidateQueries({
        queryKey: ["userNotionIntegrations", currentUser.uid],
      });
    }
  },
  // onError: (error, variables, context, { getQueryClient, get }) => { /* ... */ },
  // onSettled: (data, error, variables, context, { getQueryClient, get }) => { /* ... */ },
}));

// Atom for deleting a Notion integration
export const [deleteUserNotionIntegrationMutationAtom] = atomsWithMutation<
  void, // TData: deleteUserNotionIntegration returns void
  string, // TVariables: integrationId is a string
  Error,
  unknown,
  (get: any) => any
>((get) => ({
  mutationFn: async (integrationId: string) => {
    return deleteUserNotionIntegration(integrationId);
  },
  onSuccess: (_data, _variables, _context, { getQueryClient }) => {
    const queryClient = getQueryClient();
    const currentUser = get(currentUserAtom);
    if (currentUser?.uid) {
      queryClient.invalidateQueries({
        queryKey: ["userNotionIntegrations", currentUser.uid],
      });
    }
  },
}));
