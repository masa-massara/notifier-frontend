"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useParams } from "next/navigation"; // useParams to get ID
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react"; // useEffect for pre-filling form

import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getDestination,
  updateDestination,
} from "@/services/destinationService";
import { Destination } from "@/types/destination";

const formSchema = z.object({
  name: z.string().optional(),
  webhookUrl: z
    .string()
    .min(1, { message: "Webhook URL is required." })
    .url({ message: "Please enter a valid URL." }),
});

type FormData = z.infer<typeof formSchema>;

function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // Assuming id is always present
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: destination,
    isLoading: isLoadingDestination,
    error: fetchError,
  } = useQuery<Destination, Error>({
    queryKey: ["destination", id],
    queryFn: () => getDestination(id),
    enabled: !!id, // Only run query if id is available
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset, // To pre-fill the form
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set default values to empty or from fetched data
      name: "",
      webhookUrl: "",
    },
  });

  // Pre-fill form when destination data is loaded
  useEffect(() => {
    if (destination) {
      reset({
        name: destination.name || "",
        webhookUrl: destination.webhookUrl,
      });
    }
  }, [destination, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateDestination(id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Destination updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      queryClient.invalidateQueries({ queryKey: ["destination", id] }); // Invalidate this specific destination
      router.push("/destinations");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update destination.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoadingDestination) {
    return (
      <AppLayout>
        <PageHeader title="Edit Destination" />
        <div className="flex justify-center items-center">
          <p>Loading destination details...</p>
        </div>
      </AppLayout>
    );
  }

  if (fetchError) {
    return (
      <AppLayout>
        <PageHeader title="Edit Destination" />
        <div className="text-red-500">
          Error fetching destination: {fetchError.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title={`Edit Destination: ${destination?.name || "Details"}`}
      />
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Update Destination Details</CardTitle>
            <CardDescription>
              Modify the name or webhook URL for your destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Destination Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Slack Channel"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  placeholder="https://hooks.example.com/..."
                  {...register("webhookUrl")}
                />
                {errors.webhookUrl && (
                  <p className="text-sm text-red-600">
                    {errors.webhookUrl.message}
                  </p>
                )}
                 <p className="text-xs text-muted-foreground">
                  Ensure this URL is correct. Changes will affect where notifications are sent.
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/destinations")}
                  disabled={isSubmitting || mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth(EditDestinationPage);
