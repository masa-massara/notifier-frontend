import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { currentUserAtom } from '@/store/globalAtoms'; // Assuming this path is correct

export function useAuthGuard() {
  const currentUser = useAtomValue(currentUserAtom);
  const router = useRouter();
  const [isInitialAuthCheckComplete, setIsInitialAuthCheckComplete] = useState(false);

  useEffect(() => {
    // If currentUser is undefined, it means the initial check from onAuthStateChanged via onAuthStateChangedListener
    // in AppInitializer (or equivalent) hasn't populated the atom yet. We should wait.
    if (currentUser === undefined) {
      setIsInitialAuthCheckComplete(false); // Explicitly not complete
      return; 
    }

    // If currentUser is null, it means the auth check has completed and no user is signed in.
    if (currentUser === null) {
      setIsInitialAuthCheckComplete(true); // Auth check is complete
      router.replace('/login');
    } else {
      // If currentUser is an object, it means a user is signed in.
      setIsInitialAuthCheckComplete(true); // Auth check is complete
    }
  }, [currentUser, router]);

  return {
    authCheckComplete: isInitialAuthCheckComplete,
    // isAuthenticated should only be considered true if the check is complete and user is not null.
    // If check is not complete, isAuthenticated status is effectively 'pending'.
    isAuthenticated: isInitialAuthCheckComplete && currentUser !== null,
  };
}
