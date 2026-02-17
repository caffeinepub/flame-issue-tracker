import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserRole } from '../hooks/useAuthorization';
import { UserRole } from '../backend';
import ProfileSetupDialog from './ProfileSetupDialog';
import PrincipalIndicator from './PrincipalIndicator';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userRole } = useGetCallerUserRole();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isAdmin = userRole === UserRole.admin;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ProfileSetupDialog />
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/assets/generated/flame-issue-tracker-logo.dim_512x512.png" 
                alt="FLAME Issue Tracker" 
                className="h-10 w-10"
              />
              <span className="hidden font-semibold text-lg sm:inline-block">
                FLAME Issue Tracker
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link 
                to="/" 
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
              >
                Complaints
              </Link>
              <Link 
                to="/solutions" 
                className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
              >
                Solutions
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/submit" 
                  className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
                >
                  Submit
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link 
                    to="/admin" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
                  >
                    Admin
                  </Link>
                  <Link 
                    to="/admin/solutions" 
                    className="transition-colors hover:text-foreground/80 text-foreground/60 font-medium"
                  >
                    Manage Solutions
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <PrincipalIndicator />
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="hidden sm:flex"
            >
              {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="container flex flex-col gap-4 py-4">
              <Link 
                to="/" 
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Complaints
              </Link>
              <Link 
                to="/solutions" 
                className="text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/submit" 
                  className="text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Submit Complaint
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link 
                    to="/admin" 
                    className="text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                  <Link 
                    to="/admin/solutions" 
                    className="text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Solutions
                  </Link>
                </>
              )}
              <Button
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={isLoggingIn}
                variant={isAuthenticated ? 'outline' : 'default'}
                size="sm"
                className="w-full"
              >
                {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} FLAME University. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built with <Heart className="h-3 w-3 fill-red-500 text-red-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
