'use client'; // This layout will need to check auth state, so it's a client component

import AppLayout from '@/components/layout/AppLayout'; 
import LoadingSpinner from '@/components/ui/LoadingSpinner'; 
import { useAuthGuard } from '@/hooks/useAuthGuard'; // Adjusted path

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authCheckComplete, isAuthenticated } = useAuthGuard();

  // Show loading spinner if the initial auth check is not yet complete.
  // If authCheckComplete is true but isAuthenticated is false, 
  // the useAuthGuard hook handles redirection.
  // So, we only need to show the spinner while waiting for the check to complete.
  if (!authCheckComplete) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // If auth check is complete and user is authenticated, render the AppLayout.
  // If auth check is complete and user is NOT authenticated, useAuthGuard has already initiated redirect.
  // In that brief moment before redirect completes, this component might return null or previous content,
  // or we can explicitly return null if !isAuthenticated. For simplicity and relying on the hook's redirect:
  if (isAuthenticated) {
    return <AppLayout>{children}</AppLayout>;
  }

  // If authCheckComplete is true, but isAuthenticated is false,
  // the hook is redirecting. Return null to avoid rendering anything during redirection.
  return null; 
}
