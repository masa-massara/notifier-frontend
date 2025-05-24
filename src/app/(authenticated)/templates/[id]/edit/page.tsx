"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";

// AppLayout is now applied by the group's layout.tsx
import PageHeader from "@/components/layout/PageHeader";
// import withAuth from "@/components/auth/withAuth"; // HOC Removed
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getTemplate, updateTemplate } from "@/services/templateService";
import { getUserNotionIntegrations } from "@/services/userNotionIntegrationService";
import { getDestinations } from "@/services/destinationService";
import type { Template, UpdateTemplateData } from "@/types/template";
import type { NotionIntegration } from "@/types/notionIntegration";
import type { Destination } from "@/types/destination";

const formSchema = z.object({
	name: z.string().min(1, { message: "Template name is required." }),
	notionIntegrationId: z.string().min(1, { message: "Notion integration is required." }),
	notionDatabaseId: z.string().min(1, { message: "Notion Database ID is required." }),
	messageBody: z.string().min(1, { message: "Message body is required." }),
	destinationId: z.string().min(1, { message: "Destination is required." }),
});

type FormData = z.infer<typeof formSchema>;

function EditTemplatePage() {
	const router = useRouter();
	const params = useParams();
	const id = params.id as string;
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const {
		control,
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			// Added default values
			name: "",
			notionIntegrationId: "",
			notionDatabaseId: "",
			messageBody: "",
			destinationId: "",
		},
	});

	const {
		data: template,
		isLoading: isLoadingTemplate,
		error: errorTemplate,
	} = useQuery<Template, Error>({
		queryKey: ["template", id],
		queryFn: () => getTemplate(id),
		enabled: !!id,
	});

	const { data: notionIntegrations, isLoading: isLoadingNotion } = useQuery<
		NotionIntegration[],
		Error
	>({
		queryKey: ["notionIntegrations"],
		queryFn: getUserNotionIntegrations,
	});

	const { data: destinations, isLoading: isLoadingDestinations } = useQuery<Destination[], Error>(
		{
			queryKey: ["destinations"],
			queryFn: getDestinations,
		}
	);

	useEffect(() => {
		if (template) {
			reset({
				name: template.name,
				notionIntegrationId: template.notionIntegrationId,
				notionDatabaseId: template.notionDatabaseId,
				messageBody: template.messageBody,
				destinationId: template.destinationId,
			});
		}
	}, [template, reset]);

	const mutation = useMutation({
		mutationFn: (formData: FormData) => {
			const templateUpdateData: UpdateTemplateData = {
				...formData,
				conditions: template?.conditions || {},
			};
			return updateTemplate(id, templateUpdateData);
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Notification template updated successfully.",
			});
			queryClient.invalidateQueries({ queryKey: ["templates"] });
			queryClient.invalidateQueries({ queryKey: ["template", id] });
			router.push("/templates");
		},
		onError: (error: Error) => {
			toast({
				title: "Error",
				description: error.message || "Failed to update template.",
				variant: "destructive",
			});
		},
	});

	const onSubmit = async (data: FormData) => {
		mutation.mutate(data);
	};

	if (isLoadingTemplate || isLoadingNotion || isLoadingDestinations) {
		return (
			<>
				<PageHeader title="Edit Notification Template" />
				<div className="flex justify-center items-center">
					<p>Loading template data...</p>
				</div>
			</>
		);
	}

	if (errorTemplate) {
		return (
			<>
				<PageHeader title="Edit Notification Template" />
				<div className="text-red-500">Error fetching template: {errorTemplate.message}</div>
			</>
		);
	}

	if (!template) {
		return (
			<>
				<PageHeader title="Edit Notification Template" />
				<div className="text-center">
					<p>Template not found.</p>
					<Link href="/templates">
						<Button variant="link">Back to Templates</Button>
					</Link>
				</div>
			</>
		);
	}

	return (
		<>
			<PageHeader title={`Edit Template: ${template?.name || ""}`} />
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				<Card>
					<CardHeader>
						<CardTitle>1. Basic Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Template Name</Label>
							<Input id="name" {...register("name")} />
							{errors.name && (
								<p className="text-red-600 text-sm">{errors.name.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="notionIntegrationId">Use Notion Integration</Label>
							<Controller
								name="notionIntegrationId"
								control={control}
								render={({ field }) => (
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={isLoadingNotion || mutation.isPending}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select a Notion Integration" />
										</SelectTrigger>
										<SelectContent>
											{isLoadingNotion ? (
												<SelectItem value="loading" disabled>
													Loading...
												</SelectItem>
											) : (
												notionIntegrations?.map((integration) => (
													<SelectItem
														key={integration.id}
														value={integration.id}
													>
														{integration.integrationName}
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.notionIntegrationId && (
								<p className="text-red-600 text-sm">
									{errors.notionIntegrationId.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="notionDatabaseId">Target Notion Database ID</Label>
							<Input id="notionDatabaseId" {...register("notionDatabaseId")} />
							{errors.notionDatabaseId && (
								<p className="text-red-600 text-sm">
									{errors.notionDatabaseId.message}
								</p>
							)}
							<p className="text-muted-foreground text-xs">
								This is the ID of the database you want to monitor for changes.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>2. Notification Conditions</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							value="Notification conditions configuration will be available here in a future update. For now, notifications will be sent for all new entries in the database."
							disabled
							rows={3}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>3. Notification Message</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Label htmlFor="messageBody">Message Body</Label>
						<Textarea id="messageBody" rows={5} {...register("messageBody")} />
						{errors.messageBody && (
							<p className="text-red-600 text-sm">{errors.messageBody.message}</p>
						)}
						<p className="text-muted-foreground text-xs">
							Placeholders like {"{PropertyName}"} (e.g. {"{Task Name}"}) and{" "}
							{"{_pageUrl}"} can be used. Dynamic placeholder suggestions will be
							added later based on the selected database.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>4. Send To</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Label htmlFor="destinationId">Notification Channel</Label>
						<Controller
							name="destinationId"
							control={control}
							render={({ field }) => (
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={isLoadingDestinations || mutation.isPending}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a Destination Channel" />
									</SelectTrigger>
									<SelectContent>
										{isLoadingDestinations ? (
											<SelectItem value="loading" disabled>
												Loading...
											</SelectItem>
										) : (
											destinations?.map((destination) => (
												<SelectItem
													key={destination.id}
													value={destination.id}
												>
													{destination.name ||
														// biome-ignore lint/style/useTemplate: <explanation>
														destination.webhookUrl.substring(0, 30) +
															"..."}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							)}
						/>
						{errors.destinationId && (
							<p className="text-red-600 text-sm">{errors.destinationId.message}</p>
						)}
					</CardContent>
				</Card>

				<div className="flex justify-end space-x-2 pt-4">
					<Link href="/templates" passHref>
						<Button
							type="button"
							variant="outline"
							disabled={isSubmitting || mutation.isPending}
						>
							Cancel
						</Button>
					</Link>
					<Button type="submit" disabled={isSubmitting || mutation.isPending}>
						{isSubmitting || mutation.isPending ? "Updating..." : "Update Template"}
					</Button>
				</div>
			</form>
		</>
	);
}

export default EditTemplatePage; // HOC Removed
