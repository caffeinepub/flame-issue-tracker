import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogIn, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { UserRole } from '../backend';

interface AccessDeniedScreenProps {
  userRole?: UserRole;
}

export default function AccessDeniedScreen({ userRole }: AccessDeniedScreenProps) {
  const isGuest = userRole === UserRole.guest;
  const isUser = userRole === UserRole.user;

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
            
            {isUser && (
              <div className="p-4 bg-muted rounded-md space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Need admin access?</strong> Follow these steps:
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Visit the identity page to view your Principal ID</li>
                  <li>Copy your Principal ID</li>
                  <li>Share it with the site administrator to request admin privileges</li>
                </ol>
                <Link to="/api/whoami">
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                    <ExternalLink className="h-4 w-4" />
                    View My Principal ID
                  </Button>
                </Link>
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
