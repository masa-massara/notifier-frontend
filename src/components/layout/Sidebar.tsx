"use client";

import { buttonVariants } from "@/components/ui/button"; // Assuming buttonVariants is available
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for classnames
import { currentUserAtom } from "@/store/globalAtoms";
import { useAtomValue } from "jotai";
import Link from "next/link";

export default function Sidebar() {
	const currentUser = useAtomValue(currentUserAtom);

	if (!currentUser) {
		return null; // Sidebar is only visible if user is logged in
	}

	// Define navigation items
	const navItems = [
		{ href: "/templates", label: "Dashboard" }, // Assuming dashboard is /templates
		// { href: "/templates", label: "Notification Template Management" }, // Removed duplicate link
		{ href: "/notion-integrations", label: "Notion Integration Management" },
		{ href: "/destinations", label: "Destination Management" },
		// { href: "/help", label: "Help" }, // Optional
	];

	return (
		<aside className="w-64 p-4 border-r flex flex-col space-y-2">
			<nav className="flex flex-col space-y-1">
				{navItems.map((item) => (
					<Link
						key={item.href + item.label} // Adding label to key for more uniqueness if hrefs can be duplicated for different labels (though not in this case)
						href={item.href}
						className={cn(
							buttonVariants({ variant: "ghost" }), // Using ghost variant for nav links
							"justify-start", // Align text to the start
							// Add active link styling here if needed, e.g., based on current pathname
						)}
					>
						{item.label}
					</Link>
				))}
			</nav>
		</aside>
	);
}
