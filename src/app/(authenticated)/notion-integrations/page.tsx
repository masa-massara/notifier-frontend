"use client"; // Ensure it's a client component

import React from "react";
import Link from "next/link";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import {
	userNotionIntegrationsAtom,
	userNotionIntegrationsQueryAtom,
	deleteUserNotionIntegrationMutationAtom,
} from "@/store/userNotionIntegrationAtoms";
// AppLayout is now applied by the group's layout.tsx
import PageHeader from "@/components/layout/PageHeader";
// import withAuth from "@/components/auth/withAuth"; // HOC Removed
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, PlusCircle } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { NotionIntegration } from "@/types/notionIntegration";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loader for the table
const TableSkeleton = () => (
	<div className="space-y-2">
		<Skeleton className="w-full h-10" /> {/* Header */}
		{[...Array(3)].map((_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
			<Skeleton key={i} className="w-full h-12" /> /* Rows */
		))}
	</div>
);

function NotionIntegrationsPage() {
	const { toast } = useToast();
	const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
	const [selectedIntegration, setSelectedIntegration] = React.useState<NotionIntegration | null>(
		null
	);

	// const integrations = useAtomValue(userNotionIntegrationsAtom); // data is directly from queryStatus
	const [queryStatus, queryDispatch] = useAtom(userNotionIntegrationsQueryAtom);
	const [deleteMutationStatus, deleteIntegration] = useAtom(
		deleteUserNotionIntegrationMutationAtom
	);

	const { data, isLoading, isError, error, refetch } = queryStatus;

	console.log(data);

	React.useEffect(() => {
		if (deleteMutationStatus.isSuccess) {
			toast({
				title: "成功",
				description: "Notion連携を削除しました。",
			});
			setShowDeleteDialog(false);
			setSelectedIntegration(null);
			// Query invalidation is handled by the atom's onSuccess
		} else if (deleteMutationStatus.isError && deleteMutationStatus.error) {
			toast({
				title: "エラー",
				description:
					(deleteMutationStatus.error as Error).message ||
					"Notion連携の削除に失敗しました。",
				variant: "destructive",
			});
			setShowDeleteDialog(false);
			setSelectedIntegration(null);
		}
	}, [
		deleteMutationStatus.isSuccess,
		deleteMutationStatus.isError,
		deleteMutationStatus.error,
		toast,
	]);

	const handleDeleteClick = (integration: NotionIntegration) => {
		setSelectedIntegration(integration);
		setShowDeleteDialog(true);
	};

	const confirmDelete = () => {
		if (selectedIntegration) {
			deleteIntegration({
				variables: selectedIntegration.id,
			});
		}
	};

	const handleRetry = () => {
		if (typeof refetch === "function") {
			refetch();
		} else {
			queryDispatch({ type: "refetch" }); // Attempt to refetch via queryDispatch
		}
	};

	if (isLoading) {
		return (
			<>
				<PageHeader
					title="Notion連携管理"
					actions={
						<Link href="/notion-integrations/new">
							<Button>
								<PlusCircle className="mr-2 w-4 h-4" />
								新しいNotion連携を登録
							</Button>
						</Link>
					}
				/>
				<TableSkeleton />
			</>
		);
	}

	if (isError) {
		return (
			<>
				<PageHeader
					title="Notion連携管理"
					actions={
						<Link href="/notion-integrations/new">
							<Button>
								<PlusCircle className="mr-2 w-4 h-4" />
								新しいNotion連携を登録
							</Button>
						</Link>
					}
				/>
				<div className="py-10 text-center">
					<p className="mb-4 text-red-500">
						エラーが発生しました: {error?.message || "不明なエラー"}
					</p>
					<Button onClick={handleRetry}>
						<RefreshCw className="mr-2 w-4 h-4" />
						再試行
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			<PageHeader
				title="Notion連携管理"
				actions={
					<Link href="/notion-integrations/new">
						<Button>
							<PlusCircle className="mr-2 w-4 h-4" />
							新しいNotion連携を登録
						</Button>
					</Link>
				}
			/>
			{data && data.length > 0 ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>連携名</TableHead>
							<TableHead>登録日時</TableHead>
							<TableHead className="text-right">アクション</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((integration) => (
							<TableRow key={integration.id}>
								<TableCell>{integration.integrationName}</TableCell>
								<TableCell>
									{new Date(integration.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="destructive"
										size="sm"
										onClick={() => handleDeleteClick(integration)}
										disabled={
											deleteMutationStatus.isPending &&
											selectedIntegration?.id === integration.id
										}
									>
										<Trash2 className="mr-1 w-4 h-4" />
										{deleteMutationStatus.isPending &&
										selectedIntegration?.id === integration.id
											? "削除中..."
											: "削除"}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			) : (
				<div className="py-10 text-center">
					{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="mx-auto w-12 h-12 text-gray-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth="1"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						/>
					</svg>
					<h3 className="mt-2 font-medium text-gray-900 text-sm">
						まだNotion連携が登録されていません。
					</h3>
					<p className="mt-1 text-gray-500 text-sm">
						「新しいNotion連携を登録」ボタンから最初の連携を登録しましょう。
					</p>
					<div className="mt-6">
						<Link href="/notion-integrations/new">
							<Button>
								<PlusCircle className="mr-2 w-4 h-4" />
								新しいNotion連携を登録
							</Button>
						</Link>
					</div>
				</div>
			)}

			{selectedIntegration && (
				<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Notion連携の削除</AlertDialogTitle>
							<AlertDialogDescription>
								本当にこのNotion連携を削除しますか？この連携を使用しているテンプレートも機能しなくなります。
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setSelectedIntegration(null)}>
								キャンセル
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmDelete}
								disabled={deleteMutationStatus.isPending}
								className="bg-red-600 hover:bg-red-700"
							>
								{deleteMutationStatus.isPending ? "削除中..." : "削除する"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}

export default NotionIntegrationsPage; // HOC Removed
