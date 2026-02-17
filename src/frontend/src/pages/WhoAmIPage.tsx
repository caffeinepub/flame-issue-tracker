import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Shield, UserX } from 'lucide-react';
import { useGetCallerInfo } from '../hooks/useCallerInfo';
import { UserRole } from '../backend';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function WhoAmIPage() {
  const { data: callerInfo, isLoading } = useGetCallerInfo();

  const handleCopy = async () => {
    if (!callerInfo) return;
    
    const principalText = callerInfo.principal.toText();
    try {
      await navigator.clipboard.writeText(principalText);
      toast.success('Principal copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.admin:
        return <Shield className="h-4 w-4" />;
      case UserRole.user:
        return <User className="h-4 w-4" />;
      case UserRole.guest:
        return <UserX className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.admin:
        return 'Administrator';
      case UserRole.user:
        return 'Authenticated User';
      case UserRole.guest:
        return 'Guest (Not Logged In)';
    }
  };

  const getRoleVariant = (role: UserRole): 'default' | 'secondary' | 'outline' => {
    switch (role) {
      case UserRole.admin:
        return 'default';
      case UserRole.user:
        return 'secondary';
      case UserRole.guest:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-16">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!callerInfo) {
    return (
      <div className="container max-w-3xl py-16">
        <Card>
          <CardHeader>
            <CardTitle>Unable to Load Identity</CardTitle>
            <CardDescription>
              Could not retrieve your identity information. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const principalText = callerInfo.principal.toText();
  const isAnonymous = principalText === '2vxsx-fae';

  return (
    <div className="container max-w-3xl py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Identity Information</CardTitle>
          <CardDescription>
            View and copy your Internet Computer Principal ID and current role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Badge */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Role</label>
            <div>
              <Badge variant={getRoleVariant(callerInfo.role)} className="gap-2 py-1.5 px-3">
                {getRoleIcon(callerInfo.role)}
                {getRoleLabel(callerInfo.role)}
              </Badge>
            </div>
          </div>

          {/* Principal ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Principal ID</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                {principalText}
              </div>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="gap-2 shrink-0"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* Help Text */}
          {isAnonymous ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>You are not logged in.</strong> The Principal shown above is the anonymous principal. 
                To get your authenticated Principal ID, please log in using Internet Identity.
              </p>
            </div>
          ) : callerInfo.role === UserRole.user ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Need admin access?</strong> Copy your Principal ID above and share it with the site administrator 
                to request admin privileges.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
