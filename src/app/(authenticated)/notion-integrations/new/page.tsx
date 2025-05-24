// src/app/(authenticated)/notion-integrations/new/page.tsx (修正案)
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAtom } from "jotai";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createUserNotionIntegrationMutationAtom } from "@/store/userNotionIntegrationAtoms";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
	integrationName: z
		.string()
		.min(1, { message: "連携名は必須です。" })
		.max(50, { message: "連携名は50文字以内で入力してください。" }),
	notionIntegrationToken: z
		.string()
		.min(1, { message: "Notionインテグレーションシークレットは必須です。" })
		.startsWith("ntn_", {
			message: "シークレットは「ntn_」で始まる必要があります。",
		}),
});

type FormData = z.infer<typeof formSchema>;

function NewNotionIntegrationPage() {
	const router = useRouter();
	const { toast } = useToast();

	// ★★★ ここを修正 ★★★
	// useAtom の結果の受け取り方を変える
	const [mutationHookResult] = useAtom(
		// 配列の最初の要素だけを受け取る
		createUserNotionIntegrationMutationAtom
	);

	// mutationHookResult から、状態と実行関数を取り出す
	const createIntegration = mutationHookResult.mutate; // これがミューテーション実行関数
	const mutationStatus = mutationHookResult; // これが状態オブジェクト (isPending, isSuccess などを含む)

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			integrationName: "",
			notionIntegrationToken: "",
		},
	});

	const { handleSubmit, control } = form;
	// mutationStatus から必要な状態を取り出すのは変わらず
	const { isPending, isSuccess, isError, error } = mutationStatus;

	useEffect(() => {
		if (isSuccess) {
			toast({
				title: "成功",
				description: "Notion連携を登録しました。",
			});
			router.push("/notion-integrations");
		}
		if (isError && error) {
			toast({
				title: "エラー",
				description: (error as Error).message || "Notion連携の登録に失敗しました。",
				variant: "destructive",
			});
		}
	}, [isSuccess, isError, error, router, toast]);

	const onSubmit = (data: FormData) => {
		// ★★★ ここを修正 ★★★
		// createIntegration を呼び出す (引数は data そのもの)
		if (createIntegration) {
			// createIntegration が undefined でないことを確認 (型安全のため)
			createIntegration(data);
		} else {
			// もし createIntegration が存在しない場合のフォールバック処理 (通常は起こらないはず)
			console.error("createIntegration関数が利用できません。");
			toast({
				title: "エラー",
				description: "フォームの送信処理を開始できませんでした。",
				variant: "destructive",
			});
		}
	};

	return (
		<>
			<PageHeader title="新しいNotion連携を登録" />
			<div className="flex justify-center">
				<Card className="w-full max-w-lg">
					<CardHeader>
						<CardTitle>連携詳細</CardTitle>
						<CardDescription>
							連携名とNotionインテグレーションシークレットを入力してください。
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
								<FormField
									control={control}
									name="integrationName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>連携名</FormLabel>
											<FormControl>
												<Input
													placeholder="例: マイワークスペース用連携"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="notionIntegrationToken"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												Notionインテグレーションシークレット (APIトークン)
											</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="例: ntn_xxxxxxxx..."
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Notionの「インテグレーション」設定ページで内部インテグレーションを作成し、「内部インテグレーションシークレット」をコピーして貼り付けてください。
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex justify-end space-x-2 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => router.push("/notion-integrations")}
										disabled={isPending}
									>
										キャンセル
									</Button>
									<Button type="submit" disabled={isPending}>
										{isPending ? "登録中..." : "登録する"}
									</Button>
								</div>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

export default NewNotionIntegrationPage;
