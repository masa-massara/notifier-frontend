"use client";

import { currentUserAtom } from "@/store/globalAtoms";
import { useAtomValue } from "jotai";
import type React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const currentUser = useAtomValue(currentUserAtom);
	const isLoggedIn = !!currentUser; // Determine login state

	return (
		<div>
			<Header />
			<div style={{ display: "flex" }}>
				{isLoggedIn && <Sidebar />}
				<main style={{ flexGrow: 1, padding: "1rem" }}>{children}</main>
			</div>
		</div>
	);
}
