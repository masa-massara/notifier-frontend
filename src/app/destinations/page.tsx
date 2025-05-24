"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDestinations,
  deleteDestination,
} from "@/services/destinationService";
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
} from "@/components/ui/alert-dialog"; // AlertDialogTrigger is not used directly here
import { useToast } from "@/hooks/use-toast";
import { Destination } from "@/types/destination";
import { Badge } from "@/components/ui/badge"; // For edit button, or other uses

// Helper to mask URL
const maskUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    // Show domain and first 8 chars of path, and last 4 chars of path if long enough
    let path = parsedUrl.pathname;
    if (path.length > 12) {
      path = `${path.substring(0, 8)}...${path.substring(path.length - 4)}`;
    }
    return `${parsedUrl.protocol}//${parsedUrl.hostname}${path}${parsedUrl.search}${parsedUrl.hash}`;
  } catch (e) {
    // If URL is invalid, return a portion of it to avoid crashing
    if (url.length > 30) return `${url.substring(0, 27)}...`;
    return url;
  }
};

function DestinationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = React.useState<
    string | null
  >(null);

  const {
    data: destinations,
    isLoading,
    error,
  } = useQuery<Destination[], Error>({
    queryKey: ["destinations"],
    queryFn: getDestinations,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Destination deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      setShowDeleteDialog(false);
      setSelectedDestinationId(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete destination.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      setSelectedDestinationId(null);
    },
  });

  const handleDeleteClick = (destinationId: string) => {
    setSelectedDestinationId(destinationId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedDestinationId) {
      deleteMutation.mutate(selectedDestinationId);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageHeader title="Destination Management" />
        <div className="flex justify-center items-center">
          <p>Loading destinations...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <PageHeader title="Destination Management" />
        <div className="text-red-500">
          Error fetching destinations: {error.message}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Destination Management"
        actions={
          <Link href="/destinations/new">
            <Button>New Destination</Button>
          </Link>
        }
      />
      {destinations && destinations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Webhook URL (Masked)</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((destination) => (
              <TableRow key={destination.id}>
                <TableCell>{destination.name || "N/A"}</TableCell>
                <TableCell>{maskUrl(destination.webhookUrl)}</TableCell>
                <TableCell>
                  {new Date(destination.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/destinations/${destination.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(destination.id)}
                    disabled={deleteMutation.isPending && selectedDestinationId === destination.id}
                  >
                    {deleteMutation.isPending && selectedDestinationId === destination.id ? "Deleting..." : "Delete"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center">
          <p className="mb-4">No destinations found.</p>
          <Link href="/destinations/new">
            <Button>Register New Destination</Button>
          </Link>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              destination.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDestinationId(null)}>Cancel</AlertDialogCancel>
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

export default withAuth(DestinationsPage);
