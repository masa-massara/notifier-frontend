"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { createNotionIntegration } from "@/services/notionIntegrationService";

const formSchema = z.object({
  name: z.string().min(1, { message: "Integration name is required." }),
  token: z.string().min(1, { message: "Notion secret token is required." }),
});

type FormData = z.infer<typeof formSchema>;

function NewNotionIntegrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const mutation = useMutation({
    mutationFn: createNotionIntegration,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notion integration registered successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["notionIntegrations"] });
      router.push("/notion-integrations");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to register Notion integration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <AppLayout>
      <PageHeader title="Register New Notion Integration" />
      <div className="flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
            <CardDescription>
              Provide a name and your Notion integration secret token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Work Notion"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Notion Integration Secret</Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxx"
                  {...register("token")}
                />
                {errors.token && (
                  <p className="text-sm text-red-600">{errors.token.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Find this in your Notion integration's settings.{" "}
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Learn more
                  </a>
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/notion-integrations")}
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
    </AppLayout>
  );
}

export default withAuth(NewNotionIntegrationPage);
