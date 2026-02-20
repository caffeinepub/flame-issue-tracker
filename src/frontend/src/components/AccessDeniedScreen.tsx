import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { UserRole } from '../backend';
import { useGetCallerInfo } from '../hooks/useCallerInfo';
import { useGetAdminAllowlist } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface AccessDeniedScreenProps {
  userRole?: UserRole;
}

export default function AccessDeniedScreen({ userRole }: AccessDeniedScreenProps) {
  const { data: callerInfo, isLoading: callerInfoLoading } = useGetCallerInfo();
  const { data: adminAllowlist, isLoading: allowlistLoading, error: allowlistError } = useGetAdminAllowlist();
  
  const isGuest = userRole === UserRole.guest;
  const isUser = userRole === UserRole.user;

  const principalText = callerInfo?.principal.toText() || '';
  const isAnonymous = principalText === '2vxsx-fae' || !principalText;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Principal copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Check if user's principal is in the allowlist (only if allowlist loaded successfully)
  const isInAllowlist = adminAllowlist && Array.isArray(adminAllowlist) 
    ? adminAllowlist.some((adminPrincipal) => adminPrincipal.toText() === principalText)
    : false;

  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            {isGuest ? (
              <>
                You must be logged in to access this page. Please log in with Internet Identity to continue.
              </>
            ) : isUser ? (
              <>
                You do not have administrator privileges. This area is restricted to administrators only.
              </>
            ) : (
              <>
                You do not have permission to access this page. This area is restricted to administrators only.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full">Return to Complaints Board</Button>
            </Link>
            
            {isUser && !isAnonymous && (
              <div className="p-4 bg-muted rounded-md space-y-3">
                <p className="text-sm font-medium">
                  Need admin access?
                </p>
                <p className="text-sm text-muted-foreground">
                  Share your Principal ID with the site administrator to request admin privileges:
                </p>
                
                {callerInfoLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-background rounded-md border">
                      <p className="text-xs text-muted-foreground mb-1">Your Principal ID:</p>
                      <p className="font-mono text-xs break-all">{principalText}</p>
                    </div>
                    <Button
                      onClick={() => handleCopy(principalText)}
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Your Principal ID
                    </Button>
                  </div>
                )}

                {/* Admin Allowlist Comparison - with robust error handling */}
                <div className="pt-3 border-t space-y-2">
                  <p className="text-sm font-medium">Authorized Admin Principals:</p>
                  {allowlistLoading ? (
                    <Skeleton className="h-16 w-full" />
                  ) : allowlistError || adminAllowlist === null ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Unable to load admin allowlist. Please contact support.
                      </AlertDescription>
                    </Alert>
                  ) : adminAllowlist && adminAllowlist.length > 0 ? (
                    <>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {adminAllowlist.map((principal, index) => {
                          const adminPrincipalText = principal.toText();
                          const isMatch = adminPrincipalText === principalText;
                          return (
                            <div
                              key={adminPrincipalText}
                              className={`p-2 rounded-md border text-xs ${
                                isMatch
                                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                                  : 'bg-background'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Admin #{index + 1}
                                    {isMatch && (
                                      <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                        (This is you!)
                                      </span>
                                    )}
                                  </p>
                                  <p className="font-mono text-xs break-all">{adminPrincipalText}</p>
                                </div>
                                <Button
                                  onClick={() => handleCopy(adminPrincipalText)}
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {!isInAllowlist && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Your Principal ID is not in the authorized admin list. Please contact an administrator to request access.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        No admin principals found in the allowlist. Please contact support.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    You can also view your full identity information:
                  </p>
                  <Link to="/api/whoami">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <ExternalLink className="h-4 w-4" />
                      View Identity Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            {isGuest && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  After logging in, if you still see this message, you may need to request admin access from the site administrator.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
