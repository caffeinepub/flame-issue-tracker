import { ReactNode } from 'react';
import { useGetCallerUserRole } from '../../hooks/useAuthorization';
import { UserRole } from '../../backend';
import AccessDeniedScreen from '../AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { data: userRole, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return (
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (userRole !== UserRole.admin) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
