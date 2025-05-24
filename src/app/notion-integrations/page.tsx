"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotionIntegrations,
  deleteNotionIntegration,
} from "@/services/notionIntegrationService";
import AppLayout from "@/components/layout/AppLayout";
import PageHeader from "@/components/layout/PageHeader";
import withAuth from "@/components/auth/withAuth";
import { Button } from "@/components/ui/button";
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
  // AlertDialogTrigger, // Removed unused import
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { NotionIntegration } from "@/types/notionIntegration"; // Import the type

function NotionIntegrationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = React.useState<
    string | null
  >(null);

  const {
    data: integrations,
    isLoading,
    error,
  } = useQuery<NotionIntegration[], Error>({
    queryKey: ["notionIntegrations"],
    queryFn: getNotionIntegrations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotionIntegration,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notion integration deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["notionIntegrations"] });
      setShowDeleteDialog(false);
      setSelectedIntegrationId(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description:
          err.message || "Failed to delete Notion integration.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      setSelectedIntegrationId(null);
    },
  });

  const handleDeleteClick = (integrationId: string) => {
    setSelectedIntegrationId(integrationId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedIntegrationId) {
      deleteMutation.mutate(selectedIntegrationId);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Notion Integration Management" />
        <div className="flex justify-center items-center">
          <p>Loading integrations...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Notion Integration Management" />
        <div className="text-red-500">
          Error fetching integrations: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Notion Integration Management"
        actions={
          <Link href="/notion-integrations/new">
            <Button>New Notion Integration</Button>
          </Link>
        }
      />
      {integrations && integrations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Integration Name</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.map((integration) => (
              <TableRow key={integration.id}>
                <TableCell>{integration.name}</TableCell>
                <TableCell>
                  {new Date(integration.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(integration.id)}
                    disabled={deleteMutation.isPending && selectedIntegrationId === integration.id}
                  >
                    {deleteMutation.isPending && selectedIntegrationId === integration.id ? "Deleting..." : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center">
          <p className="mb-4">No Notion integrations found.</p>
          <Link href="/notion-integrations/new">
            <Button>Register New Notion Integration</Button>
          </Link>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Notion integration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedIntegrationId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

export default withAuth(NotionIntegrationsPage);
