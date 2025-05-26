"use client";

import type React from "react";
import { useAtomValue } from "jotai";
import { currentUserAtom } from "@/store/globalAtoms";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Placeholder for App Icon (replace with actual SVG or icon component)
const AppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAtomValue(currentUserAtom);
  const isLoggedIn = !!currentUser; // Determine login state

  return (
    <div>
      <Header
        appName="Notifier App"
        appIcon={<AppIcon />}
        loginButtonText="Login"
        signupButtonText="New Registration"
        defaultUserName="User Name"
      />
      <div style={{ display: "flex" }}>
        {isLoggedIn && <Sidebar />}
        <main style={{ flexGrow: 1, padding: "1rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
