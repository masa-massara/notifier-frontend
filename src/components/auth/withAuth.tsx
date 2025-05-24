"use client";

import React, { useEffect } from "react";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { currentUserAtom } from "@/store/globalAtoms";
import AppLayout from "@/components/layout/AppLayout"; // Import AppLayout

// Define a type for the props of the wrapped component
type WrappedComponentProps = {}; // Add any specific props your wrapped components might need

export default function withAuth<P extends WrappedComponentProps>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const currentUser = useAtomValue(currentUserAtom);
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
      // Check if running on client side
      if (typeof window !== "undefined") {
        if (!currentUser) {
          router.replace("/login"); // Use replace to avoid adding to history stack
        } else {
          setIsLoading(false);
        }
      }
    }, [currentUser, router]);

    // Render a loading state or null while checking auth and redirecting
    if (isLoading || !currentUser) {
      return (
        <AppLayout>
          <div className="flex justify-center items-center min-h-screen">
            <p>Loading...</p> {/* Or a more sophisticated loader */}
          </div>
        </AppLayout>
      );
    }

    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
}
