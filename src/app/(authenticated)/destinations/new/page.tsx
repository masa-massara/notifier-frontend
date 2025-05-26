"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// AppLayout is now applied by the group's layout.tsx
import PageHeader from "@/components/layout/PageHeader";
// import withAuth from "@/components/auth/withAuth"; // HOC Removed
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
import { createDestination } from "@/services/destinationService";
import { useApiClient } from '@/hooks/useApiClient'; // Added import

const formSchema = z.object({
  name: z.string().optional(),
  webhookUrl: z
    .string()
    .min(1, { message: "Webhook URL is required." })
    .url({ message: "Please enter a valid URL." }),
});

type FormData = z.infer<typeof formSchema>;

function NewDestinationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const api = useApiClient(); // Instantiate useApiClient

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // reset, // reset was not used, removing
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Added default values
      name: "",
      webhookUrl: "",
    }
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => createDestination(api, data), // Updated mutationFn
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Destination registered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      router.push("/destinations");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to register destination.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <>
      <PageHeader title="Register New Destination" />
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Destination Details</CardTitle>
            <CardDescription>
              Provide an optional name and the webhook URL for your destination.
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
                  This is the URL that will receive notification data. Ensure it's correct.
                  For services like Slack or Discord, find this in the channel/server settings under "Integrations" or "Webhooks".
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
                  {isSubmitting || mutation.isPending
                    ? "Registering..."
                    : "Register"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default NewDestinationPage; // HOC Removed
