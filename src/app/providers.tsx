"use client";

import { Provider as JotaiProvider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as QueryClientJotaiProvider } from "jotai-tanstack-query";
import { useAtomValue } from "jotai";
import { customQueryClientAtom } from "@/store/globalAtoms"; // Assuming customQueryClientAtom is exported from here
import React, { useEffect } from "react"; // Added useEffect
import { onAuthStateChangedListener } from "@/services/authService"; // Added import
import { Toaster } from "@/components/ui/toaster"; // Added import for Toaster

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useAtomValue(customQueryClientAtom);

  // Effect to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener();
    // Cleanup function to unsubscribe when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        {/* 
          The QueryClientJotaiProvider is used to synchronize the QueryClient 
          instance between Jotai and TanStack Query. This allows you to use 
          Jotai atoms to interact with the QueryClient, such as reading query 
          state or triggering refetches.
        */}
        <QueryClientJotaiProvider>
          {children}
          <Toaster /> {/* Added Toaster for shadcn/ui toasts */}
        </QueryClientJotaiProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
