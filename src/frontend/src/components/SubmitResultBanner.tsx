import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SubmitResultBannerProps {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function SubmitResultBanner({ type, title, message }: SubmitResultBannerProps) {
  return (
    <Alert variant={type === 'error' ? 'destructive' : 'default'} className={
      type === 'success' ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100' : ''
    }>
      {type === 'success' ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
