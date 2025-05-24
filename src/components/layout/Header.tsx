"use client";

import { Button } from "@/components/ui/button"; // Assuming Button component is available
import { currentUserAtom } from "@/store/globalAtoms";
import { useAtomValue } from "jotai";
import Link from "next/link";

// Placeholder for App Icon (replace with actual SVG or icon component)
const AppIcon = () => (
	// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="w-6 h-6"
	>
		<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
	</svg>
);

export default function Header() {
	const currentUser = useAtomValue(currentUserAtom);

	return (
		<header className="flex justify-between items-center p-4 border-b">
			<Link href="/" className="flex items-center space-x-2">
				<AppIcon />
				<span className="font-semibold">Notifier App</span>
			</Link>
			<div className="flex items-center space-x-2">
				{currentUser ? (
					<>
						<span>{currentUser.email || "User Name"}</span>
						<Link href="/account/settings">
							<Button variant="outline" size="icon">
								⚙️ {/* Gear Icon */}
							</Button>
						</Link>
					</>
				) : (
					<>
						<Link href="/login">
							<Button variant="outline">Login</Button>
						</Link>
						<Link href="/signup">
							<Button>New Registration</Button>
						</Link>
					</>
				)}
			</div>
		</header>
	);
}
