"use client";

import withAuth from "@/components/auth/withAuth"; // Import HOC for protection
import AppLayout from "@/components/layout/AppLayout";
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
import { signOutUser, updateUserPassword } from "@/services/authService";
import { currentUserAtom } from "@/store/globalAtoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
	const router = useRouter();
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
			reset(); // Clear the form
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
			router.push("/login");
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error(error);
			toast({
				title: "Logout Failed",
				description: error.message || "An unexpected error occurred.",
				variant: "destructive",
			});
		}
	};

	if (!currentUser) {
		// This is a client-side check.
		// For robust protection, HOC or layout-based protection is better.
		// router.push("/login"); // Or show a loading/unauthorized state
		return (
			<AppLayout>
				<div className="flex justify-center items-center min-h-screen">
					<p>Loading user information...</p>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout>
			<div className="mx-auto p-4 max-w-2xl container">
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>View your account details.</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							<strong>Email:</strong> {currentUser.email}
						</p>
						{/* Add other user details here if needed */}
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
									<p className="text-red-600 text-sm">
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
									<p className="text-red-600 text-sm">
										{errors.newPassword.message}
									</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmNewPassword">Confirm New Password</Label>
								<Input
									id="confirmNewPassword"
									type="password"
									{...register("confirmNewPassword")}
								/>
								{errors.confirmNewPassword && (
									<p className="text-red-600 text-sm">
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
		</AppLayout>
	);
}

export default withAuth(AccountSettingsPage); // Wrap with HOC for route protection
// export default AccountSettingsPage; // Temporarily exporting without HOC for now
// The HOC will be created in the next step.
