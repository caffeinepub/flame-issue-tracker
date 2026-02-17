import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Complaint } from '../backend';
import StatusTag from './StatusTag';
import { getCategoryLabel } from '../lib/complaintTaxonomy';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { AlertCircle, Clock } from 'lucide-react';

interface ComplaintListItemProps {
  complaint: Complaint;
}

export default function ComplaintListItem({ complaint }: ComplaintListItemProps) {
  const timestamp = new Date(Number(complaint.timestamp) / 1_000_000);
  
  return (
    <Link to="/complaint/$complaintId" params={{ complaintId: complaint.id.toString() }}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-semibold line-clamp-2">
              {getCategoryLabel(complaint.category)}
            </CardTitle>
            <StatusTag status={complaint.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {complaint.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              <span className="capitalize">{complaint.urgencyLevel}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
