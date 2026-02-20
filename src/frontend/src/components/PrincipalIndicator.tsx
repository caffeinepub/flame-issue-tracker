import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, User } from 'lucide-react';
import { useGetCallerInfo } from '../hooks/useCallerInfo';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';

export default function PrincipalIndicator() {
  const { identity } = useInternetIdentity();
  const { data: callerInfo, isLoading } = useGetCallerInfo();

  // Don't show if not authenticated or still loading
  if (!identity || isLoading || !callerInfo) {
    return null;
  }

  const principalText = callerInfo.principal.toText();
  const isAnonymous = principalText === '2vxsx-fae';

  if (isAnonymous) {
    return null;
  }

  const shortPrincipal = `${principalText.slice(0, 5)}...${principalText.slice(-5)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(principalText);
      toast.success('Principal copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
          <User className="h-4 w-4" />
          <span className="font-mono text-xs">{shortPrincipal}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Principal ID</DialogTitle>
          <DialogDescription>
            Your unique Internet Computer identity
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
              {principalText}
            </div>
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="gap-2 w-full"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>
          </div>
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              <strong>Role:</strong> {callerInfo.role}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Share this Principal ID with the site administrator if you need admin access.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
