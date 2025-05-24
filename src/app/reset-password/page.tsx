"use client";

import AppLayout from "@/components/layout/AppLayout";
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
import { sendPasswordReset } from "@/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email({ message: "Invalid email address." }),
});

type FormData = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
	const { toast } = useToast();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit = async (data: FormData) => {
		try {
			await sendPasswordReset(data.email);
			toast({
				title: "Password Reset Email Sent",
				description:
					"If an account exists for this email, a password reset link has been sent.",
			});
			reset(); // Clear the form
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (error: any) {
			console.error(error);
			toast({
				title: "Error Sending Reset Email",
				description: error.message || "An unexpected error occurred.",
				variant: "destructive",
			});
		}
	};

	return (
		<AppLayout>
			<div className="flex justify-center items-center min-h-screen">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle>Reset Password</CardTitle>
						<CardDescription>
							Enter your email address to receive a password reset link.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-red-600 text-sm">{errors.email.message}</p>
								)}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting
									? "Sending Email..."
									: "Send Password Reset Email"}
							</Button>
						</form>
					</CardContent>
					<CardFooter className="text-sm">
						Remember your password?&nbsp;
						<Link href="/login" className="underline">
							Login
						</Link>
					</CardFooter>
				</Card>
			</div>
		</AppLayout>
	);
}
