import { Badge } from '@/components/ui/badge';
import { ComplaintStatus } from '../backend';

interface StatusTagProps {
  status: ComplaintStatus;
}

export default function StatusTag({ status }: StatusTagProps) {
  const getStatusConfig = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.submitted:
        return { label: 'Submitted', variant: 'default' as const };
      case ComplaintStatus.underReview:
        return { label: 'Under Review', variant: 'secondary' as const };
      case ComplaintStatus.inProgress:
        return { label: 'In Progress', variant: 'outline' as const };
      case ComplaintStatus.resolved:
        return { label: 'Resolved', variant: 'default' as const };
      default:
        return { label: 'Unknown', variant: 'default' as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={
      status === ComplaintStatus.resolved 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800'
        : status === ComplaintStatus.inProgress
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800'
        : status === ComplaintStatus.underReview
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800'
        : ''
    }>
      {config.label}
    </Badge>
  );
}
