"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
// AppLayout is now applied by the group's layout.tsx
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
  updateUserPassword,
  signOutUser,
} from "@/services/authService";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/store/globalAtoms";
// import withAuth from "@/components/auth/withAuth"; // HOC Removed

// Validation schema for password change
const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(6, { message: "New password must be at least 6 characters." }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match.",
    path: ["confirmNewPassword"],
  });

type PasswordFormData = z.infer<typeof passwordFormSchema>;

function AccountSettingsPage() {
  const router = useRouter(); // Keep for potential navigation within page
  const { toast } = useToast();
  const currentUser = useAtomValue(currentUserAtom); 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
  });

  const onPasswordChangeSubmit = async (data: PasswordFormData) => {
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      reset(); 
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Password Update Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      // AuthenticatedLayout will handle redirect to /login when currentUser becomes null
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // AuthenticatedLayout handles the loading state until currentUser is resolved.
  // If this component renders, currentUser should be available.
  if (!currentUser) {
    // This should ideally not be seen if AuthenticatedLayout is working correctly.
    return <p>Loading user details...</p>; 
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl"> 
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your current password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onPasswordChangeSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">
                Confirm New Password
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...register("confirmNewPassword")}
              />
              {errors.confirmNewPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Button variant="destructive" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}

export default AccountSettingsPage; // HOC Removed
