"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createTemplate } from "@/services/templateService";
import { getNotionIntegrations } from "@/services/notionIntegrationService";
import { getDestinations } from "@/services/destinationService";
import { CreateTemplateData } from "@/types/template";
import { NotionIntegration } from "@/types/notionIntegration";
import { Destination } from "@/types/destination";

const formSchema = z.object({
  name: z.string().min(1, { message: "Template name is required." }),
  notionIntegrationId: z
    .string()
    .min(1, { message: "Notion integration is required." }),
  notionDatabaseId: z
    .string()
    .min(1, { message: "Notion Database ID is required." }),
  // conditions: z.any().optional(), // Placeholder, not actively used in form yet
  messageBody: z.string().min(1, { message: "Message body is required." }),
  destinationId: z.string().min(1, { message: "Destination is required." }),
});

type FormData = z.infer<typeof formSchema>;

function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    control, // For Controller component with Select
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: "",
        notionIntegrationId: "",
        notionDatabaseId: "",
        messageBody: "",
        destinationId: "",
    }
  });

  // Fetch Notion Integrations for Select
  const { data: notionIntegrations, isLoading: isLoadingNotion } = useQuery<
    NotionIntegration[],
    Error
  >({
    queryKey: ["notionIntegrations"],
    queryFn: getNotionIntegrations,
  });

  // Fetch Destinations for Select
  const { data: destinations, isLoading: isLoadingDestinations } = useQuery<
    Destination[],
    Error
  >({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      const templateData: CreateTemplateData = {
        ...formData,
        conditions: {}, // Placeholder for now
      };
      return createTemplate(templateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification template created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      router.push("/templates");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <AppLayout>
      <PageHeader title="Create New Notification Template" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>1. Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., New Task Assigned Notification"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notionIntegrationId">
                Use Notion Integration
              </Label>
              <Controller
                name="notionIntegrationId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoadingNotion || mutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Notion Integration" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingNotion ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        notionIntegrations?.map((integration) => (
                          <SelectItem key={integration.id} value={integration.id}>
                            {integration.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.notionIntegrationId && (
                <p className="text-sm text-red-600">
                  {errors.notionIntegrationId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notionDatabaseId">Target Notion Database ID</Label>
              <Input
                id="notionDatabaseId"
                placeholder="Enter the ID of the Notion Database"
                {...register("notionDatabaseId")}
              />
              {errors.notionDatabaseId && (
                <p className="text-sm text-red-600">
                  {errors.notionDatabaseId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                This is the ID of the database you want to monitor for changes.
                {/* TODO: Replace with dynamic DB selection based on chosen Notion Integration when backend API is ready. */}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Notification Conditions */}
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

        {/* Section 3: Notification Message */}
        <Card>
          <CardHeader>
            <CardTitle>3. Notification Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="messageBody">Message Body</Label>
            <Textarea
              id="messageBody"
              placeholder="Type your notification message here..."
              rows={5}
              {...register("messageBody")}
            />
            {errors.messageBody && (
              <p className="text-sm text-red-600">
                {errors.messageBody.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Placeholders like {"{PropertyName}"} (e.g. {"{Task Name}"}) and {"{_pageUrl}"} can be used.
              Dynamic placeholder suggestions will be added later based on the selected database.
            </p>
          </CardContent>
        </Card>

        {/* Section 4: Send To */}
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
                  defaultValue={field.value}
                  disabled={isLoadingDestinations || mutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Destination Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDestinations ? (
                       <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      destinations?.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name || destination.webhookUrl.substring(0,30) + "..."}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.destinationId && (
              <p className="text-sm text-red-600">
                {errors.destinationId.message}
              </p>
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
            {isSubmitting || mutation.isPending
              ? "Creating..."
              : "Create Template"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}

export default withAuth(NewTemplatePage);
