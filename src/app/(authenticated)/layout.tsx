'use client'; // This layout will need to check auth state, so it's a client component

import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { currentUserAtom } from '@/store/globalAtoms'; 
import AppLayout from '@/components/layout/AppLayout'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner'; 

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAtomValue(currentUserAtom);
  const router = useRouter();
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    // onAuthStateChanged in Providers.tsx updates currentUserAtom.
    // currentUser === undefined: initial state, onAuthStateChanged has not run yet.
    // currentUser === null: onAuthStateChanged ran, and no user is signed in.
    // currentUser === object: onAuthStateChanged ran, and a user is signed in.

    if (currentUser === null) {
      // Explicitly no user after Firebase auth check.
      router.replace('/login');
    } else if (currentUser !== undefined) {
      // User is defined (either an object or null), so auth check is complete.
      // This means onAuthStateChanged has had a chance to run.
      setIsInitialAuthCheckComplete(true);
    }
    // If currentUser is still undefined, we wait for onAuthStateChanged in Providers.tsx
    // to update it. The loading spinner will be shown.
    
  }, [currentUser, router]);

  // Show loading spinner if:
  // 1. The initial auth check is not yet complete (isInitialAuthCheckComplete is false).
  //    This covers the case where currentUser is still undefined because onAuthStateChanged hasn't run.
  // 2. Or if currentUser is null (meaning user is not authenticated, and redirection is about to happen).
  //    This prevents a brief flash of content for unauthenticated users.
  if (!isInitialAuthCheckComplete || currentUser === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // If user is authenticated (currentUser is an object), render the AppLayout with the children.
  // At this point, isInitialAuthCheckComplete is true and currentUser is not null.
  return <AppLayout>{children}</AppLayout>;
}
