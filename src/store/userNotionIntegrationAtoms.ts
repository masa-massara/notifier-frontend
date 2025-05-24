import { atom, type Getter } from "jotai"; // Getter をインポート
import {
	atomWithQuery,
	atomWithMutation,
	queryClientAtom, // onSuccess の中で queryClient を取得するために使う
} from "jotai-tanstack-query";
import { currentUserAtom } from "@/store/globalAtoms";
import {
	getUserNotionIntegrations,
	createUserNotionIntegration,
	deleteUserNotionIntegration,
} from "@/services/userNotionIntegrationService";
import type { NotionIntegration } from "@/types/notionIntegration";
import type { QueryClient } from "@tanstack/react-query";

export const userNotionIntegrationsQueryAtom = atomWithQuery<
	NotionIntegration[],
	Error
>((get) => ({
	queryKey: ["userNotionIntegrations", get(currentUserAtom)?.uid],
	queryFn: async () => {
		const currentUser = get(currentUserAtom);
		if (!currentUser?.uid) {
			throw new Error(
				"User not authenticated. Cannot fetch Notion integrations.",
			);
		}
		return getUserNotionIntegrations();
	},
	enabled: !!get(currentUserAtom)?.uid,
}));

export const userNotionIntegrationsAtom = atom((get) => {
	const queryResult = get(userNotionIntegrationsQueryAtom);
	return queryResult?.data;
});

export const createUserNotionIntegrationMutationAtom = atomWithMutation<
	NotionIntegration, // TData
	{ integrationName: string; notionIntegrationToken: string }, // TVariables
	Error, // TError
	unknown // TContext
>(
	// ↓ この get は atomWithMutation のセットアップ関数に渡される Jotai の Getter
	(getAtomInSetup) => ({
		mutationFn: async (variables: {
			integrationName: string;
			notionIntegrationToken: string;
		}) => {
			return createUserNotionIntegration({
				integrationName: variables.integrationName,
				notionIntegrationToken: variables.notionIntegrationToken,
			});
		},
		// ★★★ onSuccess のシグネチャをTypeScriptのエラーに合わせて3引数にする ★★★
		onSuccess: (
			_data: NotionIntegration,
			_variables: { integrationName: string; notionIntegrationToken: string },
			_context: unknown,
			// 4番目の引数は定義しない
		) => {
			// ★★★ queryClient と currentUser はセットアップ関数の getAtomInSetup を使って取得 ★★★
			const queryClient: QueryClient = getAtomInSetup(queryClientAtom);
			const currentUser = getAtomInSetup(currentUserAtom);
			if (currentUser?.uid) {
				queryClient.invalidateQueries({
					queryKey: ["userNotionIntegrations", currentUser.uid],
				});
			}
		},
	}),
);

export const deleteUserNotionIntegrationMutationAtom = atomWithMutation<
	void, // TData
	string, // TVariables
	Error, // TError
	unknown // TContext
>(
	// ↓ この get は atomWithMutation のセットアップ関数に渡される Jotai の Getter
	(getAtomInSetup) => ({
		mutationFn: async (integrationId: string) => {
			return deleteUserNotionIntegration(integrationId);
		},
		// ★★★ onSuccess のシグネチャをTypeScriptのエラーに合わせて3引数にする ★★★
		onSuccess: (
			// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
			_data: void,
			_variables: string,
			_context: unknown,
			// 4番目の引数は定義しない
		) => {
			// ★★★ queryClient と currentUser はセットアップ関数の getAtomInSetup を使って取得 ★★★
			const queryClient: QueryClient = getAtomInSetup(queryClientAtom);
			const currentUser = getAtomInSetup(currentUserAtom);
			if (currentUser?.uid) {
				queryClient.invalidateQueries({
					queryKey: ["userNotionIntegrations", currentUser.uid],
				});
			}
		},
	}),
);
