"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form"; // Added useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Trash2 } from "lucide-react"; // Added

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
import { getNotionDatabases, getNotionDatabaseProperties } from "@/services/notionService"; // Added getNotionDatabaseProperties
import type { Template, UpdateTemplateData } from "@/types/template";
import type { NotionIntegration, NotionDatabase, NotionProperty } from "@/types/notionIntegration"; // Added NotionProperty
import type { Destination } from "@/types/destination";

const formSchema = z.object({
	name: z.string().min(1, { message: "Template name is required." }),
	userNotionIntegrationId: z.string().min(1, { message: "Notion integration is required." }),
	notionDatabaseId: z.string().min(1, { message: "Notion Database ID is required." }),
	conditions: z
		.array(
			z.object({
				// Added
				propertyId: z.string().min(1, "Property selection is required."),
				operator: z.string().min(1, "Operator selection is required."),
				value: z.string().min(1, "Value is required."),
			})
		)
		.optional(),
	body: z.string().min(1, { message: "Message body is required." }),
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
		watch, // Added
		setValue, // Added
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			// Added default values
			name: "",
			userNotionIntegrationId: "",
			notionDatabaseId: "",
			conditions: [], // Added
			body: "",
			destinationId: "",
		},
	});

	const { fields, append, remove, replace } = useFieldArray({
		// Added (with replace)
		control,
		name: "conditions",
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

	const selectedNotionIntegrationId = watch("userNotionIntegrationId");
	const selectedNotionDatabaseId = watch("notionDatabaseId"); // Added

	const {
		data: notionDatabases,
		isLoading: isLoadingNotionDatabases,
		error: errorNotionDatabases,
	} = useQuery<NotionDatabase[], Error>({
		queryKey: ["notionDatabases", selectedNotionIntegrationId],
		queryFn: () => {
			if (!selectedNotionIntegrationId) {
				return Promise.resolve([]);
			}
			return getNotionDatabases(selectedNotionIntegrationId);
		},
		enabled: !!selectedNotionIntegrationId,
	});

	const {
		// Added Db Properties Query
		data: databaseProperties,
		isLoading: isLoadingDbProperties,
		error: errorDbProperties,
	} = useQuery<NotionProperty[], Error>({
		queryKey: ["databaseProperties", selectedNotionIntegrationId, selectedNotionDatabaseId],
		queryFn: () =>
			getNotionDatabaseProperties(
				selectedNotionIntegrationId as string,
				selectedNotionDatabaseId as string
			),
		enabled: !!selectedNotionIntegrationId && !!selectedNotionDatabaseId && !isLoadingTemplate, // Ensure template is loaded
	});

	useEffect(() => {
		if (
			template &&
			selectedNotionIntegrationId &&
			selectedNotionIntegrationId !== template.userNotionIntegrationId
		) {
			setValue("notionDatabaseId", "", { shouldValidate: true });
			setValue("conditions", [], { shouldValidate: false }); // Added: Clear conditions
		}
	}, [selectedNotionIntegrationId, setValue, template]);

	useEffect(() => {
		// Added: Clear conditions if database changes from original template
		if (
			template &&
			selectedNotionDatabaseId &&
			selectedNotionDatabaseId !== template.notionDatabaseId
		) {
			setValue("conditions", [], { shouldValidate: false });
		}
	}, [selectedNotionDatabaseId, setValue, template]);

	useEffect(() => {
		if (template) {
			reset({
				name: template.name,
				userNotionIntegrationId: template.userNotionIntegrationId,
				notionDatabaseId: template.notionDatabaseId,
				conditions: template.conditions || [], // Updated: handle conditions
				body: template.body,
				destinationId: template.destinationId,
			});
			// `replace` from useFieldArray can also be used here if `reset` doesn't work as expected for field arrays
			// For instance: replace(template.conditions || []);
		}
	}, [template, reset, replace]); // `replace` added to dependency array if used

	const mutation = useMutation({
		mutationFn: (formData: FormData) => {
			const templateUpdateData: UpdateTemplateData = {
				...formData,
				conditions: formData.conditions || [], // Updated
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
							<Label htmlFor="userNotionIntegrationId">Use Notion Integration</Label>
							<Controller
								name="userNotionIntegrationId"
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
							{errors.userNotionIntegrationId && (
								<p className="text-red-600 text-sm">
									{errors.userNotionIntegrationId.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="notionDatabaseId">Target Notion Database</Label>
							<Controller
								name="notionDatabaseId"
								control={control}
								render={({ field }) => (
									<Select
										onValueChange={(value) => {
											field.onChange(value);
										}}
										value={field.value} // Ensures the value is controlled by RHF
										disabled={
											!selectedNotionIntegrationId ||
											isLoadingNotionDatabases ||
											mutation.isPending ||
											isLoadingTemplate // Disable if template still loading integration ID
										}
									>
										<SelectTrigger>
											<SelectValue
												placeholder={
													!selectedNotionIntegrationId
														? "Select a Notion Integration first"
														: "Select a Notion Database"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{isLoadingNotionDatabases ? (
												<SelectItem value="loading_db" disabled>
													Loading databases...
												</SelectItem>
											) : errorNotionDatabases ? (
												<SelectItem value="error_db" disabled>
													Error fetching databases
												</SelectItem>
											) : !isLoadingNotionDatabases &&
											  notionDatabases &&
											  notionDatabases.length === 0 &&
											  selectedNotionIntegrationId ? (
												<SelectItem value="no_db" disabled>
													No databases found for this integration.
												</SelectItem>
											) : (
												notionDatabases?.map((database) => (
													<SelectItem
														key={database.id}
														value={database.id}
													>
														{database.name}
													</SelectItem>
												))
											)}
											{!selectedNotionIntegrationId &&
												!isLoadingNotionDatabases && (
													<SelectItem
														value="select_integration_first"
														disabled
													>
														Select a Notion Integration first
													</SelectItem>
												)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.notionDatabaseId && (
								<p className="text-red-600 text-sm">
									{errors.notionDatabaseId.message}
								</p>
							)}
							{!errorNotionDatabases && (
								<p className="text-muted-foreground text-xs">
									Select the Notion database you want to monitor for changes.
								</p>
							)}
							{errorNotionDatabases && (
								<p className="text-red-600 text-xs">
									Failed to load databases: {errorNotionDatabases.message}
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>2. Notification Conditions</CardTitle>
						<CardDescription>
							Define conditions based on Notion database properties to trigger
							notifications.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoadingDbProperties && <p>Loading properties...</p>}
						{errorDbProperties && (
							<p className="text-red-500">
								Error loading database properties: {errorDbProperties.message}
							</p>
						)}
						{!isLoadingDbProperties &&
							!errorDbProperties &&
							selectedNotionDatabaseId &&
							(!databaseProperties || databaseProperties.length === 0) && (
								<p>
									No properties found for this database or integration not fully
									loaded.
								</p>
							)}

						{fields.map((field, index) => (
							<div
								key={field.id}
								className="flex items-start space-x-2 p-2 border rounded-md"
							>
								<div className="flex-1 space-y-2">
									<div className="gap-2 grid grid-cols-1 md:grid-cols-3">
										{/* Property Select */}
										<div className="space-y-1">
											<Label htmlFor={`conditions.${index}.propertyId`}>
												Property
											</Label>
											<Controller
												name={`conditions.${index}.propertyId`}
												control={control}
												render={({ field: controllerField }) => (
													<Select
														onValueChange={controllerField.onChange}
														value={controllerField.value}
														disabled={
															!databaseProperties ||
															isLoadingDbProperties ||
															mutation.isPending ||
															isLoadingTemplate
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select property" />
														</SelectTrigger>
														<SelectContent>
															{databaseProperties?.map((prop) => (
																<SelectItem
																	key={prop.id}
																	value={prop.id}
																>
																	{prop.name} ({prop.type})
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											/>
											{errors.conditions?.[index]?.propertyId && (
												<p className="text-red-600 text-xs">
													{
														errors.conditions?.[index]?.propertyId
															?.message
													}
												</p>
											)}
										</div>

										{/* Operator Select */}
										<div className="space-y-1">
											<Label htmlFor={`conditions.${index}.operator`}>
												Operator
											</Label>
											<Controller
												name={`conditions.${index}.operator`}
												control={control}
												render={({ field: controllerField }) => (
													<Select
														onValueChange={controllerField.onChange}
														value={controllerField.value}
														disabled={
															mutation.isPending || isLoadingTemplate
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select operator" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="equals">
																Equals
															</SelectItem>
															<SelectItem value="not_equals">
																Not Equals
															</SelectItem>
															<SelectItem value="contains">
																Contains
															</SelectItem>
															<SelectItem value="not_contains">
																Does Not Contain
															</SelectItem>
															{/* Add more operators as needed */}
														</SelectContent>
													</Select>
												)}
											/>
											{errors.conditions?.[index]?.operator && (
												<p className="text-red-600 text-xs">
													{errors.conditions?.[index]?.operator?.message}
												</p>
											)}
										</div>

										{/* Value Input */}
										<div className="space-y-1">
											<Label htmlFor={`conditions.${index}.value`}>
												Value
											</Label>
											<Controller
												name={`conditions.${index}.value`}
												control={control}
												render={({ field: controllerField }) => (
													<Input
														{...controllerField}
														placeholder="Enter value"
														disabled={
															mutation.isPending || isLoadingTemplate
														}
													/>
												)}
											/>
											{errors.conditions?.[index]?.value && (
												<p className="text-red-600 text-xs">
													{errors.conditions?.[index]?.value?.message}
												</p>
											)}
										</div>
									</div>
								</div>
								{/* Remove Button */}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => remove(index)}
									disabled={mutation.isPending || isLoadingTemplate}
									className="mt-6" // Adjust margin to align with form fields
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						))}
						<Button
							type="button"
							onClick={() => append({ propertyId: "", operator: "", value: "" })}
							disabled={
								!selectedNotionDatabaseId ||
								isLoadingDbProperties ||
								!!errorDbProperties ||
								!databaseProperties ||
								databaseProperties.length === 0 ||
								mutation.isPending ||
								isLoadingTemplate
							}
						>
							Add Condition
						</Button>
						{errors.conditions?.root && (
							<p className="text-red-600 text-sm">{errors.conditions.root.message}</p>
						)}
						{Array.isArray(errors.conditions) &&
							errors.conditions.length === 0 &&
							errors.conditions?.message && (
								<p className="text-red-600 text-sm">{errors.conditions.message}</p>
							)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>3. Notification Message</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<Label htmlFor="body">Message Body</Label>
						<Textarea id="body" rows={5} {...register("body")} />
						{errors.body && (
							<p className="text-red-600 text-sm">{errors.body.message}</p>
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
