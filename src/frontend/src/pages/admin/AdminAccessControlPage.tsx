import AdminRouteGuard from '../../components/admin/AdminRouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, AlertCircle } from 'lucide-react';
import { useGetAdminAllowlist } from '../../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function AdminAccessControlPage() {
  const { data: adminAllowlist, isLoading, error } = useGetAdminAllowlist();

  const handleCopy = async (principalText: string) => {
    try {
      await navigator.clipboard.writeText(principalText);
      toast.success('Principal copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <AdminRouteGuard>
      <div className="container py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground mt-2">
              View and manage the admin access allowlist
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Admin Allowlist</CardTitle>
                  <CardDescription>
                    Principal IDs with administrator access to this application
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load admin allowlist. You may not have permission to view this information.
                  </AlertDescription>
                </Alert>
              ) : adminAllowlist && adminAllowlist.length > 0 ? (
                <div className="space-y-3">
                  {adminAllowlist.map((principal, index) => {
                    const principalText = principal.toText();
                    return (
                      <div
                        key={principalText}
                        className="p-4 bg-muted rounded-lg border space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">
                            Admin Principal #{index + 1}
                          </p>
                          <Button
                            onClick={() => handleCopy(principalText)}
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                        <div className="p-3 bg-background rounded-md border">
                          <p className="font-mono text-xs break-all">{principalText}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No admin principals found in the allowlist.
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  These Principal IDs have full administrative access to manage complaints, publish solutions, and perform other admin functions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
